import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { workerListArticles } from "@/services/worker.service";
import { deleteWorkerArticle, submitWorkerArticle } from "@/lib/actions/worker-articles";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ApprovalBadge } from "@/components/worker/WorkerBits";

export const metadata: Metadata = { title: "Artikel Saya" };

export default async function WorkerArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await workerListArticles(session!.user.id, page);

  return (
    <div>
      <PageHeader title="Artikel Saya" actionHref="/worker/articles/new" actionLabel="Tulis Artikel" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
          Belum ada artikel.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">{a.title}</p>
                {a.approvalStatus === "PENDING" && a.pendingTitle && a.pendingTitle !== a.title ? (
                  <p className="mt-0.5 truncate text-xs text-amber-700">Revisi menunggu: {a.pendingTitle}</p>
                ) : null}
                {a.approvalStatus === "REJECTED" && a.rejectionReason ? (
                  <p className="mt-0.5 truncate text-xs text-red-600">Alasan: {a.rejectionReason}</p>
                ) : null}
              </div>
              <ApprovalBadge status={a.approvalStatus} />
              {(a.approvalStatus === "DRAFT" || a.approvalStatus === "REJECTED") && (
                <form action={submitWorkerArticle.bind(null, a.id)}>
                  <button type="submit" className="rounded-full bg-pine px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-pine-deep">
                    Ajukan Review
                  </button>
                </form>
              )}
              <Link href={`/worker/articles/${a.id}`} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500">
                {a.approvalStatus === "PENDING" ? "Lihat" : "Edit"}
              </Link>
              {(a.approvalStatus === "DRAFT" || a.approvalStatus === "REJECTED") && (
                <form action={deleteWorkerArticle.bind(null, a.id)}>
                  <DeleteButton confirmText="Hapus artikel ini?" />
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={(n) => (n > 1 ? `/worker/articles?page=${n}` : "/worker/articles")} />
    </div>
  );
}
