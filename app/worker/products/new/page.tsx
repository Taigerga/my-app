import type { Metadata } from "next";
import { getCategories } from "@/services/catalog.service";
import { createWorkerProduct } from "@/lib/actions/worker-products";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Tambah Produk" };

export default async function WorkerNewProductPage() {
  const categories = await getCategories();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Tambah Produk" />
      <p className="mb-4 text-sm text-stone-500">Produk tersimpan sebagai draf dan perlu approval admin sebelum tayang.</p>
      <ProductForm action={createWorkerProduct} categories={categories} submitLabel="Simpan Draf" allowImages />
    </div>
  );
}
