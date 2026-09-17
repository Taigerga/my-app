"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { InquirySchema } from "@/lib/validations";
import { notifyAdmins } from "./workflow";

export type InquiryResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createInquiryAction(
  _prev: InquiryResult | undefined,
  formData: FormData,
): Promise<InquiryResult> {
  const parsed = InquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    quantity: formData.get("quantity"),
    message: formData.get("message"),
    productId: formData.get("productId"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: "Periksa kembali isian form.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`inquiry:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, error: `Terlalu banyak pengiriman. Coba lagi dalam ${limit.retryAfterSec} detik.` };
  }

  const productId = parsed.data.productId || undefined;
  if (productId) {
    const exists = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!exists) return { ok: false, error: "Produk yang dipilih tidak ditemukan." };
  }

  const created = await db.inquiry.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      whatsapp: parsed.data.whatsapp.trim(),
      quantity: parsed.data.quantity,
      message: parsed.data.message.trim(),
      productId,
    },
  });

  await notifyAdmins({
    type: "INQUIRY_NEW",
    title: `Inquiry baru dari ${created.name}`,
    message: `${created.quantity} pcs — ${created.message.slice(0, 120)}`,
    link: "/admin/inquiries",
  }).catch(() => undefined);

  revalidatePath("/admin");
  revalidatePath("/worker");
  return { ok: true };
}
