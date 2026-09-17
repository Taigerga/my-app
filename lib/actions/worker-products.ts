"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { ProductSchema } from "@/lib/validations";
import { formValues, stringValues, requireWorker, requireOwnerOrAdmin, type ActionState } from "./helpers";
import { logActivity, notifyAdmins } from "./workflow";

const KEYS = [
  "name", "slug", "categoryId", "shortDesc", "description",
  "material", "dimensions", "color", "specifications", "status",
];

async function ownedProduct(id: string, userId: string, role: string) {
  const p = await db.product.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true, approvalStatus: true, createdById: true, _count: { select: { images: true } } },
  });
  if (!p) throw new Error("Produk tidak ditemukan.");
  requireOwnerOrAdmin(p.createdById, { id: userId, role } as { id: string; role: string });
  return p;
}

export async function createWorkerProduct(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const raw = { ...formValues(formData, KEYS), featured: false };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  if (await db.product.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) {
    return { error: "Slug sudah dipakai produk lain.", values };
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 8) return { error: "Maksimal 8 gambar per produk.", values };

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
      featured: false,
      approvalStatus: "DRAFT",
      createdById: session.user.id,
    },
  });

  if (files.length > 0) {
    try {
      const urls = await saveUploads(files, getStorage(), `product-${product.slug}`);
      await db.productImage.createMany({
        data: urls.map((url, i) => ({
          productId: product.id, url, alt: `${product.name} foto ${i + 1}`, sortOrder: i, isMain: i === 0,
        })),
      });
    } catch (e) {
      await db.product.delete({ where: { id: product.id } });
      return { error: e instanceof Error ? e.message : "Upload gambar gagal." };
    }
  }

  await logActivity({ actorId: session.user.id, action: "CREATE", entityType: "product", entityId: product.id, toStatus: "DRAFT" });
  redirect("/worker/products?msg=Produk tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerProduct(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const { session } = await requireWorker();
  const current = await ownedProduct(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED" && current.approvalStatus !== "APPROVED") {
    redirect(`/worker/products/${id}?msg=${encodeURIComponent("Data yang sedang direview tidak dapat diubah.")}`);
  }
  const raw = { ...formValues(formData, KEYS), featured: false };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  if (await db.product.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } })) {
    return { error: "Slug sudah dipakai produk lain.", values };
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
      // Edit atas data tayang → kembali antre review (sementara turun dari publik).
      ...(current.approvalStatus === "APPROVED"
        ? { approvalStatus: "PENDING" as const, submittedAt: new Date(), rejectionReason: null }
        : {}),
    },
  });
  await logActivity({ actorId: session.user.id, action: "UPDATE", entityType: "product", entityId: id, fromStatus: current.approvalStatus, toStatus: current.approvalStatus === "APPROVED" ? "PENDING" : undefined });
  if (current.approvalStatus === "APPROVED") {
    await notifyAdmins({
      type: "SUBMITTED",
      title: `Revisi produk: ${parsed.data.name}`,
      message: `${session.user.name ?? session.user.email} mengubah produk tayang, menunggu review ulang.`,
      link: "/admin/approvals",
    });
    revalidatePath("/products");
    revalidatePath(`/products/${parsed.data.slug}`);
    revalidatePath("/");
    redirect(`/worker/products/${id}?msg=${encodeURIComponent("Perubahan dikirim untuk review ulang. Produk sementara tidak tampil publik.")}`);
  }
  redirect(`/worker/products/${id}?msg=Perubahan disimpan sebagai draf.`);
}

export async function deleteWorkerProduct(id: string) {
  const { session } = await requireWorker();
  const current = await ownedProduct(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/products?msg=${encodeURIComponent("Hanya draf atau yang ditolak yang dapat dihapus.")}`);
  }
  const images = await db.productImage.findMany({ where: { productId: id }, select: { url: true } });
  await db.product.delete({ where: { id } });
  const storage = getStorage();
  await Promise.all(images.map((i) => storage.remove(i.url)));
  await logActivity({ actorId: session.user.id, action: "DELETE", entityType: "product", entityId: id, fromStatus: current.approvalStatus });
  redirect("/worker/products?msg=Produk dihapus.");
}

/** Ajukan draf/rejected ke antrean review admin. */
export async function submitWorkerProduct(id: string) {
  const { session } = await requireWorker();
  const current = await ownedProduct(id, session.user.id, session.user.role);
  if (current.approvalStatus !== "DRAFT" && current.approvalStatus !== "REJECTED") {
    redirect(`/worker/products?msg=${encodeURIComponent("Hanya draf yang dapat diajukan.")}`);
  }
  await db.product.update({ where: { id }, data: { approvalStatus: "PENDING", submittedAt: new Date(), rejectionReason: null } });
  await logActivity({ actorId: session.user.id, action: "SUBMIT", entityType: "product", entityId: id, fromStatus: current.approvalStatus, toStatus: "PENDING" });
  await notifyAdmins({
    type: "SUBMITTED",
    title: `Pengajuan produk: ${current.name}`,
    message: `${session.user.name ?? session.user.email} mengajukan produk untuk direview.`,
    link: "/admin/approvals",
  });
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/worker/products?msg=Pengajuan terkirim. Menunggu review admin.");
}

export async function addWorkerProductImages(productId: string, formData: FormData): Promise<void> {
  const { session } = await requireWorker();
  const product = await ownedProduct(productId, session.user.id, session.user.role);
  if (product.approvalStatus === "PENDING") {
    redirect(`/worker/products/${productId}?msg=${encodeURIComponent("Data yang sedang direview tidak dapat diubah.")}`);
  }
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) redirect(`/worker/products/${productId}?msg=${encodeURIComponent("Pilih minimal satu gambar.")}`);
  if (product._count.images + files.length > 8) {
    redirect(`/worker/products/${productId}?msg=${encodeURIComponent("Maksimal 8 gambar per produk.")}`);
  }
  try {
    const urls = await saveUploads(files, getStorage(), `product-${product.slug}`);
    await db.productImage.createMany({
      data: urls.map((url, i) => ({
        productId, url, alt: `${product.name} foto ${product._count.images + i + 1}`,
        sortOrder: product._count.images + i, isMain: product._count.images === 0 && i === 0,
      })),
    });
  } catch (e) {
    redirect(`/worker/products/${productId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Upload gagal.")}`);
  }
  redirect(`/worker/products/${productId}?msg=Gambar ditambahkan.`);
}

export async function deleteWorkerProductImage(productId: string, imageId: string) {
  const { session } = await requireWorker();
  const product = await ownedProduct(productId, session.user.id, session.user.role);
  if (product.approvalStatus === "PENDING") {
    redirect(`/worker/products/${productId}?msg=${encodeURIComponent("Data yang sedang direview tidak dapat diubah.")}`);
  }
  const image = await db.productImage.findUnique({ where: { id: imageId }, select: { url: true, productId: true, isMain: true } });
  if (!image || image.productId !== productId) throw new Error("Gambar tidak ditemukan.");
  await db.productImage.delete({ where: { id: imageId } });
  await getStorage().remove(image.url);
  if (image.isMain) {
    const next = await db.productImage.findFirst({ where: { productId }, orderBy: { sortOrder: "asc" } });
    if (next) await db.productImage.update({ where: { id: next.id }, data: { isMain: true } });
  }
  redirect(`/worker/products/${productId}?msg=Gambar dihapus.`);
}
