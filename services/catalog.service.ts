import { db } from "@/lib/db";

export const PRODUCT_PAGE_SIZE = 12;

export async function getCategories() {
  return db.category.findMany({
    where: { approvalStatus: "APPROVED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
  });
}

export async function getCategoriesForAdmin() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, approvalStatus: true },
  });
}

export async function listProducts({
  query,
  categorySlug,
  page,
}: {
  query?: string;
  categorySlug?: string;
  page: number;
}) {
  const where = {
    status: "ACTIVE" as const,
    approvalStatus: "APPROVED" as const,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { shortDesc: { contains: query } },
            { material: { contains: query } },
          ],
        }
      : {}),
  };
  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PRODUCT_PAGE_SIZE,
      take: PRODUCT_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDesc: true,
        material: true,
        category: { select: { name: true, slug: true } },
        images: { where: { isMain: true }, take: 1, select: { url: true, alt: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE)) };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "ACTIVE", approvalStatus: "APPROVED" },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDesc: true,
      description: true,
      material: true,
      dimensions: true,
      color: true,
      specifications: true,
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
    },
  });
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  return db.product.findMany({
    where: { status: "ACTIVE", approvalStatus: "APPROVED", category: { slug: categorySlug }, id: { not: excludeId } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      material: true,
      category: { select: { name: true } },
      images: { where: { isMain: true }, take: 1, select: { url: true, alt: true } },
    },
  });
}

export async function getAllActiveProducts() {
  return db.product.findMany({
    where: { status: "ACTIVE", approvalStatus: "APPROVED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
