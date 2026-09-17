import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Briefcase,
  Newspaper,
  Images,
  Inbox,
  Building2,
  ClipboardCheck,
  UsersRound,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { adminGetCompany } from "@/services/admin.service";
import { NotificationBell } from "@/components/worker/NotificationBell";
import { getPendingApprovalCount } from "@/services/approval.service";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approval", icon: ClipboardCheck, badge: "pending" },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/categories", label: "Kategori", icon: Tags },
  { href: "/admin/portfolios", label: "Portofolio", icon: Briefcase },
  { href: "/admin/articles", label: "Artikel", icon: Newspaper },
  { href: "/admin/gallery", label: "Galeri", icon: Images },
  { href: "/admin/inquiries", label: "Inquiry", icon: Inbox },
  { href: "/admin/workers", label: "Kelola Worker", icon: UsersRound },
  { href: "/admin/company-profile", label: "Profil Perusahaan", icon: Building2 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?callbackUrl=/admin");
  const company = await adminGetCompany();
  const pendingCount = await getPendingApprovalCount();

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="hidden w-60 shrink-0 flex-col bg-ink text-stone-200 md:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          {company?.logoUrl ? (
            <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-md bg-cream p-0.5">
              <Image src={company.logoUrl} alt="" fill sizes="32px" className="object-contain" />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-cream">{company?.name ?? "Furniture Admin"}</p>
            <p className="truncate text-xs text-stone-400">{session.user.email}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Navigasi admin">
          {NAV.map(({ href, label, icon: Icon, ...rest }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={17} aria-hidden />
              <span className="flex-1">{label}</span>
              {"badge" in rest && pendingCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              ) : null}
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
          <NotificationBell userId={session.user.id} base="/admin" />
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
            {company?.name ?? "Furniture Admin"}
          </p>
          <nav className="flex gap-1 overflow-x-auto text-sm" aria-label="Navigasi admin mobile">
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
