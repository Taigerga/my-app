import { db } from "@/lib/db";

export const NOTIF_PAGE_SIZE = 15;

export async function listNotifications(userId: string, page: number, onlyUnread = false) {
  const where = { userId, ...(onlyUnread ? { isRead: false } : {}) };
  const [total, items, unread] = await Promise.all([
    db.notification.count({ where }),
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * NOTIF_PAGE_SIZE,
      take: NOTIF_PAGE_SIZE,
    }),
    db.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, total, unread, totalPages: Math.max(1, Math.ceil(total / NOTIF_PAGE_SIZE)) };
}
