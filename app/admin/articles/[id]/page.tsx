import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { updateArticleAction } from "@/lib/actions/articles";
import { adminGetArticle } from "@/services/admin.service";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { ApprovalBadge, draftLock } from "@/components/worker/WorkerBits";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit Artikel" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const article = await adminGetArticle(id);
  if (!article) notFound();
  const lock = draftLock(
    { createdById: article.createdById, approvalStatus: article.approvalStatus, createdBy: article.createdBy },
    session!.user.id,
  );

  return (
    <div>
      <PageHeader title={`Edit: ${article.title}`} />
      <p className="mb-4"><ApprovalBadge status={article.approvalStatus} /></p>
      {lock.locked ? (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Draf milik {lock.ownerName} — hanya pemilik yang boleh mengubah. {lock.orphan ? "Akun pemilik nonaktif: Anda boleh menghapus artikel ini dari daftar." : "Minta pemilik yang mengubah, atau tunggu sampai diajukan untuk review."}
        </p>
      ) : null}
      {article.thumbnail ? (
        <div className="relative mb-4 h-40 w-full max-w-xl overflow-hidden rounded-2xl border border-line">
          <Image src={article.thumbnail} alt="" fill sizes="40vw" className="object-cover" />
        </div>
      ) : null}
      {!lock.locked ? (
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
      ) : null}
    </div>
  );
}
