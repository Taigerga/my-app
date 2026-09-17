import { db } from "@/lib/db";

export async function getDashboardStats() {
  const [products, portfolios, articles, inquiries, newInquiries, byStatus] = await Promise.all([
    db.product.count(),
    db.portfolio.count(),
    db.article.count(),
    db.inquiry.count(),
    db.inquiry.count({ where: { status: "NEW" } }),
    db.inquiry.groupBy({ by: ["status"], _count: { status: true } }),
  ]);
  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count.status])) as Record<string, number>;
  return {
    products,
    portfolios,
    articles,
    inquiries,
    newInquiries,
    byStatus: {
      NEW: statusMap.NEW ?? 0,
      CONTACTED: statusMap.CONTACTED ?? 0,
      PROCESSING: statusMap.PROCESSING ?? 0,
      COMPLETED: statusMap.COMPLETED ?? 0,
      CANCELLED: statusMap.CANCELLED ?? 0,
    },
  };
}

export async function getRecentInquiries(limit = 8) {
  return db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      whatsapp: true,
      quantity: true,
      status: true,
      createdAt: true,
      product: { select: { name: true } },
    },
  });
}
