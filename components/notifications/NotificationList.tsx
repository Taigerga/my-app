import Link from "next/link";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { AdminPagination } from "@/components/admin/AdminPagination";

export type NotifItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

const TYPE_LABEL: Record<string, string> = {
  SUBMITTED: "Pengajuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  INQUIRY_NEW: "Inquiry",
};

export function NotificationList({
  items,
  unread,
  page,
  totalPages,
  base,
}: {
  items: NotifItem[];
  unread: number;
  page: number;
  totalPages: number;
  base: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">{unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}</p>
        {unread > 0 ? (
          <form action={markAllNotificationsRead.bind(null, base)}>
            <button type="submit" className="rounded-full border border-stone-300 px-4 py-1.5 text-sm hover:border-stone-500">
              Tandai semua dibaca
            </button>
          </form>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
          Belum ada notifikasi.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 ${n.isRead ? "border-line bg-white" : "border-pine/30 bg-moss/40"}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900">
                  <span className="mr-2 rounded-full bg-stone-200/70 px-2 py-0.5 text-xs font-normal text-stone-600">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                  {n.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">{n.message}</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {new Date(n.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex gap-1.5">
                {!n.isRead ? (
                  <form action={markNotificationRead.bind(null, n.id, n.link ?? base)}>
                    <button type="submit" className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                      {n.link ? "Buka" : "Tandai dibaca"}
                    </button>
                  </form>
                ) : n.link ? (
                  <Link href={n.link} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                    Buka
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={(n) => (n > 1 ? `${base}?page=${n}` : base)} />
    </div>
  );
}
