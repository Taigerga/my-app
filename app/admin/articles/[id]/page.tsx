import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { updateArticleAction } from "@/lib/actions/articles";
import { adminGetArticle } from "@/services/admin.service";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Edit Artikel" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await adminGetArticle(id);
  if (!article) notFound();

  return (
    <div>
      <PageHeader title={`Edit: ${article.title}`} />
      {article.thumbnail ? (
        <div className="relative mb-4 h-40 w-full max-w-xl overflow-hidden rounded-2xl border border-line">
          <Image src={article.thumbnail} alt="" fill sizes="40vw" className="object-cover" />
        </div>
      ) : null}
      <ArticleForm
        action={updateArticleAction.bind(null, id)}
        defaults={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          content: article.content,
          status: article.status,
        }}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
