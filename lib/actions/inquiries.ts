"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "./helpers";

const StatusSchema = z.enum(["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"]);

export async function updateInquiryStatusAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = StatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) throw new Error("Status tidak valid.");
  await db.inquiry.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath("/admin");
  redirect(`/admin/inquiries/${id}?msg=Status inquiry diperbarui.`);
}

export async function deleteInquiryAction(id: string) {
  await requireAdmin();
  await db.inquiry.delete({ where: { id } });
  revalidatePath("/admin");
  redirect("/admin/inquiries?msg=Inquiry berhasil dihapus.");
}
