"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { GallerySchema } from "@/lib/validations";
import { formValues, requireAdmin, type ActionState } from "./helpers";

export async function createGalleryAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const files = formData.getAll("image").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Pilih satu gambar." };
  try {
    const [url] = await saveUploads(files.slice(0, 1), getStorage(), "gallery");
    await db.gallery.create({ data: { title: parsed.data.title, category: parsed.data.category, url } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload gambar gagal." };
  }
  revalidatePath("/gallery");
  redirect("/admin/gallery?msg=Foto berhasil ditambahkan.");
}

export async function updateGalleryAction(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    redirect(`/admin/gallery?msg=${encodeURIComponent("Judul/kategori galeri tidak valid.")}`);
  }
  await db.gallery.update({ where: { id }, data: { title: parsed.data.title, category: parsed.data.category } });
  revalidatePath("/gallery");
  redirect("/admin/gallery?msg=Galeri berhasil diperbarui.");
}

export async function deleteGalleryAction(id: string) {
  await requireAdmin();
  const item = await db.gallery.findUnique({ where: { id }, select: { url: true } });
  await db.gallery.delete({ where: { id } });
  if (item) await getStorage().remove(item.url);
  revalidatePath("/gallery");
  redirect("/admin/gallery?msg=Foto berhasil dihapus.");
}
