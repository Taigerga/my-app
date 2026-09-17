"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { GallerySchema } from "@/lib/validations";
import { formValues, requireWorker, requireOwnerOrAdmin, type ActionState } from "./helpers";
import { logActivity, notifyAdmins } from "./workflow";

async function ownedGallery(id: string, userId: string, role: string) {
  const g = await db.gallery.findUnique({
    where: { id },
    select: { id: true, title: true, approvalStatus: true, createdById: true },
  });
  if (!g) throw new Error("Galeri tidak ditemukan.");
  requireOwnerOrAdmin(g.createdById, { id: userId, role } as { id: string; role: string });
  return g;
}

export async function createWorkerGallery(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const files = formData.getAll("image").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Pilih satu gambar." };
  try {
    const [url] = await saveUploads(files.slice(0, 1), getStorage(), "gallery");
    const item = await db.gallery.create({
      data: { title: parsed.data.title, category: parsed.data.category, url, createdById: session.user.id, approvalStatus: "DRAFT" },
    });
    await logActivity({ actorId: session.user.id, action: "CREATE", entityType: "gallery", entityId: item.id, toStatus: "DRAFT" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload gambar gagal." };
  }
  redirect("/worker/gallery?msg=Foto tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerGallery(id: string, formData: FormData): Promise<void> {
  const { session } = await requireWorker();
  const current = await ownedGallery(id, session.user.id, session.user.role);
  if (current.approvalStatus === "PENDING") {
    redirect(`/worker/gallery?msg=${encodeURIComponent("Data yang sedang direview tidak dapat diubah.")}`);
  }
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    redirect(`/worker/gallery?msg=${encodeURIComponent("Judul/kategori galeri tidak valid.")}`);
  }
  const backToPending = current.approvalStatus === "APPROVED";
  // Revisi atas foto tayang → kolom bayangan; versi live tetap tampil publik.
  await db.gallery.update({
    where: { id },
    data: backToPending
      ? {
          pendingTitle: parsed.data.title,
          pendingCategory: parsed.data.category,
          approvalStatus: "PENDING" as const,
          submittedAt: new Date(),
          rejectionReason: null,
        }
      : { title: parsed.data.title, category: parsed.data.category },
  });
  await logActivity({ actorId: session.user.id, action: "UPDATE", entityType: "gallery", entityId: id, fromStatus: current.approvalStatus, toStatus: backToPending ? "PENDING" : undefined });
  if (backToPending) {
    await notifyAdmins({
      type: "SUBMITTED",
      title: `Revisi galeri: ${parsed.data.title}`,
      message: `${session.user.name ?? session.user.email} mengajukan revisi galeri, versi lama tetap tayang.`,
      link: "/admin/approvals?tab=gallery",
    });
  }
  redirect(`/worker/gallery?msg=${encodeURIComponent(backToPending ? "Revisi dikirim untuk review. Versi lama tetap tampil sampai disetujui." : "Galeri diperbarui.")}`);
}

export async function deleteWorkerGallery(id: string) {
  const { session } = await requireWorker();
  const current = await ownedGallery(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/gallery?msg=${encodeURIComponent("Hanya draf atau yang ditolak yang dapat dihapus.")}`);
  }
  const item = await db.gallery.findUnique({ where: { id }, select: { url: true } });
  await db.gallery.delete({ where: { id } });
  if (item) await getStorage().remove(item.url);
  await logActivity({ actorId: session.user.id, action: "DELETE", entityType: "gallery", entityId: id, fromStatus: current.approvalStatus });
  redirect("/worker/gallery?msg=Foto dihapus.");
}

export async function submitWorkerGallery(id: string) {
  const { session } = await requireWorker();
  const current = await ownedGallery(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/gallery?msg=${encodeURIComponent("Hanya draf yang dapat diajukan.")}`);
  }
  await db.gallery.update({ where: { id }, data: { approvalStatus: "PENDING", submittedAt: new Date(), rejectionReason: null } });
  await logActivity({ actorId: session.user.id, action: "SUBMIT", entityType: "gallery", entityId: id, fromStatus: current.approvalStatus, toStatus: "PENDING" });
  await notifyAdmins({
    type: "SUBMITTED",
    title: `Pengajuan galeri: ${current.title}`,
    message: `${session.user.name ?? session.user.email} mengajukan foto untuk direview.`,
    link: "/admin/approvals",
  });
  redirect("/worker/gallery?msg=Pengajuan terkirim. Menunggu review admin.");
}
