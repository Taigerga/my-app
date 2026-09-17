"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireWorker } from "./helpers";

export async function markNotificationRead(id: string, redirectTo: string) {
  const { session } = await requireWorker();
  await db.notification.updateMany({ where: { id, userId: session.user.id }, data: { isRead: true } });
  const safe = redirectTo.startsWith("/") ? redirectTo : "/worker";
  redirect(safe);
}

export async function markAllNotificationsRead(redirectTo: string) {
  const { session } = await requireWorker();
  await db.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
  const safe = redirectTo.startsWith("/") ? redirectTo : "/worker";
  revalidatePath(safe);
  redirect(`${safe}?msg=Semua notifikasi ditandai dibaca.`);
}
