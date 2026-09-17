import { db } from "@/lib/db";

export async function getWorkerDashboard(userId: string) {
  const mine = { createdById: userId };
  const [products, articles, galleries, pending, approved, rejected, newInquiries, attention] = await Promise.all([
    db.product.count({ where: mine }),
    db.article.count({ where: mine }),
    db.gallery.count({ where: mine }),
    db.product.count({ where: { ...mine, approvalStatus: "PENDING" } }).then(async (p) => {
      const [a, g, c] = await Promise.all([
        db.article.count({ where: { ...mine, approvalStatus: "PENDING" } }),
        db.gallery.count({ where: { ...mine, approvalStatus: "PENDING" } }),
        db.category.count({ where: { ...mine, approvalStatus: "PENDING" } }),
      ]);
      return p + a + g + c;
    }),
    db.product.count({ where: { ...mine, approvalStatus: "APPROVED" } }).then(async (p) => {
      const [a, g, c] = await Promise.all([
        db.article.count({ where: { ...mine, approvalStatus: "APPROVED" } }),
        db.gallery.count({ where: { ...mine, approvalStatus: "APPROVED" } }),
        db.category.count({ where: { ...mine, approvalStatus: "APPROVED" } }),
      ]);
      return p + a + g + c;
    }),
    db.product.count({ where: { ...mine, approvalStatus: "REJECTED" } }).then(async (p) => {
      const [a, g, c] = await Promise.all([
        db.article.count({ where: { ...mine, approvalStatus: "REJECTED" } }),
        db.gallery.count({ where: { ...mine, approvalStatus: "REJECTED" } }),
        db.category.count({ where: { ...mine, approvalStatus: "REJECTED" } }),
      ]);
      return p + a + g + c;
    }),
    db.inquiry.count({ where: { status: "NEW" } }),
    db.product
      .findMany({
        where: { ...mine, approvalStatus: { in: ["PENDING", "REJECTED"] } },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, name: true, approvalStatus: true, rejectionReason: true, updatedAt: true },
      })
      .then(async (prods) => {
        const [arts, gals, cats] = await Promise.all([
          db.article.findMany({
            where: { ...mine, approvalStatus: { in: ["PENDING", "REJECTED"] } },
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: { id: true, title: true, approvalStatus: true, rejectionReason: true, updatedAt: true },
          }),
          db.gallery.findMany({
            where: { ...mine, approvalStatus: { in: ["PENDING", "REJECTED"] } },
            orderBy: { id: "desc" },
            take: 5,
            select: { id: true, title: true, approvalStatus: true, rejectionReason: true },
          }),
          db.category.findMany({
            where: { ...mine, approvalStatus: { in: ["PENDING", "REJECTED"] } },
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: { id: true, name: true, approvalStatus: true, rejectionReason: true, updatedAt: true },
          }),
        ]);
        return [
          ...prods.map((p) => ({ kind: "Produk", ...p, label: p.name })),
          ...arts.map((a) => ({ kind: "Artikel", ...a, label: a.title })),
          ...gals.map((g) => ({ kind: "Galeri", ...g, label: g.title })),
          ...cats.map((c) => ({ kind: "Kategori", ...c, label: c.name })),
        ].slice(0, 8);
      }),
  ]);
  return { products, articles, galleries, pending, approved, rejected, newInquiries, attention };
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({ where: { userId, isRead: false } });
}

export const WORKER_PAGE_SIZE = 10;

export async function workerListProducts(userId: string, page: number) {
  const where = { createdById: userId };
  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * WORKER_PAGE_SIZE,
      take: WORKER_PAGE_SIZE,
      select: {
        id: true, name: true, slug: true, status: true, approvalStatus: true, rejectionReason: true, updatedAt: true,
        category: { select: { name: true } },
        _count: { select: { images: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / WORKER_PAGE_SIZE)) };
}

