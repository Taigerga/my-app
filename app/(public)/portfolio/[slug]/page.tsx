import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioBySlug, listPortfolios } from "@/services/content.service";
import { ProductGallery } from "@/components/public/ProductGallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pf = await getPortfolioBySlug(slug);
  return pf ? { title: pf.title, description: pf.description?.slice(0, 160) } : { title: "Proyek tidak ditemukan" };
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pf = await getPortfolioBySlug(slug);
  if (!pf) notFound();

  const others = (await listPortfolios()).filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <nav className="text-sm text-stone-500" aria-label="Breadcrumb">
        <Link href="/portfolio" className="hover:text-ink hover:underline">Portofolio</Link>
        {" / "}
        <span className="text-stone-700">{pf.title}</span>
      </nav>
      <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold text-ink">{pf.title}</h1>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {[
          ["Klien", pf.client],
          ["Lokasi", pf.location],
          ["Tahun", pf.year ? String(pf.year) : null],
        ].map(([k, v]) =>
          v ? (
            <div key={k} className="flex gap-2">
              <dt className="text-stone-500">{k}:</dt>
              <dd className="font-medium text-stone-800">{v}</dd>
            </div>
          ) : null,
        )}
      </dl>
      <div className="mt-8">
        <ProductGallery images={pf.images} name={pf.title} />
      </div>
      {pf.description ? (
        <p className="mt-8 max-w-3xl whitespace-pre-line leading-relaxed text-stone-600">{pf.description}</p>
      ) : null}
      {others.length > 0 ? (
        <section className="mt-12" aria-label="Proyek lain">
          <h2 className="font-display text-2xl font-semibold text-ink">Proyek lain</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/portfolio/${o.slug}`}
                  className="block rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:border-ink hover:text-ink"
                >
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
