"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { requireAdmin } from "./helpers";
import { logActivity, notifyUser } from "./workflow";

const RejectSchema = z.object({
  reason: z.string().min(5, "Alasan penolakan minimal 5 karakter.").max(2000),
});

export type ApprovalEntity = "product" | "article" | "gallery" | "category";

const PUBLIC_PATHS: Record<ApprovalEntity, string[]> = {
  product: ["/products", "/"],
  article: ["/articles", "/"],
  gallery: ["/gallery"],
  category: ["/products"],
};

async function getPending(entity: ApprovalEntity, id: string) {
  if (entity === "product") {
    const row = await db.product.findUnique({
      where: { id },
      select: { id: true, name: true, approvalStatus: true, createdById: true, slug: true },
    });
    if (!row || row.approvalStatus !== "PENDING") throw new Error("Data tidak dalam antrean review.");
    return { ...row, label: row.name, detailHref: `/admin/products/${row.id}` };
  }
  if (entity === "article") {
    const row = await db.article.findUnique({
      where: { id },
      select: { id: true, title: true, approvalStatus: true, createdById: true },
    });
    if (!row || row.approvalStatus !== "PENDING") throw new Error("Data tidak dalam antrean review.");
    return { ...row, label: row.title, detailHref: `/admin/articles/${row.id}` };
  }
  if (entity === "category") {
    const row = await db.category.findUnique({
      where: { id },
      select: { id: true, name: true, approvalStatus: true, createdById: true },
    });
    if (!row || row.approvalStatus !== "PENDING") throw new Error("Data tidak dalam antrean review.");
    return { ...row, label: row.name, detailHref: `/admin/categories` };
  }
  const row = await db.gallery.findUnique({
    where: { id },
    select: { id: true, title: true, approvalStatus: true, createdById: true, url: true },
  });
  if (!row || row.approvalStatus !== "PENDING") throw new Error("Data tidak dalam antrean review.");
  return { ...row, label: row.title, detailHref: `/admin/gallery` };
}

async function setStatus(
  entity: ApprovalEntity,
  id: string,
  data: { approvalStatus: "APPROVED" | "REJECTED"; reviewedById: string; reviewedAt: Date; rejectionReason: string | null },
) {
  if (entity === "product") await db.product.update({ where: { id }, data });
  else if (entity === "article") await db.article.update({ where: { id }, data });
  else if (entity === "category") await db.category.update({ where: { id }, data });
  else await db.gallery.update({ where: { id }, data });
}

/**
 * Terapkan revisi bayangan ke kolom live (kategori/artikel/galeri).
 * Guard konflik slug: bila slug bayangan dipakai pihak lain, slug lama dipertahankan.
 * Kembalikan catatan bila ada bagian yang dilewati.
 */
async function applyPendingRevision(
  entity: Exclude<ApprovalEntity, "product">,
  id: string,
): Promise<{ skippedSlug: boolean; oldThumbnail: string | null }> {
  let skippedSlug = false;
  let oldThumbnail: string | null = null;

  if (entity === "category") {
    const row = await db.category.findUnique({
      where: { id },
      select: { slug: true, pendingName: true, pendingSlug: true, pendingDescription: true },
    });
    if (!row) throw new Error("Data tidak ditemukan.");
    let slug = row.slug;
    if (row.pendingSlug && row.pendingSlug !== row.slug) {
      const taken = await db.category.findFirst({ where: { slug: row.pendingSlug, id: { not: id } }, select: { id: true } });
      if (taken) {
        skippedSlug = true;
      } else {
        slug = row.pendingSlug;
      }
    }
    await db.category.update({
      where: { id },
      data: {
        name: row.pendingName ?? undefined,
        slug,
        // pendingName selalu terisi bila ada revisi (field wajib di form) → null di sini berarti "sengaja dikosongkan".
        description: row.pendingName != null ? row.pendingDescription : undefined,
        pendingName: null,
        pendingSlug: null,
        pendingDescription: null,
      },
    });
  } else if (entity === "article") {
    const row = await db.article.findUnique({
      where: { id },
      select: {
        slug: true, thumbnail: true,
        pendingTitle: true, pendingSlug: true, pendingExcerpt: true,
        pendingContent: true, pendingThumbnail: true,
      },
    });
    if (!row) throw new Error("Data tidak ditemukan.");
    let slug = row.slug;
    if (row.pendingSlug && row.pendingSlug !== row.slug) {
      const taken = await db.article.findFirst({ where: { slug: row.pendingSlug, id: { not: id } }, select: { id: true } });
      if (taken) {
        skippedSlug = true;
      } else {
        slug = row.pendingSlug;
      }
    }
    oldThumbnail = row.thumbnail;
    await db.article.update({
      where: { id },
      data: {
        title: row.pendingTitle ?? undefined,
        slug,
        // pendingTitle selalu terisi bila ada revisi → null di sini berarti "sengaja dikosongkan".
        excerpt: row.pendingTitle != null ? row.pendingExcerpt : undefined,
        content: row.pendingContent ?? undefined,
        thumbnail: row.pendingThumbnail ?? undefined,
        pendingTitle: null,
        pendingSlug: null,
        pendingExcerpt: null,
        pendingContent: null,
        pendingThumbnail: null,
      },
    });
  } else {
    const row = await db.gallery.findUnique({
      where: { id },
      select: { pendingTitle: true, pendingCategory: true },
    });
    if (!row) throw new Error("Data tidak ditemukan.");
    await db.gallery.update({
      where: { id },
      data: {
        title: row.pendingTitle ?? undefined,
        category: row.pendingCategory ?? undefined,
        pendingTitle: null,
        pendingCategory: null,
      },
    });
  }
  return { skippedSlug, oldThumbnail };
}

