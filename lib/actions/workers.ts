"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "./helpers";
import { formValues, type ActionState } from "./helpers";
import { logActivity } from "./workflow";

const CreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").max(100),
  email: z.string().min(1).email("Format email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter.").max(100),
});

const ResetSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter.").max(100),
});

export async function createWorkerAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formValues(formData, ["name", "email", "password"]);
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: { name: raw.name ?? "", email: raw.email ?? "" } };
  }
  const email = parsed.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: "Email sudah dipakai akun lain.", values: { name: raw.name ?? "", email: raw.email ?? "" } };
  }
  const worker = await db.user.create({
    data: { name: parsed.data.name, email, passwordHash: await bcrypt.hash(parsed.data.password, 10), role: "WORKER", isActive: true },
  });
  await logActivity({ action: "CREATE_WORKER", entityType: "user", entityId: worker.id, note: email });
  revalidatePath("/admin/workers");
  redirect("/admin/workers?msg=Akun worker berhasil dibuat.");
}

export async function toggleWorkerActive(id: string, isActive: boolean) {
  const session = await requireAdmin();
  if (id === session.user.id) throw new Error("Tidak dapat menonaktifkan akun sendiri.");
  await db.user.update({ where: { id }, data: { isActive } });
  await logActivity({ actorId: session.user.id, action: isActive ? "ACTIVATE_WORKER" : "DEACTIVATE_WORKER", entityType: "user", entityId: id });
  revalidatePath("/admin/workers");
  redirect(`/admin/workers?msg=Akun worker berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`);
}

export async function resetWorkerPassword(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const parsed = ResetSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password tidak valid." };
  }
  await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) } });
  await logActivity({ actorId: session.user.id, action: "RESET_PASSWORD", entityType: "user", entityId: id });
  revalidatePath("/admin/workers");
  redirect("/admin/workers?msg=Password worker berhasil direset.");
}

export async function listWorkers() {
  const workers = await db.user.findMany({
    where: { role: "WORKER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, isActive: true, createdAt: true,
      _count: { select: { productsCreated: true, articlesCreated: true, galleriesCreated: true } },
    },
  });
  const perWorker = await Promise.all(
    workers.map(async (w) => ({
      ...w,
      pending:
        (await db.product.count({ where: { createdById: w.id, approvalStatus: "PENDING" } })) +
        (await db.article.count({ where: { createdById: w.id, approvalStatus: "PENDING" } })) +
        (await db.gallery.count({ where: { createdById: w.id, approvalStatus: "PENDING" } })),
    })),
  );
  return perWorker;
}
