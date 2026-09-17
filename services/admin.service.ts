import { db } from "@/lib/db";

export const ADMIN_PAGE_SIZE = 10;

export async function adminListProducts({ q, status, page }: { q?: string; status?: string; page: number }) {
  const where = {
    ...(status ? { status: status as "ACTIVE" | "DRAFT" | "ARCHIVED" } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] } : {}),
  };
  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true, name: true, slug: true, status: true, featured: true, updatedAt: true,
        approvalStatus: true, createdById: true,
        category: { select: { name: true } },
        createdBy: { select: { name: true, email: true, isActive: true } },
        _count: { select: { images: true, inquiries: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function adminGetProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true, createdBy: { select: { name: true, email: true, isActive: true } } },
  });
}

export async function adminListCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true, approvalStatus: true, pendingName: true, createdById: true, createdBy: { select: { name: true, email: true, isActive: true } }, _count: { select: { products: true } } },
  });
}

export async function adminListPortfolios({ page }: { page: number }) {
  const [total, items] = await Promise.all([
    db.portfolio.count(),
    db.portfolio.findMany({
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true, title: true, slug: true, client: true, year: true, featured: true, updatedAt: true,
        _count: { select: { images: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function adminGetPortfolio(id: string) {
  return db.portfolio.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
}

export async function adminListArticles({ status, page }: { status?: string; page: number }) {
  const where = status ? { status: status as "DRAFT" | "PUBLISHED" } : {};
  const [total, items] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true, title: true, slug: true, status: true, publishedAt: true, updatedAt: true,
        approvalStatus: true, pendingTitle: true, createdById: true,
        author: { select: { name: true } },
        createdBy: { select: { name: true, email: true, isActive: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function adminGetArticle(id: string) {
  return db.article.findUnique({
    where: { id },
    include: { createdBy: { select: { name: true, email: true, isActive: true } } },
  });
}

export async function adminListGallery({ category, page }: { category?: string; page: number }) {
  const where = category ? { category } : {};
  const [total, items] = await Promise.all([
    db.gallery.count({ where }),
    db.gallery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true, title: true, url: true, category: true, createdAt: true,
        approvalStatus: true, pendingTitle: true, createdById: true,
        createdBy: { select: { name: true, email: true, isActive: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function adminListInquiries({ status, q, page }: { status?: string; q?: string; page: number }) {
  const where = {
    ...(status ? { status: status as "NEW" | "CONTACTED" | "PROCESSING" | "COMPLETED" | "CANCELLED" } : {}),
    ...(q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { whatsapp: { contains: q } }] }
      : {}),
  };
  const [total, items] = await Promise.all([
    db.inquiry.count({ where }),
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true, name: true, email: true, whatsapp: true, quantity: true,
        status: true, createdAt: true, product: { select: { name: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function adminGetInquiry(id: string) {
  return db.inquiry.findUnique({
    where: { id },
    include: { product: { select: { name: true, slug: true } } },
  });
}

export async function adminGetCompany() {
  return db.companyProfile.findFirst();
}

export async function adminGetCurrentUser(id: string) {
  return db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
}
