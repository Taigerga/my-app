import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { adminListProducts } from "@/services/admin.service";
import { deleteProductAction } from "@/lib/actions/products";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ApprovalBadge, draftLock, DraftLockNote } from "@/components/worker/WorkerBits";

export const metadata: Metadata = { title: "Kelola Produk" };

const STATUS_LABEL: Record<string, string> = { ACTIVE: "Aktif", DRAFT: "Draf", ARCHIVED: "Arsip" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const meId = session!.user.id;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await adminListProducts({ q: q || undefined, status: status || undefined, page });

  const href = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return `/admin/products${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader title="Produk" actionHref="/admin/products/new" actionLabel="Tambah Produk" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <form action="/admin/products" method="get" className="mb-4 flex flex-wrap gap-2">
        <label htmlFor="pq" className="sr-only">Cari produk</label>
        <input
          id="pq"
          name="q"
          defaultValue={q}
          placeholder="Cari nama / slug..."
          className="w-full max-w-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          aria-label="Filter status"
        >
          <option value="">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="DRAFT">Draf</option>
          <option value="ARCHIVED">Arsip</option>
        </select>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
          Belum ada produk. Klik Tambah Produk untuk membuat yang pertama.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => {
            const lock = draftLock(p, meId);
            return (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">
                  {p.name}
                  {p.featured ? <span className="ml-2 rounded-full bg-moss px-2 py-0.5 text-xs text-pine-deep">Unggulan</span> : null}
                  <span className="ml-2"><ApprovalBadge status={p.approvalStatus} /></span>
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {p.category.name} · {STATUS_LABEL[p.status]} · {p._count.images} foto · {p._count.inquiries} inquiry · oleh {p.createdBy.name ?? p.createdBy.email}
                </p>
                {lock.locked ? <div className="mt-1"><DraftLockNote ownerName={lock.ownerName} orphan={lock.orphan} /></div> : null}
              </div>
              {!lock.locked ? (
              <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                Edit
              </Link>
              ) : null}
              {!lock.locked || lock.orphan ? (
              <form action={deleteProductAction.bind(null, p.id)}>
                <DeleteButton confirmText="Hapus produk ini beserta fotonya?" />
              </form>
              ) : null}
            </li>
            );
          })}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={href} />
    </div>
  );
}
