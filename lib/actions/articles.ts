"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { cleanContent } from "@/lib/sanitize";
import { ArticleSchema } from "@/lib/validations";
import { formValues, requireAdmin, assertAdminCanModify, type ActionState } from "./helpers";

const KEYS = ["title", "slug", "excerpt", "content", "status"];

export async function createArticleAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
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

  await db.article.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content: cleanContent(parsed.data.content),
      thumbnail,
      status: parsed.data.status,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      authorId: session.user.id,
      createdById: session.user.id,
      approvalStatus: "APPROVED",
    },
  });

  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles?msg=Artikel berhasil ditambahkan.");
}

export async function updateArticleAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const raw = formValues(formData, KEYS);
  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  if (await db.article.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } })) {
    return { error: "Slug sudah dipakai artikel lain.", values: raw };
  }

  const current = await db.article.findUnique({ where: { id }, select: { thumbnail: true, status: true, createdById: true, approvalStatus: true } });
  if (!current) return { error: "Artikel tidak ditemukan." };
  try {
    await assertAdminCanModify({ createdById: current.createdById, approvalStatus: current.approvalStatus, adminId: session.user.id, kind: "edit" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Akses ditolak." };
  }

  const files = formData.getAll("thumbnail").filter((f): f is File => f instanceof File && f.size > 0);
  let thumbnail = current.thumbnail;
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
      publishedAt:
        parsed.data.status === "PUBLISHED" && current.status !== "PUBLISHED" ? new Date() : undefined,
    },
  });

  revalidatePath("/articles");
  revalidatePath(`/articles/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/articles?msg=Artikel berhasil diperbarui.");
}

export async function deleteArticleAction(id: string) {
  const session = await requireAdmin();
  const article = await db.article.findUnique({ where: { id }, select: { thumbnail: true, createdById: true, approvalStatus: true } });
  if (!article) throw new Error("Artikel tidak ditemukan.");
  try {
    await assertAdminCanModify({ createdById: article.createdById, approvalStatus: article.approvalStatus, adminId: session.user.id, kind: "delete" });
  } catch (e) {
    redirect(`/admin/articles?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  if (article?.thumbnail) await getStorage().remove(article.thumbnail).catch(() => undefined);
  await db.article.delete({ where: { id } });
  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles?msg=Artikel berhasil dihapus.");
}
