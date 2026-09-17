import { db } from "@/lib/db";

export type ActivityEntity = "product" | "article" | "gallery" | "category" | "inquiry" | "user";

export async function logActivity(input: {
  actorId?: string;
  action: string;
  entityType: ActivityEntity;
  entityId: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
}) {
  await db.activityLog.create({ data: input }).catch(() => undefined);
}

export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  await db.notification.create({ data: input }).catch(() => undefined);
}

export async function notifyAdmins(input: { type: string; title: string; message: string; link?: string }) {
  const admins = await db.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (admins.length === 0) return;
  await db.notification
    .createMany({ data: admins.map((a) => ({ userId: a.id, ...input })) })
    .catch(() => undefined);
}
