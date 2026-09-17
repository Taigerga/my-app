import { db } from "@/lib/db";

export async function getPendingApprovalCount() {
  const [products, articles, galleries, categories] = await Promise.all([
    db.product.count({ where: { approvalStatus: "PENDING" } }),
    db.article.count({ where: { approvalStatus: "PENDING" } }),
    db.gallery.count({ where: { approvalStatus: "PENDING" } }),
    db.category.count({ where: { approvalStatus: "PENDING" } }),
  ]);
  return products + articles + galleries + categories;
}

export async function getRecentSubmissions(limit = 6) {
  const [products, articles, galleries] = await Promise.all([
    db.product.findMany({
      where: { approvalStatus: { in: ["PENDING", "REJECTED"] } },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, name: true, approvalStatus: true, updatedAt: true, createdBy: { select: { name: true, email: true } } },
    }),
    db.article.findMany({
      where: { approvalStatus: { in: ["PENDING", "REJECTED"] } },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, approvalStatus: true, updatedAt: true, createdBy: { select: { name: true, email: true } } },
    }),
    db.gallery.findMany({
      where: { approvalStatus: { in: ["PENDING", "REJECTED"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, approvalStatus: true, createdBy: { select: { name: true, email: true } } },
    }),
  ]);
  return [
    ...products.map((p) => ({ kind: "Produk", href: "/admin/approvals?tab=products", ...p, label: p.name })),
    ...articles.map((a) => ({ kind: "Artikel", href: "/admin/approvals?tab=articles", ...a, label: a.title })),
    ...galleries.map((g) => ({ kind: "Galeri", href: "/admin/approvals?tab=gallery", ...g, label: g.title })),
  ].slice(0, limit);
}
