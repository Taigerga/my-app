import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getApprovalQueue, approveSubmission, rejectSubmission } from "@/lib/actions/approvals";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Approval Pengajuan" };

const TABS = [
  { key: "products", label: "Produk" },
  { key: "articles", label: "Artikel" },
  { key: "gallery", label: "Galeri" },
  { key: "categories", label: "Kategori" },
] as const;

function dateFmt(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Tampilkan perubahan revisi sebagai "lama → baru"; baris tak berubah disembunyikan. */
function RevisionDiff({ pairs }: { pairs: { label: string; from?: string | null; to?: string | null }[] }) {
  const changed = pairs.filter((p) => (p.to ?? null) !== (p.from ?? null) && p.to != null);
  if (changed.length === 0) {
    return <p className="mt-2 text-xs text-stone-400">Pengajuan baru (belum ada versi tayang yang diubah).</p>;
  }
  return (
    <dl className="mt-2 space-y-1 rounded-lg bg-stone-50 px-3 py-2 text-xs">
      {changed.map((p) => (
        <div key={p.label} className="flex flex-wrap gap-x-2">
          <dt className="text-stone-500">{p.label}:</dt>
          <dd className="text-stone-400 line-through">{p.from ?? "—"}</dd>
          <dd aria-hidden>→</dd>
          <dd className="font-medium text-pine-deep">{p.to}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "articles" || sp.tab === "gallery" || sp.tab === "categories" ? sp.tab : "products";
  const queue = await getApprovalQueue();

  return (
    <div>
      <PageHeader title={`Approval Pengajuan (${queue.total} menunggu)`} />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <div className="mb-4 flex gap-2" role="tablist" aria-label="Jenis pengajuan">
        {TABS.map((t) => {
          const count =
            t.key === "products" ? queue.products.length
            : t.key === "articles" ? queue.articles.length
            : t.key === "gallery" ? queue.galleries.length
            : queue.categories.length;
          return (
            <Link
              key={t.key}
              href={`/admin/approvals?tab=${t.key}`}
              role="tab"
              aria-selected={tab === t.key}
              className={`rounded-full px-4 py-1.5 text-sm transition ${tab === t.key ? "bg-ink font-medium text-white" : "border border-stone-300 text-stone-600 hover:border-stone-500"}`}
            >
              {t.label} ({count})
            </Link>
          );
        })}
      </div>

      {queue.total === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
          Antrean kosong. Semua pengajuan sudah direview.
        </p>
      ) : null}

      {tab === "products" && (
        <ul className="space-y-2">
          {queue.products.map((p) => (
            <li key={p.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">{p.name}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {p.category.name} · {p._count.images} foto · oleh {p.createdBy.name ?? p.createdBy.email} · diajukan {dateFmt(p.submittedAt)}
                  </p>
                </div>
                <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                  Periksa Detail
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <form action={approveSubmission.bind(null, "product", p.id)}>
                  <button type="submit" className="rounded-full bg-pine px-4 py-1.5 text-sm font-medium text-white transition hover:bg-pine-deep">
                    Setujui & Tayangkan
                  </button>
                </form>
                <form action={rejectSubmission.bind(null, "product", p.id)} className="flex flex-1 flex-wrap items-center gap-2">
                  <label htmlFor={`rej-p-${p.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-p-${p.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan penolakan (wajib)..."
                    className="min-w-52 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-red-400"
                  />
                  <button type="submit" className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "articles" && (
        <ul className="space-y-2">
          {queue.articles.map((a) => (
            <li key={a.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">{a.title}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    oleh {a.createdBy.name ?? a.createdBy.email} · diajukan {dateFmt(a.submittedAt)}
                  </p>
                  {a.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-stone-600">{a.excerpt}</p> : null}
                  <RevisionDiff
                    pairs={[
                      { label: "Judul", from: a.title, to: a.pendingTitle },
                      { label: "Slug", from: a.slug, to: a.pendingSlug },
                      { label: "Ringkasan", from: a.excerpt, to: a.pendingExcerpt },
                      { label: "Konten", from: "versi tayang", to: a.pendingContent ? "versi revisi" : null },
                      { label: "Thumbnail", from: a.thumbnail ? "ada" : "tidak ada", to: a.pendingThumbnail ? "diganti" : null },
                    ]}
                  />
                </div>
                <Link href={`/admin/articles/${a.id}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                  Periksa Detail
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <form action={approveSubmission.bind(null, "article", a.id)}>
                  <button type="submit" className="rounded-full bg-pine px-4 py-1.5 text-sm font-medium text-white transition hover:bg-pine-deep">
                    Setujui & Tayangkan
                  </button>
                </form>
                <form action={rejectSubmission.bind(null, "article", a.id)} className="flex flex-1 flex-wrap items-center gap-2">
                  <label htmlFor={`rej-a-${a.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-a-${a.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan penolakan (wajib)..."
                    className="min-w-52 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-red-400"
                  />
                  <button type="submit" className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "gallery" && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {queue.galleries.map((g) => (
            <li key={g.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <span className="relative block aspect-[4/3] bg-stone-100">
                <Image src={g.url} alt={g.title} fill loading="lazy" sizes="30vw" className="object-cover" />
              </span>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-stone-900">{g.title}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {g.category} · oleh {g.createdBy.name ?? g.createdBy.email} · {dateFmt(g.submittedAt)}
                </p>
                <RevisionDiff
                  pairs={[
                    { label: "Judul", from: g.title, to: g.pendingTitle },
                    { label: "Kategori", from: g.category, to: g.pendingCategory },
                  ]}
                />
                <div className="mt-2 flex gap-1.5">
                  <form action={approveSubmission.bind(null, "gallery", g.id)} className="flex-1">
                    <button type="submit" className="w-full rounded-lg bg-pine px-2 py-1.5 text-xs font-medium text-white hover:bg-pine-deep">
                      Setujui
                    </button>
                  </form>
                </div>
                <form action={rejectSubmission.bind(null, "gallery", g.id)} className="mt-1.5 flex gap-1.5">
                  <label htmlFor={`rej-g-${g.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-g-${g.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan tolak..."
                    className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs outline-none focus:border-red-400"
                  />
                  <button type="submit" className="shrink-0 rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "categories" && (
        <ul className="space-y-2">
          {queue.categories.map((c) => (
            <li key={c.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">{c.name}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    /{c.slug} · {c._count.products} produk · oleh {c.createdBy.name ?? c.createdBy.email} · diajukan {dateFmt(c.submittedAt)}
                  </p>
                  {c.description ? <p className="mt-1 line-clamp-2 text-sm text-stone-600">{c.description}</p> : null}
                  <RevisionDiff
                    pairs={[
                      { label: "Nama", from: c.name, to: c.pendingName },
                      { label: "Slug", from: c.slug, to: c.pendingSlug },
                      { label: "Deskripsi", from: c.description, to: c.pendingDescription },
                    ]}
                  />
                </div>
                <Link href="/admin/categories" className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                  Lihat Kategori
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                <form action={approveSubmission.bind(null, "category", c.id)}>
                  <button type="submit" className="rounded-full bg-pine px-4 py-1.5 text-sm font-medium text-white transition hover:bg-pine-deep">
                    Setujui & Tayangkan
                  </button>
                </form>
                <form action={rejectSubmission.bind(null, "category", c.id)} className="flex flex-1 flex-wrap items-center gap-2">
                  <label htmlFor={`rej-c-${c.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-c-${c.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan penolakan (wajib)..."
                    className="min-w-52 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-red-400"
                  />
                  <button type="submit" className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
