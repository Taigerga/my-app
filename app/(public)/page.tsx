import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hammer, Ruler, Truck } from "lucide-react";
import { getCompanyProfile, getFeaturedProducts, getPublicCounts } from "@/services/public.service";
import { listPortfolios, listPublishedArticles } from "@/services/content.service";
import { ProductCard } from "@/components/public/ProductCard";
import { Reveal } from "@/components/public/Reveal";
import { FloatingDecor } from "@/components/public/FloatingDecor";

const MATERIALS = ["Jati Solid", "Rotan", "Multiplek HPL", "Besi Powder-Coating", "Kain Linen", "Finishing Duco"];

export default async function HomePage() {
  const [company, featured, counts, portfolios, articles] = await Promise.all([
    getCompanyProfile(),
    getFeaturedProducts(5),
    getPublicCounts(),
    listPortfolios(),
    listPublishedArticles(),
  ]);
  const featuredPortfolios = portfolios.slice(0, 3);
  const latestArticles = articles.slice(0, 3);
  // Kartu mini overlap: rotasi 3 produk (putar ulang bila kurang), statis bila cuma 1.
  const miniPool = featured.slice(1);
  const miniSlides =
    miniPool.length > 1
      ? [miniPool[0], miniPool[1 % miniPool.length], miniPool[2 % miniPool.length]]
      : miniPool;
  const miniCycle = miniSlides.length * 4;

  return (
    <main>
      {/* HERO: split asimetris, muat dalam viewport */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden px-4 pb-14 pt-10 md:grid-cols-[1.05fr_1fr] md:pt-16">
        <FloatingDecor />
        <div className="relative">
          <h1 className="anim-hero-rise font-display text-4xl font-semibold leading-[1.08] text-ink md:text-6xl">
            Furniture custom yang <em className="text-pine">dibangun</em> untuk bertahan.
          </h1>
          <p className="anim-hero-rise delay-1 mt-4 max-w-md leading-relaxed text-stone-600">
            {company?.tagline ?? "Desain minimal, material jujur, pengerjaan rapi untuk rumah dan kantor."}
          </p>
          <div className="anim-hero-rise delay-2 mt-7 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-pine px-6 py-3 text-sm font-medium text-white transition hover:bg-pine-deep active:translate-y-[1px]"
            >
              Lihat Katalog
            </Link>
            <Link
              href="/portfolio"
              className="group flex items-center gap-1.5 rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
            >
              Proyek Kami
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <dl className="anim-hero-rise delay-3 mt-9 flex gap-8">
            {[
              { v: counts.products, l: "Produk aktif" },
              { v: counts.portfolios, l: "Proyek selesai" },
              { v: counts.articles, l: "Artikel" },
            ].map((s) => (
              <div key={s.l}>
                <dd className="font-display text-3xl font-semibold text-ink">{s.v}</dd>
                <dt className="mt-1 text-sm text-stone-500">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <div className="anim-hero-image relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-200 sm:aspect-[5/4] md:aspect-[4/5]">
            {company?.heroImageUrl || featured[0]?.images[0] ? (
              <Image
                src={company?.heroImageUrl ?? featured[0].images[0].url}
                alt={company?.heroImageUrl ? `Workshop ${company?.name ?? "furniture"}` : (featured[0].images[0].alt ?? featured[0].name)}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            ) : null}
          </div>
          {miniSlides.length > 0 ? (
            <div className="anim-hero-rise delay-4 absolute -bottom-6 -left-4 hidden w-52 overflow-hidden rounded-2xl border-4 border-cream bg-white shadow-[0_20px_50px_-20px_rgba(28,25,23,0.4)] sm:block">
              <div className="relative aspect-[4/3] w-full">
                {miniSlides.map((p, i) => (
                  <Link
                    key={`${p.id}-${i}`}
                    href={`/products/${p.slug}`}
                    aria-hidden={i > 0}
                    tabIndex={i > 0 ? -1 : undefined}
                    style={miniSlides.length > 1 ? { animationDelay: `${i * 4}s`, animationDuration: `${miniCycle}s` } : undefined}
                    className={miniSlides.length > 1 ? "anim-mini-slide absolute inset-0" : "absolute inset-0"}
                  >
                    {p.images[0] ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.images[0].alt ?? p.name}
                        fill
                        loading="lazy"
                        sizes="208px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>
                ))}
              </div>
              <div aria-hidden className="relative h-8 px-3 py-2">
                {miniSlides.map((p, i) => (
                  <span
                    key={`${p.id}-cap-${i}`}
                    style={miniSlides.length > 1 ? { animationDelay: `${i * 4}s`, animationDuration: `${miniCycle}s` } : undefined}
                    className={
                      miniSlides.length > 1
                        ? "anim-mini-slide absolute inset-x-3 top-2 truncate text-xs font-medium text-stone-700"
                        : "absolute inset-x-3 top-2 truncate text-xs font-medium text-stone-700"
                    }
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* MARQUEE material (satu-satunya di halaman).
          Seamless: dua blok identik, tanpa gap container — tiap item punya
          padding simetris sendiri sehingga -50% mendarat tepat di awal blok 2.
          Isi tiap blok diulang 3x agar selalu lebih lebar dari viewport
          (mencegah sisi kanan kosong & lompatan di tengah). */}
      <div className="overflow-hidden border-y border-line bg-white py-3">
        <div className="anim-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {[...MATERIALS, ...MATERIALS, ...MATERIALS].map((m, i) => (
                <span key={`${m}-${i}`} className="flex items-center text-sm font-medium tracking-wide text-stone-500">
                  <span className="px-6">{m}</span>
                  <span className="text-pine">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PRODUK UNGGULAN: grid asimetris */}
      <section className="mx-auto max-w-6xl px-4 py-16" aria-label="Produk unggulan">
        <Reveal>
          <div className="mb-7 flex items-end justify-between">
            <h2 className="font-display max-w-md text-3xl font-semibold text-ink">
              Dibuat di workshop, dipilih untuk ruang Anda
            </h2>
            <Link href="/products" className="hidden shrink-0 text-sm font-medium text-pine hover:underline sm:block">
              Semua produk
            </Link>
          </div>
        </Reveal>
        {featured.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500">
            Belum ada produk aktif. Tambahkan via dashboard admin.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.06, 0.24)} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <ProductCard product={p} large={i === 0} />
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      {/* PROSES: gambar + langkah berurutan */}
      <section className="border-y border-line bg-white" aria-label="Cara kerja">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <Reveal className="relative min-h-72 overflow-hidden rounded-2xl bg-stone-200">
            <Image
              src="https://picsum.photos/seed/furniture-workshop-craft/900/700"
              alt="Suasana workshop pengerjaan furniture"
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-display text-3xl font-semibold text-ink">Dari konsultasi sampai terkirim</h2>
            </Reveal>
            <ol className="mt-6 space-y-5">
              {[
                { icon: Ruler, t: "Konsultasi & ukur", d: "Ceritakan kebutuhan dan ukuran ruang Anda via form atau WhatsApp." },
                { icon: Hammer, t: "Produksi di workshop", d: "Material dipotong, dirakit, dan difinishing oleh tukang berpengalaman." },
                { icon: Truck, t: "Antar & pasang", d: "Kami antar, pasang, dan pastikan semuanya presisi di tempat." },
              ].map((s, i) => (
                <Reveal key={s.t} delay={i * 0.08}>
                  <li className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss text-pine">
                      <s.icon size={18} aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-ink">
                        <span className="mr-2 text-sm text-stone-400">0{i + 1}</span>
                        {s.t}
                      </p>
                      <p className="mt-1 max-w-md text-sm leading-relaxed text-stone-600">{s.d}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PORTOFOLIO: deret horizontal */}
      {featuredPortfolios.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16" aria-label="Proyek pilihan">
          <Reveal>
            <h2 className="font-display max-w-md text-3xl font-semibold text-ink">Proyek yang sudah kami kerjakan</h2>
          </Reveal>
          <ul className="mt-7 grid gap-4 md:grid-cols-3">
            {featuredPortfolios.map((pf, i) => (
              <Reveal key={pf.id} delay={i * 0.08}>
                <li>
                  <Link
                    href={`/portfolio/${pf.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(28,25,23,0.35)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      {pf.images[0] ? (
                        <Image
                          src={pf.images[0].url}
                          alt={pf.images[0].alt ?? pf.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-ink group-hover:underline">{pf.title}</h3>
                      <p className="mt-1 text-sm text-stone-500">
                        {[pf.client, pf.location, pf.year].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ARTIKEL: baris editorial */}
      {latestArticles.length > 0 ? (
        <section className="border-t border-line bg-white" aria-label="Artikel terbaru">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold text-ink">Cerita dari workshop</h2>
            </Reveal>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {latestArticles.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-ink group-hover:underline">{a.title}</h3>
                      {a.excerpt ? <p className="mt-1 truncate text-sm text-stone-500">{a.excerpt}</p> : null}
                    </div>
                    {a.publishedAt ? (
                      <time className="shrink-0 text-sm text-stone-400">
                        {new Date(a.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="rounded-2xl bg-pine px-6 py-12 text-center text-white md:py-16">
            <h2 className="font-display mx-auto max-w-xl text-3xl font-semibold leading-tight">
              Punya ukuran atau desain khusus?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-200">
              Kirim inquiry, tim kami balas maksimal 1×24 jam pada jam operasional.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-pine-deep transition hover:bg-cream active:translate-y-[1px]"
            >
              Kirim Inquiry
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