export async function workerGetProduct(userId: string, id: string, isAdmin: boolean) {
  const p = await db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
  if (!p) return null;
  if (!isAdmin && p.createdById !== userId) return null;
  return p;
}

export async function workerListArticles(userId: string, page: number) {
  const where = { createdById: userId };
  const [total, items] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * WORKER_PAGE_SIZE,
      take: WORKER_PAGE_SIZE,
      select: { id: true, title: true, slug: true, status: true, approvalStatus: true, rejectionReason: true, updatedAt: true, pendingTitle: true, pendingSlug: true },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / WORKER_PAGE_SIZE)) };
}

export async function workerGetArticle(userId: string, id: string, isAdmin: boolean) {
  const a = await db.article.findUnique({ where: { id } });
  if (!a) return null;
  if (!isAdmin && a.createdById !== userId) return null;
  return a;
}

export async function workerListGallery(userId: string, page: number) {
  const where = { createdById: userId };
  const [total, items] = await Promise.all([
    db.gallery.count({ where }),
    db.gallery.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * WORKER_PAGE_SIZE, take: WORKER_PAGE_SIZE, select: { id: true, title: true, url: true, category: true, createdAt: true, approvalStatus: true, rejectionReason: true, pendingTitle: true, pendingCategory: true } }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / WORKER_PAGE_SIZE)) };
}

export async function workerListCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true, createdById: true, approvalStatus: true, rejectionReason: true, pendingName: true, pendingSlug: true, _count: { select: { products: true } } },
  });
}

export async function workerListInquiries({ status, q, page }: { status?: string; q?: string; page: number }) {
  const where = {
    ...(status ? { status: status as "NEW" | "CONTACTED" | "PROCESSING" | "COMPLETED" | "CANCELLED" } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { whatsapp: { contains: q } }] } : {}),
  };
  const [total, items] = await Promise.all([
    db.inquiry.count({ where }),
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * WORKER_PAGE_SIZE,
      take: WORKER_PAGE_SIZE,
      select: {
        id: true, name: true, quantity: true, status: true, createdAt: true,
        product: { select: { name: true } },
        handledBy: { select: { name: true } },
      },
    }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / WORKER_PAGE_SIZE)) };
}

export async function workerGetInquiry(id: string) {
  return db.inquiry.findUnique({
    where: { id },
    include: { product: { select: { name: true, slug: true } }, handledBy: { select: { name: true } } },
  });
}

export async function workerSubmissions(userId: string) {
  const [products, articles, galleries, categories] = await Promise.all([
    db.product.findMany({
      where: { createdById: userId, approvalStatus: { in: ["PENDING", "REJECTED"] } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, approvalStatus: true, rejectionReason: true, submittedAt: true, updatedAt: true },
    }),
    db.article.findMany({
      where: { createdById: userId, approvalStatus: { in: ["PENDING", "REJECTED"] } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, approvalStatus: true, rejectionReason: true, submittedAt: true, updatedAt: true },
    }),
    db.gallery.findMany({
      where: { createdById: userId, approvalStatus: { in: ["PENDING", "REJECTED"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, approvalStatus: true, rejectionReason: true, submittedAt: true },
    }),
    db.category.findMany({
      where: { createdById: userId, approvalStatus: { in: ["PENDING", "REJECTED"] } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, approvalStatus: true, rejectionReason: true, submittedAt: true },
    }),
  ]);
  return [
    ...products.map((p) => ({ kind: "Produk", href: `/worker/products/${p.id}`, ...p, label: p.name })),
    ...articles.map((a) => ({ kind: "Artikel", href: `/worker/articles/${a.id}`, ...a, label: a.title })),
    ...galleries.map((g) => ({ kind: "Galeri", href: `/worker/gallery`, ...g, label: g.title })),
    ...categories.map((c) => ({ kind: "Kategori", href: `/worker/categories`, ...c, label: c.name })),
  ];
}
