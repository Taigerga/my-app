import { db } from "@/lib/db";

export async function getCompanyProfile() {
  return db.companyProfile.findFirst();
}

export async function getFeaturedProducts(limit = 6) {
  return db.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      shortDesc: true,
      material: true,
      category: { select: { name: true, slug: true } },
      images: {
        where: { isMain: true },
        take: 1,
        select: { url: true, alt: true },
      },
    },
  });
}

export async function getPublicCounts() {
  const [products, portfolios, articles] = await Promise.all([
    db.product.count({ where: { status: "ACTIVE" } }),
    db.portfolio.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { products, portfolios, articles };
}
