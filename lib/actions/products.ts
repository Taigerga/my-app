"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { ProductSchema } from "@/lib/validations";
import { formValues, stringValues, requireAdmin, type ActionState } from "./helpers";

const KEYS = [
  "name", "slug", "categoryId", "shortDesc", "description",
  "material", "dimensions", "color", "specifications", "status",
];

function slugTaken(slug: string, excludeId?: string) {
  return db.product.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
}

export async function createProductAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: values };
  }
  if (await slugTaken(parsed.data.slug)) {
    return { error: "Slug sudah dipakai produk lain.", values: values };
  }
  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) return { error: "Kategori tidak ditemukan.", values: values };

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 8) return { error: "Maksimal 8 gambar per produk.", values: values };

  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      categoryId: parsed.data.categoryId,
      shortDesc: parsed.data.shortDesc || null,
      description: parsed.data.description || null,
      material: parsed.data.material || null,
      dimensions: parsed.data.dimensions || null,
      color: parsed.data.color || null,
      specifications: parsed.data.specifications || null,
      status: parsed.data.status,
      featured: parsed.data.featured,
    },
  });

  if (files.length > 0) {
    try {
      const urls = await saveUploads(files, getStorage(), `product-${product.slug}`);
      await db.productImage.createMany({
        data: urls.map((url, i) => ({
          productId: product.id,
          url,
          alt: `${product.name} foto ${i + 1}`,
          sortOrder: i,
          isMain: i === 0,
        })),
      });
    } catch (e) {
      await db.product.delete({ where: { id: product.id } });
      return { error: e instanceof Error ? e.message : "Upload gambar gagal." };
    }
  }

  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?msg=Produk berhasil ditambahkan.");
}

export async function updateProductAction(
  id: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: values };
  }
  if (await slugTaken(parsed.data.slug, id)) {
    return { error: "Slug sudah dipakai produk lain.", values: values };
  }

  await db.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      categoryId: parsed.data.categoryId,
      shortDesc: parsed.data.shortDesc || null,
      description: parsed.data.description || null,
      material: parsed.data.material || null,
      dimensions: parsed.data.dimensions || null,
      color: parsed.data.color || null,
      specifications: parsed.data.specifications || null,
      status: parsed.data.status,
      featured: parsed.data.featured,
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/products?msg=Produk berhasil diperbarui.");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const images = await db.productImage.findMany({ where: { productId: id }, select: { url: true } });
  await db.product.delete({ where: { id } });
  const storage = getStorage();
  await Promise.all(images.map((i) => storage.remove(i.url)));
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?msg=Produk berhasil dihapus.");
}

export async function addProductImagesAction(productId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, name: true, _count: { select: { images: true } } },
  });
  if (!product) redirect(`/admin/products/${productId}?msg=${encodeURIComponent("Produk tidak ditemukan.")}`);

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) redirect(`/admin/products/${productId}?msg=${encodeURIComponent("Pilih minimal satu gambar.")}`);
  if (product._count.images + files.length > 8) {
    redirect(`/admin/products/${productId}?msg=${encodeURIComponent(`Maksimal 8 gambar per produk (saat ini ${product._count.images}).`)}`);
  }

  try {
    const urls = await saveUploads(files, getStorage(), `product-${product.slug}`);
    await db.productImage.createMany({
      data: urls.map((url, i) => ({
        productId,
        url,
        alt: `${product.name} foto ${product._count.images + i + 1}`,
        sortOrder: product._count.images + i,
        isMain: product._count.images === 0 && i === 0,
      })),
    });
  } catch (e) {
    redirect(`/admin/products/${productId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Upload gambar gagal.")}`);
  }

  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${productId}?msg=Gambar berhasil ditambahkan.`);
}

export async function setMainProductImageAction(productId: string, imageId: string) {
  await requireAdmin();
  await db.$transaction([
    db.productImage.updateMany({ where: { productId }, data: { isMain: false } }),
    db.productImage.update({ where: { id: imageId }, data: { isMain: true } }),
  ]);
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${productId}?msg=Gambar utama diperbarui.`);
}

export async function deleteProductImageAction(productId: string, imageId: string) {
  await requireAdmin();
  const image = await db.productImage.findUnique({ where: { id: imageId }, select: { url: true, productId: true, isMain: true } });
  if (!image || image.productId !== productId) throw new Error("Gambar tidak ditemukan.");
  await db.productImage.delete({ where: { id: imageId } });
  await getStorage().remove(image.url);
  if (image.isMain) {
    const next = await db.productImage.findFirst({ where: { productId }, orderBy: { sortOrder: "asc" } });
    if (next) await db.productImage.update({ where: { id: next.id }, data: { isMain: true } });
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${productId}?msg=Gambar dihapus.`);
}

