import type { Metadata } from "next";
import Link from "next/link";
import { adminListArticles } from "@/services/admin.service";
import { deleteArticleAction } from "@/lib/actions/articles";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { title: "Kelola Artikel" };

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await adminListArticles({ status: status || undefined, page });

  return (
    <div>
      <PageHeader title="Artikel" actionHref="/admin/articles/new" actionLabel="Tulis Artikel" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <form action="/admin/articles" method="get" className="mb-4 flex gap-2">
        <label htmlFor="ar-f" className="sr-only">Filter status</label>
        <select id="ar-f" name="status" defaultValue={status} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
          <option value="">Semua status</option>
          <option value="DRAFT">Draf</option>
          <option value="PUBLISHED">Tayang</option>
        </select>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">Filter</button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
          Belum ada artikel.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">{a.title}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  /{a.slug} · {a.status === "PUBLISHED" ? "Tayang" : "Draf"} · {a.author?.name ?? "—"}
                </p>
              </div>
              <Link href={`/admin/articles/${a.id}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                Edit
              </Link>
              <form action={deleteArticleAction.bind(null, a.id)}>
                <DeleteButton confirmText="Hapus artikel ini?" />
              </form>
            </li>
          ))}
        </ul>
      )}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        href={(n) => {
          const p = new URLSearchParams();
          if (status) p.set("status", status);
          if (n > 1) p.set("page", String(n));
          const s = p.toString();
          return `/admin/articles${s ? `?${s}` : ""}`;
        }}
      />
    </div>
  );
}
