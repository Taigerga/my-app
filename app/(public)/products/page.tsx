import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, listProducts, PRODUCT_PAGE_SIZE } from "@/services/catalog.service";
import { ProductCard } from "@/components/public/ProductCard";

export const metadata: Metadata = { title: "Katalog Produk" };

function pageHref(q: string, cat: string, page: number) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (cat) p.set("cat", cat);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return `/products${s ? `?${s}` : ""}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const cat = sp.cat ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [categories, { items, total, totalPages }] = await Promise.all([
    getCategories(),
    listProducts({ query: q || undefined, categorySlug: cat || undefined, page }),
  ]);
  const safePage = Math.min(page, totalPages);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-ink">Katalog Produk</h1>
      <p className="mt-2 text-sm text-stone-500">
        {total} produk{total !== 1 ? "" : ""} · tanpa harga, tanya langsung via inquiry
      </p>

      <form action="/products" method="get" className="mt-6 flex gap-2" role="search">
        {cat ? <input type="hidden" name="cat" value={cat} /> : null}
        <label htmlFor="q" className="sr-only">
          Cari produk
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Cari kursi, meja, jati..."
          className="w-full max-w-md rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-pine focus:ring-2 focus:ring-pine/25"
        />
        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-[1px]"
        >
          Cari
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter kategori">
        <Link
          href={pageHref(q, "", 1)}
          aria-current={!cat ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            !cat ? "bg-pine font-medium text-white" : "border border-stone-300 text-stone-600 hover:border-ink hover:text-ink"
          }`}
        >
          Semua
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={pageHref(q, c.slug, 1)}
            aria-current={cat === c.slug ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              cat === c.slug
                ? "bg-pine font-medium text-white"
                : "border border-stone-300 text-stone-600 hover:border-ink hover:text-ink"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center" role="status">
          <p className="font-medium text-ink">Tidak ada produk yang cocok</p>
          <p className="mt-1 text-sm text-stone-500">Coba kata kunci atau kategori lain.</p>
        </div>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
          {totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(q, cat, n)}
                  aria-current={n === safePage ? "page" : undefined}
                  aria-label={`Halaman ${n}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                    n === safePage
                      ? "bg-pine font-medium text-white"
                      : "border border-stone-300 text-stone-600 hover:border-ink"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          ) : null}
          <p className="mt-4 text-center text-xs text-stone-400">
            Menampilkan {(safePage - 1) * PRODUCT_PAGE_SIZE + 1}–{Math.min(safePage * PRODUCT_PAGE_SIZE, total)} dari {total}
          </p>
        </>
      )}
    </main>
  );
}
