import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listPortfolios } from "@/services/content.service";
import { Reveal } from "@/components/public/Reveal";

export const metadata: Metadata = { title: "Portofolio Proyek" };

export default async function PortfolioPage() {
  const items = await listPortfolios();
  const [first, ...rest] = items;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-ink">Portofolio Proyek</h1>
      <p className="mt-2 max-w-lg text-stone-600">Rumah, kantor, dan institusi yang mempercayakan furniture kepada kami.</p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-stone-500" role="status">
          Belum ada portofolio. Tambahkan via dashboard admin.
        </p>
      ) : (
        <>
          {first ? (
            <Reveal>
              <Link
                href={`/portfolio/${first.slug}`}
                className="group mt-8 grid overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-[0_20px_50px_-24px_rgba(28,25,23,0.4)] md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 md:aspect-auto md:min-h-80">
                  {first.images[0] ? (
                    <Image
                      src={first.images[0].url}
                      alt={first.images[0].alt ?? first.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <p className="text-sm text-stone-500">{[first.client, first.year].filter(Boolean).join(" · ")}</p>
                  <h2 className="font-display mt-2 text-3xl font-semibold text-ink group-hover:underline">{first.title}</h2>
                  {first.location ? <p className="mt-2 text-sm text-stone-500">{first.location}</p> : null}
                </div>
              </Link>
            </Reveal>
          ) : null}
          {rest.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((pf, i) => (
                <Reveal key={pf.id} delay={Math.min(i * 0.06, 0.18)}>
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
                        <p className="mt-1 text-sm text-stone-500">{[pf.client, pf.location, pf.year].filter(Boolean).join(" · ")}</p>
                      </div>
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </main>
  );
}
