import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { updateWorkerArticle, submitWorkerArticle } from "@/lib/actions/worker-articles";
import { workerGetArticle } from "@/services/worker.service";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { ApprovalBadge } from "@/components/worker/WorkerBits";

export const metadata: Metadata = { title: "Edit Artikel" };

export default async function WorkerEditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();
  const isAdmin = session!.user.role === "ADMIN";
  const article = await workerGetArticle(session!.user.id, id, isAdmin);
  if (!article) notFound();
  const locked = article.approvalStatus === "PENDING";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <PageHeader title={`Edit: ${article.title}`} />
        </div>
        <ApprovalBadge status={article.approvalStatus} />
      </div>
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      {article.approvalStatus === "REJECTED" && article.rejectionReason ? (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Ditolak admin. Alasan: {article.rejectionReason} — perbaiki lalu ajukan ulang.
        </p>
      ) : null}
      {article.thumbnail ? (
        <div className="relative mb-4 h-40 w-full max-w-xl overflow-hidden rounded-2xl border border-line">
          <Image src={article.thumbnail} alt="" fill sizes="40vw" className="object-cover" />
        </div>
      ) : null}
      {locked ? (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sedang menunggu review admin — tidak dapat diubah.
        </p>
      ) : (
        <ArticleForm
          action={updateWorkerArticle.bind(null, id)}
          defaults={{
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt ?? "",
            content: article.content,
            status: article.status,
          }}
          submitLabel="Simpan Perubahan"
        />
      )}
      {(article.approvalStatus === "DRAFT" || article.approvalStatus === "REJECTED") && (
        <form action={submitWorkerArticle.bind(null, id)} className="mt-4">
          <button type="submit" className="rounded-full bg-pine px-6 py-2.5 text-sm font-medium text-white transition hover:bg-pine-deep">
            Ajukan untuk Review Admin
          </button>
        </form>
      )}
    </div>
  );
}
