"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validations";
import { formValues, requireWorker, requireOwnerOrAdmin, type ActionState } from "./helpers";
import { logActivity, notifyAdmins } from "./workflow";

const KEYS = ["name", "slug", "description"];

async function ownedCategory(id: string, userId: string, role: string) {
  const c = await db.category.findUnique({
    where: { id },
    select: { id: true, name: true, approvalStatus: true, createdById: true, _count: { select: { products: true } } },
  });
  if (!c) throw new Error("Kategori tidak ditemukan.");
  requireOwnerOrAdmin(c.createdById, { id: userId, role } as { id: string; role: string });
  return c;
}

export async function createWorkerCategory(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  if (await db.category.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) {
    return { error: "Slug sudah dipakai kategori lain.", values: raw };
  }
  const cat = await db.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      createdById: session.user.id,
      approvalStatus: "DRAFT",
    },
  });
  await logActivity({ actorId: session.user.id, action: "CREATE", entityType: "category", entityId: cat.id, toStatus: "DRAFT" });
  revalidatePath("/products");
  redirect("/worker/categories?msg=Kategori tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerCategory(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const current = await ownedCategory(id, session.user.id, session.user.role);
  if (current.approvalStatus === "PENDING") {
    redirect(`/worker/categories?msg=${encodeURIComponent("Data yang sedang direview tidak dapat diubah.")}`);
  }
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  if (await db.category.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } })) {
    return { error: "Slug sudah dipakai kategori lain.", values: raw };
  }
  const backToPending = current.approvalStatus === "APPROVED";
  // Revisi atas data tayang → kolom bayangan; versi live tetap tampil publik.
  await db.category.update({
    where: { id },
    data: backToPending
      ? {
          pendingName: parsed.data.name,
          pendingSlug: parsed.data.slug,
          pendingDescription: parsed.data.description || null,
          approvalStatus: "PENDING" as const,
          submittedAt: new Date(),
          rejectionReason: null,
        }
      : {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description || null,
        },
  });
  await logActivity({ actorId: session.user.id, action: "UPDATE", entityType: "category", entityId: id, fromStatus: current.approvalStatus, toStatus: backToPending ? "PENDING" : undefined });
  if (backToPending) {
    await notifyAdmins({
      type: "SUBMITTED",
      title: `Revisi kategori: ${parsed.data.name}`,
      message: `${session.user.name ?? session.user.email} mengubah kategori tayang, menunggu review ulang.`,
      link: "/admin/approvals?tab=categories",
    });
    revalidatePath("/products");
    redirect(`/worker/categories?msg=${encodeURIComponent("Revisi dikirim untuk review. Versi lama tetap tampil sampai disetujui.")}`);
  }
  revalidatePath("/products");
  redirect("/worker/categories?msg=Kategori berhasil diperbarui.");
}

export async function deleteWorkerCategory(id: string) {
  const { session } = await requireWorker();
  const current = await ownedCategory(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/categories?msg=${encodeURIComponent("Hanya draf atau yang ditolak yang dapat dihapus.")}`);
  }
  if (current._count.products > 0) {
    redirect(`/worker/categories?msg=${encodeURIComponent("Kategori masih dipakai produk, tidak bisa dihapus.")}`);
  }
  await db.category.delete({ where: { id } });
  await logActivity({ actorId: session.user.id, action: "DELETE", entityType: "category", entityId: id, fromStatus: current.approvalStatus });
  revalidatePath("/products");
  redirect("/worker/categories?msg=Kategori dihapus.");
}

export async function submitWorkerCategory(id: string) {
  const { session } = await requireWorker();
  const current = await ownedCategory(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/categories?msg=${encodeURIComponent("Hanya draf yang dapat diajukan.")}`);
  }
  await db.category.update({ where: { id }, data: { approvalStatus: "PENDING", submittedAt: new Date(), rejectionReason: null } });
  await logActivity({ actorId: session.user.id, action: "SUBMIT", entityType: "category", entityId: id, fromStatus: current.approvalStatus, toStatus: "PENDING" });
  await notifyAdmins({
    type: "SUBMITTED",
    title: `Pengajuan kategori: ${current.name}`,
    message: `${session.user.name ?? session.user.email} mengajukan kategori untuk direview.`,
    link: "/admin/approvals?tab=categories",
  });
  redirect("/worker/categories?msg=Pengajuan terkirim. Menunggu review admin.");
}
