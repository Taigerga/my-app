"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { PortfolioSchema } from "@/lib/validations";
import { formValues, stringValues, requireAdmin, type ActionState } from "./helpers";

const KEYS = ["title", "slug", "client", "location", "year", "description"];

export async function createPortfolioAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = PortfolioSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: values };
  }
  if (await db.portfolio.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) {
    return { error: "Slug sudah dipakai portofolio lain.", values: values };
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 10) return { error: "Maksimal 10 gambar per proyek.", values: values };

  const pf = await db.portfolio.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      client: parsed.data.client || null,
      location: parsed.data.location || null,
      year: parsed.data.year ?? null,
      description: parsed.data.description || null,
      featured: parsed.data.featured,
    },
  });

  if (files.length > 0) {
    try {
      const urls = await saveUploads(files, getStorage(), `portfolio-${pf.slug}`);
      await db.portfolioImage.createMany({
        data: urls.map((url, i) => ({ portfolioId: pf.id, url, alt: `${pf.title} ${i + 1}`, sortOrder: i })),
      });
    } catch (e) {
      await db.portfolio.delete({ where: { id: pf.id } });
      return { error: e instanceof Error ? e.message : "Upload gambar gagal." };
    }
  }

  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolios?msg=Portofolio berhasil ditambahkan.");
}

export async function updatePortfolioAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = PortfolioSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: values };
  }
  if (await db.portfolio.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } })) {
    return { error: "Slug sudah dipakai portofolio lain.", values: values };
  }
  await db.portfolio.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      client: parsed.data.client || null,
      location: parsed.data.location || null,
      year: parsed.data.year ?? null,
      description: parsed.data.description || null,
      featured: parsed.data.featured,
    },
  });
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/portfolios?msg=Portofolio berhasil diperbarui.");
}

export async function deletePortfolioAction(id: string) {
  await requireAdmin();
  const images = await db.portfolioImage.findMany({ where: { portfolioId: id }, select: { url: true } });
  await db.portfolio.delete({ where: { id } });
  const storage = getStorage();
  await Promise.all(images.map((i) => storage.remove(i.url)));
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolios?msg=Portofolio berhasil dihapus.");
}

export async function addPortfolioImagesAction(portfolioId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const pf = await db.portfolio.findUnique({
    where: { id: portfolioId },
    select: { id: true, slug: true, title: true, _count: { select: { images: true } } },
  });
  if (!pf) redirect(`/admin/portfolios/${portfolioId}?msg=${encodeURIComponent("Portofolio tidak ditemukan.")}`);
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) redirect(`/admin/portfolios/${portfolioId}?msg=${encodeURIComponent("Pilih minimal satu gambar.")}`);
  if (pf._count.images + files.length > 10) redirect(`/admin/portfolios/${portfolioId}?msg=${encodeURIComponent("Maksimal 10 gambar per proyek.")}`);
  try {
    const urls = await saveUploads(files, getStorage(), `portfolio-${pf.slug}`);
    await db.portfolioImage.createMany({
      data: urls.map((url, i) => ({ portfolioId, url, alt: `${pf.title} ${pf._count.images + i + 1}`, sortOrder: pf._count.images + i })),
    });
  } catch (e) {
    redirect(`/admin/portfolios/${portfolioId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Upload gambar gagal.")}`);
  }
  revalidatePath("/portfolio");
  redirect(`/admin/portfolios/${portfolioId}?msg=Gambar berhasil ditambahkan.`);
}

export async function deletePortfolioImageAction(portfolioId: string, imageId: string) {
  await requireAdmin();
  const image = await db.portfolioImage.findUnique({ where: { id: imageId }, select: { url: true, portfolioId: true } });
  if (!image || image.portfolioId !== portfolioId) throw new Error("Gambar tidak ditemukan.");
  await db.portfolioImage.delete({ where: { id: imageId } });
  await getStorage().remove(image.url);
  revalidatePath("/portfolio");
  redirect(`/admin/portfolios/${portfolioId}?msg=Gambar dihapus.`);
}

