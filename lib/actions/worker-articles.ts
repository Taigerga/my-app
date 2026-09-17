"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { ArticleSchema } from "@/lib/validations";
import { formValues, requireWorker, requireOwnerOrAdmin, type ActionState } from "./helpers";
import { cleanContent } from "@/lib/sanitize";
import { logActivity, notifyAdmins } from "./workflow";

const KEYS = ["title", "slug", "excerpt", "content", "status"];

async function ownedArticle(id: string, userId: string, role: string) {
  const a = await db.article.findUnique({
    where: { id },
    select: { id: true, slug: true, title: true, approvalStatus: true, createdById: true },
  });
  if (!a) throw new Error("Artikel tidak ditemukan.");
  requireOwnerOrAdmin(a.createdById, { id: userId, role } as { id: string; role: string });
  return a;
}

export async function createWorkerArticle(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const raw = formValues(formData, KEYS);
  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  if (await db.article.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) {
    return { error: "Slug sudah dipakai artikel lain.", values: raw };
  }

  const files = formData.getAll("thumbnail").filter((f): f is File => f instanceof File && f.size > 0);
  let thumbnail: string | null = null;
  if (files.length > 0) {
    try {
      const [url] = await saveUploads(files.slice(0, 1), getStorage(), `article-${parsed.data.slug}`);
      thumbnail = url;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Upload thumbnail gagal.", values: raw };
    }
  }

  const article = await db.article.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content: cleanContent(parsed.data.content),
      thumbnail,
      status: parsed.data.status,
      publishedAt: null,
      authorId: session.user.id,
      createdById: session.user.id,
      approvalStatus: "DRAFT",
    },
  });
  await logActivity({ actorId: session.user.id, action: "CREATE", entityType: "article", entityId: article.id, toStatus: "DRAFT" });
  redirect("/worker/articles?msg=Artikel tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerArticle(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const current = await ownedArticle(id, session.user.id, session.user.role);
  if (current.approvalStatus === "PENDING") {
    redirect(`/worker/articles/${id}?msg=${encodeURIComponent("Data yang sedang direview tidak dapat diubah.")}`);
  }
  const raw = formValues(formData, KEYS);
  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  if (await db.article.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } })) {
    return { error: "Slug sudah dipakai artikel lain.", values: raw };
  }

  const existing = await db.article.findUnique({ where: { id }, select: { thumbnail: true, pendingThumbnail: true } });
  const files = formData.getAll("thumbnail").filter((f): f is File => f instanceof File && f.size > 0);
  const backToPending = current.approvalStatus === "APPROVED";

  // Revisi atas artikel tayang → kolom bayangan; versi live tetap tampil publik.
  if (backToPending) {
    let pendingThumbnail: string | null = null;
    if (files.length > 0) {
      try {
        const [url] = await saveUploads(files.slice(0, 1), getStorage(), `article-${parsed.data.slug}`);
        pendingThumbnail = url;
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Upload thumbnail gagal.", values: raw };
      }
    }
    await db.article.update({
      where: { id },
      data: {
        pendingTitle: parsed.data.title,
        pendingSlug: parsed.data.slug,
        pendingExcerpt: parsed.data.excerpt || null,
        pendingContent: cleanContent(parsed.data.content),
        ...(pendingThumbnail ? { pendingThumbnail } : {}),
        approvalStatus: "PENDING",
        submittedAt: new Date(),
        rejectionReason: null,
      },
    });
    await logActivity({ actorId: session.user.id, action: "UPDATE", entityType: "article", entityId: id, fromStatus: "APPROVED", toStatus: "PENDING" });
    await notifyAdmins({
      type: "SUBMITTED",
      title: `Revisi artikel: ${parsed.data.title}`,
      message: `${session.user.name ?? session.user.email} mengajukan revisi artikel, versi lama tetap tayang.`,
      link: "/admin/approvals?tab=articles",
    });
    revalidatePath("/worker");
    redirect(`/worker/articles/${id}?msg=${encodeURIComponent("Revisi dikirim untuk review. Versi lama tetap tampil sampai disetujui.")}`);
  }

  let thumbnail = existing?.thumbnail ?? null;
  if (files.length > 0) {
    try {
      const [url] = await saveUploads(files.slice(0, 1), getStorage(), `article-${parsed.data.slug}`);
      if (thumbnail) await getStorage().remove(thumbnail);
      thumbnail = url;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Upload thumbnail gagal.", values: raw };
    }
  }

  await db.article.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content: cleanContent(parsed.data.content),
      thumbnail,
      status: parsed.data.status,
    },
  });
  await logActivity({ actorId: session.user.id, action: "UPDATE", entityType: "article", entityId: id, fromStatus: current.approvalStatus });
  redirect(`/worker/articles/${id}?msg=Perubahan disimpan sebagai draf.`);
}

export async function deleteWorkerArticle(id: string) {
  const { session } = await requireWorker();
  const current = await ownedArticle(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/articles?msg=${encodeURIComponent("Hanya draf atau yang ditolak yang dapat dihapus.")}`);
  }
  const article = await db.article.findUnique({ where: { id }, select: { thumbnail: true, pendingThumbnail: true } });
  if (article?.thumbnail) await getStorage().remove(article.thumbnail).catch(() => undefined);
  if (article?.pendingThumbnail) await getStorage().remove(article.pendingThumbnail).catch(() => undefined);
  await db.article.delete({ where: { id } });
  await logActivity({ actorId: session.user.id, action: "DELETE", entityType: "article", entityId: id, fromStatus: current.approvalStatus });
  redirect("/worker/articles?msg=Artikel dihapus.");
}

export async function submitWorkerArticle(id: string) {
  const { session } = await requireWorker();
  const current = await ownedArticle(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/articles?msg=${encodeURIComponent("Hanya draf yang dapat diajukan.")}`);
  }
  await db.article.update({ where: { id }, data: { approvalStatus: "PENDING", submittedAt: new Date(), rejectionReason: null } });
  await logActivity({ actorId: session.user.id, action: "SUBMIT", entityType: "article", entityId: id, fromStatus: current.approvalStatus, toStatus: "PENDING" });
  await notifyAdmins({
    type: "SUBMITTED",
    title: `Pengajuan artikel: ${current.title}`,
    message: `${session.user.name ?? session.user.email} mengajukan artikel untuk direview.`,
    link: "/admin/approvals",
  });
  revalidatePath("/articles");
  redirect("/worker/articles?msg=Pengajuan terkirim. Menunggu review admin.");
}
