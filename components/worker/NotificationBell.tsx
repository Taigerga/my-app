import Link from "next/link";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/services/worker.service";

export async function NotificationBell({ userId, base }: { userId: string; base: "/admin" | "/worker" }) {
  const unread = await getUnreadCount(userId);
  return (
    <Link
      href={`${base}/notifications`}
      aria-label={unread > 0 ? `${unread} notifikasi belum dibaca` : "Notifikasi"}
      className="relative rounded-lg p-2 text-stone-300 transition hover:bg-white/10 hover:text-white"
    >
      <Bell size={18} aria-hidden />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
