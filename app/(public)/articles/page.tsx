import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listPublishedArticles } from "@/services/content.service";
import { Reveal } from "@/components/public/Reveal";

export const metadata: Metadata = { title: "Artikel & Berita" };

export default async function ArticlesPage() {
  const items = await listPublishedArticles();
  const [first, ...rest] = items;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-ink">Artikel & Berita</h1>
      <p className="mt-2 max-w-lg text-stone-600">Tips perawatan, panduan memilih furniture, dan kabar workshop.</p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-stone-500" role="status">
          Belum ada artikel tayang.
        </p>
      ) : (
        <>
          {first ? (
            <Reveal>
              <Link
                href={`/articles/${first.slug}`}
                className="group mt-8 grid overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-[0_20px_50px_-24px_rgba(28,25,23,0.4)] md:grid-cols-[1fr_1.4fr]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-100 md:aspect-auto md:min-h-64">
                  {first.thumbnail ? (
                    <Image
                      src={first.thumbnail}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center p-6 md:p-8">
                  {first.publishedAt ? (
                    <time className="text-sm text-stone-500">
                      {new Date(first.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </time>
                  ) : null}
                  <h2 className="font-display mt-2 text-2xl font-semibold text-ink group-hover:underline md:text-3xl">
                    {first.title}
                  </h2>
                  {first.excerpt ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{first.excerpt}</p> : null}
                </div>
              </Link>
            </Reveal>
          ) : null}
          {rest.length > 0 ? (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {rest.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}`} className="group flex items-center gap-4 py-4">
                    {a.thumbnail ? (
                      <span className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:block">
                        <Image src={a.thumbnail} alt="" fill loading="lazy" sizes="10vw" className="object-cover" />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink group-hover:underline">{a.title}</span>
                      {a.excerpt ? <span className="mt-0.5 block truncate text-sm text-stone-500">{a.excerpt}</span> : null}
                    </span>
                    {a.publishedAt ? (
                      <time className="shrink-0 text-sm text-stone-400">
                        {new Date(a.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </main>
  );
}
