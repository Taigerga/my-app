import type { Metadata } from "next";
import { createArticleAction } from "@/lib/actions/articles";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Tulis Artikel" };

export default function NewArticlePage() {
  return (
    <div>
      <PageHeader title="Tulis Artikel" />
      <ArticleForm action={createArticleAction} submitLabel="Simpan Artikel" />
    </div>
  );
}
