import type { Metadata } from "next";
import Image from "next/image";
import { adminListGallery } from "@/services/admin.service";
import { createGalleryAction, updateGalleryAction, deleteGalleryAction } from "@/lib/actions/gallery";
import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ApprovalBadge } from "@/components/worker/WorkerBits";

export const metadata: Metadata = { title: "Kelola Galeri" };

const CATEGORIES = ["produk", "workshop", "kantor", "proyek", "kegiatan"];

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const cat = sp.cat ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await adminListGallery({ category: cat || undefined, page });

  return (
    <div>
      <PageHeader title="Galeri" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section aria-label="Upload foto">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Upload Foto</h2>
          <GalleryUploadForm action={createGalleryAction} />
        </section>
        <section aria-label="Daftar foto">
          <form action="/admin/gallery" method="get" className="mb-3 flex gap-2">
            <label htmlFor="g-f" className="sr-only">Filter kategori</label>
            <select id="g-f" name="cat" defaultValue={cat} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
              <option value="">Semua kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white">Filter</button>
          </form>
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
              Belum ada foto.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {items.map((g) => (
                <li key={g.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                  <span className="relative block aspect-[4/3] bg-stone-100">
                    <Image src={g.url} alt={g.title} fill loading="lazy" sizes="25vw" className="object-cover" />
                    <span className="absolute left-1.5 top-1.5"><ApprovalBadge status={g.approvalStatus} /></span>
                  </span>
                  <form action={updateGalleryAction.bind(null, g.id)} className="space-y-1.5 p-2.5">
                    {g.approvalStatus === "PENDING" && g.pendingTitle && g.pendingTitle !== g.title ? (
                      <p className="truncate text-xs text-amber-700">Revisi menunggu: {g.pendingTitle}</p>
                    ) : null}
                    <label className="sr-only" htmlFor={`gt-${g.id}`}>Judul</label>
                    <input id={`gt-${g.id}`} name="title" defaultValue={g.title} className="w-full rounded-lg border border-stone-200 px-2 py-1 text-sm" />
                    <span className="flex gap-1.5">
                      <label className="sr-only" htmlFor={`gc-${g.id}`}>Kategori</label>
                      <select id={`gc-${g.id}`} name="category" defaultValue={g.category} className="flex-1 rounded-lg border border-stone-200 px-2 py-1 text-sm">
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button type="submit" className="rounded-lg border border-stone-300 px-2.5 py-1 text-xs hover:border-stone-500">
                        Simpan
                      </button>
                    </span>
                  </form>
                  <form action={deleteGalleryAction.bind(null, g.id)} className="px-2.5 pb-2.5">
                    <DeleteButton label="Hapus foto" confirmText="Hapus?" />
                  </form>
                </li>
              ))}
            </ul>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            href={(n) => {
              const p = new URLSearchParams();
              if (cat) p.set("cat", cat);
              if (n > 1) p.set("page", String(n));
              const s = p.toString();
              return `/admin/gallery${s ? `?${s}` : ""}`;
            }}
          />
        </section>
      </div>
    </div>
  );
}
