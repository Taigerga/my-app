import type { Metadata } from "next";
import { adminListCategories } from "@/services/admin.service";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Kelola Kategori" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const items = await adminListCategories();

  return (
    <div>
      <PageHeader title="Kategori" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section aria-label="Tambah kategori">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Tambah Kategori</h2>
          <CategoryForm action={createCategoryAction} submitLabel="Simpan Kategori" />
        </section>
        <section aria-label="Daftar kategori">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Daftar ({items.length})</h2>
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
              Belum ada kategori.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((c) => (
                <li key={c.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-900">{c.name}</p>
                      <p className="text-xs text-stone-500">/{c.slug} · {c._count.products} produk</p>
                    </div>
                    <form action={deleteCategoryAction.bind(null, c.id)}>
                      <DeleteButton confirmText="Hapus kategori ini?" />
                    </form>
                  </div>
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-stone-500 hover:text-stone-800">Edit</summary>
                    <div className="mt-2">
                      <CategoryForm
                        action={updateCategoryAction.bind(null, c.id)}
                        defaults={{ name: c.name, slug: c.slug, description: c.description ?? "" }}
                        submitLabel="Simpan Perubahan"
                      />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