/** Bersihkan kolom bayangan + file thumbnail pending artikel (buang revisi). */
async function clearPendingRevision(entity: Exclude<ApprovalEntity, "product">, id: string) {
  if (entity === "category") {
    await db.category.update({ where: { id }, data: { pendingName: null, pendingSlug: null, pendingDescription: null } });
  } else if (entity === "article") {
    const row = await db.article.findUnique({ where: { id }, select: { pendingThumbnail: true } });
    await db.article.update({
      where: { id },
      data: { pendingTitle: null, pendingSlug: null, pendingExcerpt: null, pendingContent: null, pendingThumbnail: null },
    });
    if (row?.pendingThumbnail) await getStorage().remove(row.pendingThumbnail).catch(() => undefined);
  } else {
    await db.gallery.update({ where: { id }, data: { pendingTitle: null, pendingCategory: null } });
  }
}

export async function approveSubmission(entity: ApprovalEntity, id: string) {
  const session = await requireAdmin();
  const row = await getPending(entity, id);
  let note = "";
  if (entity !== "product") {
    const applied = await applyPendingRevision(entity, id);
    if (applied.oldThumbnail) {
      await getStorage().remove(applied.oldThumbnail).catch(() => undefined);
    }
    if (applied.skippedSlug) {
      note = " Slug baru dipakai pihak lain sehingga slug lama dipertahankan.";
    }
  }
  await setStatus(entity, id, { approvalStatus: "APPROVED", reviewedById: session.user.id, reviewedAt: new Date(), rejectionReason: null });
  await logActivity({ actorId: session.user.id, action: "APPROVE", entityType: entity, entityId: id, fromStatus: "PENDING", toStatus: "APPROVED", note: note || undefined });
  await notifyUser({
    userId: row.createdById,
    type: "APPROVED",
    title: "Pengajuan disetujui",
    message: `Pengajuan Anda "${row.label}" telah disetujui dan tayang.${note}`,
  });
  for (const p of PUBLIC_PATHS[entity]) revalidatePath(p);
  if (entity === "product") revalidatePath(`/products/${(row as { slug?: string }).slug ?? ""}`);
  if (entity === "article") revalidatePath(`/articles/${(row as { slug?: string }).slug ?? ""}`);
  revalidatePath("/admin");
  revalidatePath("/worker");
  redirect(`/admin/approvals?msg=${encodeURIComponent("Pengajuan disetujui dan sudah tayang." + note)}`);
}

export async function rejectSubmission(entity: ApprovalEntity, id: string, formData: FormData) {
  const session = await requireAdmin();
  const parsed = RejectSchema.safeParse({ reason: formData.get("reason") });
  if (!parsed.success) {
    redirect(`/admin/approvals?msg=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Alasan tidak valid.")}`);
  }
  const row = await getPending(entity, id);
  if (entity !== "product") {
    await clearPendingRevision(entity, id);
  }
  await setStatus(entity, id, { approvalStatus: "REJECTED", reviewedById: session.user.id, reviewedAt: new Date(), rejectionReason: parsed.data.reason });
  await logActivity({
    actorId: session.user.id, action: "REJECT", entityType: entity, entityId: id,
    fromStatus: "PENDING", toStatus: "REJECTED", note: parsed.data.reason,
  });
  await notifyUser({
    userId: row.createdById,
    type: "REJECTED",
    title: "Pengajuan ditolak",
    message: `Pengajuan Anda "${row.label}" ditolak. Alasan: ${parsed.data.reason}`,
    link: "/worker/submissions",
  });
  revalidatePath("/admin");
  revalidatePath("/worker");
  redirect("/admin/approvals?msg=Pengajuan ditolak dan worker telah diberi tahu.");
}

export async function getApprovalQueue() {
  const [products, articles, galleries, categories] = await Promise.all([
    db.product.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { submittedAt: "asc" },
      select: {
        id: true, name: true, slug: true, submittedAt: true,
        category: { select: { name: true } },
        createdBy: { select: { name: true, email: true } },
        _count: { select: { images: true } },
      },
    }),
    db.article.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { submittedAt: "asc" },
      select: {
        id: true, title: true, slug: true, excerpt: true, thumbnail: true, submittedAt: true,
        pendingTitle: true, pendingSlug: true, pendingExcerpt: true, pendingContent: true, pendingThumbnail: true,
        createdBy: { select: { name: true, email: true } },
      },
    }),
    db.gallery.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { submittedAt: "asc" },
      select: {
        id: true, title: true, url: true, category: true, submittedAt: true,
        pendingTitle: true, pendingCategory: true,
        createdBy: { select: { name: true, email: true } },
      },
    }),
    db.category.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { submittedAt: "asc" },
      select: {
        id: true, name: true, slug: true, description: true, submittedAt: true,
        pendingName: true, pendingSlug: true, pendingDescription: true,
        createdBy: { select: { name: true, email: true } },
        _count: { select: { products: true } },
      },
    }),
  ]);
  return { products, articles, galleries, categories, total: products.length + articles.length + galleries.length + categories.length };
}
