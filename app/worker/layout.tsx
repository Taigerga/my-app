import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Newspaper,
  Images,
  Tags,
  Inbox,
  ClipboardList,
  UserRound,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { adminGetCompany } from "@/services/admin.service";
import { NotificationBell } from "@/components/worker/NotificationBell";

const NAV = [
  { href: "/worker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/worker/products", label: "Produk Saya", icon: Package },
  { href: "/worker/articles", label: "Artikel Saya", icon: Newspaper },
  { href: "/worker/gallery", label: "Galeri Saya", icon: Images },
  { href: "/worker/categories", label: "Kategori", icon: Tags },
  { href: "/worker/inquiries", label: "Inquiry", icon: Inbox },
  { href: "/worker/submissions", label: "Pengajuan Saya", icon: ClipboardList },
  { href: "/worker/profile", label: "Profil Akun", icon: UserRound },
];

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "WORKER") {
    redirect("/login?callbackUrl=/worker");
  }
  const role = session.user.role;
  const company = await adminGetCompany();

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="hidden w-60 shrink-0 flex-col bg-pine-deep text-stone-200 md:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          {company?.logoUrl ? (
            <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-md bg-cream p-0.5">
              <Image src={company.logoUrl} alt="" fill sizes="32px" className="object-contain" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cream">{company?.name ?? "Furniture"}</p>
            <p className="truncate text-xs text-stone-400">{session.user.email}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
            {role}
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Navigasi worker">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={17} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-white/10 p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-300 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={17} aria-hidden />
              Keluar
            </button>
          </form>
          <NotificationBell userId={session.user.id} base="/worker" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-line bg-white px-4 py-3 md:hidden">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-900">
            {company?.logoUrl ? (
              <span className="relative block h-6 w-6 shrink-0 overflow-hidden">
                <Image src={company.logoUrl} alt="" fill sizes="24px" className="object-contain" />
              </span>
            ) : null}
            {company?.name ?? "Furniture"}
            <span className="rounded-full bg-pine px-2 py-0.5 text-[10px] font-bold text-white">{role}</span>
          </p>
          <nav className="flex gap-1 overflow-x-auto text-sm" aria-label="Navigasi worker mobile">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-stone-700 hover:bg-stone-100">
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
