import type { Metadata } from "next";
import { createWorkerArticle } from "@/lib/actions/worker-articles";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Tulis Artikel" };

export default function WorkerNewArticlePage() {
  return (
    <div>
      <PageHeader title="Tulis Artikel" />
      <p className="mb-4 text-sm text-stone-500">Artikel tersimpan sebagai draf dan perlu approval admin sebelum tayang.</p>
      <ArticleForm action={createWorkerArticle} submitLabel="Simpan Draf" />
    </div>
  );
}
