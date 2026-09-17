"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signOut } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { AccountSchema, ChangePasswordSchema } from "@/lib/validations";
import { formValues, requireWorker, type ActionState } from "./helpers";

export async function updateAccountAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const redirectTo = typeof formData.get("redirectTo") === "string" && (formData.get("redirectTo") as string).startsWith("/") ? (formData.get("redirectTo") as string) : "/admin/company-profile";
  const raw = formValues(formData, ["name", "email"]);
  const parsed = AccountSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }

  const email = parsed.data.email.toLowerCase();
  const taken = await db.user.findFirst({ where: { email, id: { not: session.user.id } }, select: { id: true } });
  if (taken) return { error: "Email sudah dipakai akun lain.", values: raw };

  const current = await db.user.findUnique({ where: { id: session.user.id }, select: { email: true } });
  await db.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name, email } });

  if (current && current.email.toLowerCase() !== email) {
    await signOut({ redirectTo: "/login?msg=" + encodeURIComponent("Email berubah, silakan login kembali.") });
    return {};
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/worker", "layout");
  redirect(`${redirectTo}?msg=Profil akun berhasil diperbarui.`);
}

export async function changePasswordAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const redirectTo = typeof formData.get("redirectTo") === "string" && (formData.get("redirectTo") as string).startsWith("/") ? (formData.get("redirectTo") as string) : "/admin/company-profile";
  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const limit = rateLimit(`password:${session.user.id}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return { error: `Terlalu banyak percobaan. Coba lagi dalam ${limit.retryAfterSec} detik.` };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user) return { error: "Akun tidak ditemukan." };
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Password saat ini salah." };

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });

  redirect(`${redirectTo}?msg=Password berhasil diganti. Sesi Anda tetap aktif.`);
}
