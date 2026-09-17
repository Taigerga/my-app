"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validations";
import { formValues, requireAdmin, assertAdminCanModify, type ActionState } from "./helpers";

const KEYS = ["name", "slug", "description"];

export async function createCategoryAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  if (await db.category.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) {
    return { error: "Slug sudah dipakai kategori lain.", values: raw };
  }
  await db.category.create({
    data: { name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description || null, createdById: session.user.id },
  });
  revalidatePath("/products");
  redirect("/admin/categories?msg=Kategori berhasil ditambahkan.");
}

export async function updateCategoryAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const current = await db.category.findUnique({ where: { id }, select: { createdById: true, approvalStatus: true } });
  if (!current) return { error: "Kategori tidak ditemukan." };
  try {
    await assertAdminCanModify({ ...current, adminId: session.user.id, kind: "edit" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Akses ditolak." };
  }
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  if (await db.category.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } })) {
    return { error: "Slug sudah dipakai kategori lain.", values: raw };
  }
  await db.category.update({
    where: { id },
    data: { name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description || null },
  });
  revalidatePath("/products");
  redirect("/admin/categories?msg=Kategori berhasil diperbarui.");
}

export async function deleteCategoryAction(id: string) {
  const session = await requireAdmin();
  const row = await db.category.findUnique({ where: { id }, select: { createdById: true, approvalStatus: true } });
  if (!row) throw new Error("Kategori tidak ditemukan.");
  try {
    await assertAdminCanModify({ ...row, adminId: session.user.id, kind: "delete" });
  } catch (e) {
    redirect(`/admin/categories?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  const used = await db.product.count({ where: { categoryId: id } });
  if (used > 0) {
    redirect(`/admin/categories?msg=Kategori masih dipakai ${used} produk, tidak bisa dihapus.`);
  }
  await db.category.delete({ where: { id } });
  revalidatePath("/products");
  redirect("/admin/categories?msg=Kategori berhasil dihapus.");
}
