import type { Metadata } from "next";
import { getCategoriesForAdmin } from "@/services/catalog.service";
import { createProductAction } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Tambah Produk" };

export default async function NewProductPage() {
  const categories = await getCategoriesForAdmin();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Tambah Produk" />
      {categories.length === 0 ? (
        <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Buat kategori dulu di menu Kategori sebelum menambah produk.
        </p>
      ) : (
        <ProductForm
          action={createProductAction}
          categories={categories}
          submitLabel="Simpan Produk"
          allowImages
        />
      )}
    </div>
  );
}
