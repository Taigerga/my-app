import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { listNotifications } from "@/services/notification.service";
import { NotificationList } from "@/components/notifications/NotificationList";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Notifikasi" };

export default async function WorkerNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages, unread } = await listNotifications(session!.user.id, page);

  return (
    <div>
      <PageHeader title="Notifikasi" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <NotificationList items={items} unread={unread} page={page} totalPages={totalPages} base="/worker/notifications" />
    </div>
  );
}
