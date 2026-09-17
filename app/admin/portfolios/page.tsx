import type { Metadata } from "next";
import Link from "next/link";
import { adminListPortfolios } from "@/services/admin.service";
import { deletePortfolioAction } from "@/lib/actions/portfolios";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { title: "Kelola Portofolio" };

export default async function AdminPortfoliosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await adminListPortfolios({ page });

  return (
    <div>
      <PageHeader title="Portofolio" actionHref="/admin/portfolios/new" actionLabel="Tambah Proyek" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
          Belum ada portofolio.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">
                  {p.title}
                  {p.featured ? <span className="ml-2 rounded-full bg-moss px-2 py-0.5 text-xs text-pine-deep">Unggulan</span> : null}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {[p.client, p.year ? String(p.year) : null].filter(Boolean).join(" · ") || "—"} · {p._count.images} foto
                </p>
              </div>
              <Link href={`/admin/portfolios/${p.id}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                Edit
              </Link>
              <form action={deletePortfolioAction.bind(null, p.id)}>
                <DeleteButton confirmText="Hapus proyek ini beserta fotonya?" />
              </form>
            </li>
          ))}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={(n) => (n > 1 ? `/admin/portfolios?page=${n}` : "/admin/portfolios")} />
    </div>
  );
}
