import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { workerListCategories } from "@/services/worker.service";
import { createWorkerCategory, updateWorkerCategory, deleteWorkerCategory, submitWorkerCategory } from "@/lib/actions/worker-categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ApprovalBadge } from "@/components/worker/WorkerBits";

export const metadata: Metadata = { title: "Kategori" };

export default async function WorkerCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const isAdmin = session!.user.role === "ADMIN";
  const items = await workerListCategories();

  return (
    <div>
      <PageHeader title="Kategori" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <p className="mb-4 text-sm text-stone-500">
        Kategori baru tersimpan sebagai draf dan perlu approval admin sebelum tampil di katalog.
      </p>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section aria-label="Tambah kategori">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Tambah Kategori</h2>
          <CategoryForm action={createWorkerCategory} submitLabel="Simpan Kategori" />
        </section>
        <section aria-label="Daftar kategori">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Daftar ({items.length})</h2>
          <ul className="space-y-2">
            {items.map((c) => {
              const mine = isAdmin || c.createdById === session!.user.id;
              const locked = c.approvalStatus === "PENDING";
              const removable = mine && (c.approvalStatus === "DRAFT" || c.approvalStatus === "REJECTED");
              return (
                <li key={c.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-900">{c.name}</p>
                      <p className="text-xs text-stone-500">/{c.slug} · {c._count.products} produk{mine ? "" : " · milik admin"}</p>
                      {c.approvalStatus === "PENDING" && c.pendingName && c.pendingName !== c.name ? (
                        <p className="mt-0.5 text-xs text-amber-700">Revisi menunggu: {c.pendingName}</p>
                      ) : null}
                      {c.approvalStatus === "REJECTED" && c.rejectionReason ? (
                        <p className="mt-1 text-xs text-red-600">Alasan ditolak: {c.rejectionReason}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ApprovalBadge status={c.approvalStatus} />
                      {mine && (c.approvalStatus === "DRAFT" || c.approvalStatus === "REJECTED") && (
                        <form action={submitWorkerCategory.bind(null, c.id)}>
                          <button type="submit" className="rounded-full bg-pine px-3 py-1 text-xs font-medium text-white transition hover:bg-pine-deep">
                            Ajukan
                          </button>
                        </form>
                      )}
                      {removable && (
                        <form action={deleteWorkerCategory.bind(null, c.id)}>
                          <DeleteButton label="Hapus" confirmText="Hapus kategori ini?" />
                        </form>
                      )}
                    </div>
                  </div>
                  {mine && !locked ? (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-stone-500 hover:text-stone-800">Edit</summary>
                      <div className="mt-2">
                        <CategoryForm
                          action={updateWorkerCategory.bind(null, c.id)}
                          defaults={{ name: c.name, slug: c.slug, description: c.description ?? "" }}
                          submitLabel="Simpan Perubahan"
                        />
                      </div>
                    </details>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
