import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  updateProductAction,
  addProductImagesAction,
  setMainProductImageAction,
  deleteProductImageAction,
} from "@/lib/actions/products";
import { adminGetProduct } from "@/services/admin.service";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DropzoneInput } from "@/components/admin/DropzoneInput";

export const metadata: Metadata = { title: "Edit Produk" };

function AddImagesForm({ productId, count }: { productId: string; count: number }) {
  return (
    <form action={addProductImagesAction.bind(null, productId)} className="space-y-2">
      <DropzoneInput
        id="add-img"
        name="images"
        label={`Tambah foto (${count}/8 terpakai)`}
        multiple
        maxFiles={8}
        hint={`JPG, PNG, WebP · maks 2MB/file · sisa ${8 - count} slot`}
      />
      <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
        Upload ({count}/8)
      </button>
    </form>
  );
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const product = await adminGetProduct(id);
  if (!product) notFound();
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  const updateAction = updateProductAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={`Edit: ${product.name}`} />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <ProductForm
        action={updateAction}
        categories={categories}
        defaults={{
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          shortDesc: product.shortDesc ?? "",
          description: product.description ?? "",
          material: product.material ?? "",
          dimensions: product.dimensions ?? "",
          color: product.color ?? "",
          specifications: product.specifications ?? "",
          status: product.status,
          featured: product.featured,
        }}
        submitLabel="Simpan Perubahan"
      />

      <section className="rounded-2xl border border-line bg-white p-6" aria-label="Kelola foto">
        <h2 className="font-medium text-stone-900">Foto Produk</h2>
        {product.images.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Belum ada foto.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {product.images.map((img) => (
              <li key={img.id} className="overflow-hidden rounded-xl border border-line">
                <span className="relative block aspect-square bg-stone-100">
                  <Image src={img.url} alt={img.alt ?? ""} fill loading="lazy" sizes="20vw" className="object-cover" />
                  {img.isMain ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-pine px-2 py-0.5 text-xs font-medium text-white">
                      Utama
                    </span>
                  ) : null}
                </span>
                <span className="flex gap-1 p-1.5">
                  {!img.isMain ? (
                    <form action={setMainProductImageAction.bind(null, id, img.id)} className="flex-1">
                      <button type="submit" className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs hover:border-stone-500">
                        Jadikan utama
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteProductImageAction.bind(null, id, img.id)} className="flex-1">
                    <DeleteButton label="Hapus" confirmText="Hapus foto ini?" />
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
        {product.images.length < 8 ? (
          <div className="mt-4 border-t border-line pt-4">
            <AddImagesForm productId={id} count={product.images.length} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500">Sudah 8/8 foto. Hapus salah satu untuk menambah.</p>
        )}
      </section>
    </div>
  );
}
