import type { Metadata } from "next";
import Link from "next/link";
import { workerListInquiries } from "@/services/worker.service";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { title: "Inquiry" };

const STATUSES = ["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Batal",
};

export default async function WorkerInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await workerListInquiries({ status: status || undefined, q: q || undefined, page });

  const href = (n: number) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return `/worker/inquiries${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader title="Inquiry Pelanggan" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <p className="mb-4 text-sm text-stone-500">Proses inquiry bebas tanpa approval — tercatat atas nama Anda.</p>
      <form action="/worker/inquiries" method="get" className="mb-4 flex flex-wrap gap-2">
        <label htmlFor="wq" className="sr-only">Cari inquiry</label>
        <input
          id="wq"
          name="q"
          defaultValue={q}
          placeholder="Cari nama / email / WA..."
          className="w-full max-w-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
        <label htmlFor="ws" className="sr-only">Filter status</label>
        <select id="ws" name="status" defaultValue={status} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
          <option value="">Semua status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">Filter</button>
      </form>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
          Tidak ada inquiry yang cocok.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((inq) => (
            <li key={inq.id}>
              <Link
                href={`/worker/inquiries/${inq.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white p-3 transition hover:border-stone-400"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{inq.name}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {inq.product?.name ?? "Pertanyaan umum"} · {inq.quantity} pcs ·{" "}
                    {new Date(inq.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {inq.handledBy?.name ? ` · ditangani ${inq.handledBy.name}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                  {STATUS_LABEL[inq.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={href} />
    </div>
  );
}
