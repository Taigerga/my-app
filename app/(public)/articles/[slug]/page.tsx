import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/services/content.service";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  return a
    ? {
        title: a.title,
        description: a.excerpt ?? undefined,
        openGraph: {
          title: a.title,
          description: a.excerpt ?? undefined,
          images: a.thumbnail ? [{ url: a.thumbnail }] : undefined,
        },
      }
    : { title: "Artikel tidak ditemukan" };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm text-stone-500" aria-label="Breadcrumb">
        <Link href="/articles" className="hover:text-ink hover:underline">Artikel</Link>
        {" / "}
        <span className="text-stone-700">{article.title}</span>
      </nav>
      <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-ink md:text-4xl">
        {article.title}
      </h1>
      <p className="mt-3 text-sm text-stone-500">
        {article.author?.name ? `${article.author.name} · ` : ""}
        {article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
          : ""}
      </p>
      {article.thumbnail ? (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100">
          <Image
            src={article.thumbnail}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div
        className="prose-stone mt-8 max-w-none text-stone-700 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_img]:rounded-2xl [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-pine [&_blockquote]:pl-4 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
      />
    </main>
  );
}
