import { db } from "@/lib/db";

export async function listPortfolios() {
  return db.portfolio.findMany({
    orderBy: [{ featured: "desc" }, { year: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      client: true,
      location: true,
      year: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });
}

export async function getPortfolioBySlug(slug: string) {
  return db.portfolio.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      client: true,
      location: true,
      year: true,
      description: true,
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
    },
  });
}

export async function listPublishedArticles() {
  return db.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      thumbnail: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

export async function getArticleBySlug(slug: string) {
  return db.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      thumbnail: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

export async function listGallery() {
  return db.gallery.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, url: true, category: true },
  });
}
