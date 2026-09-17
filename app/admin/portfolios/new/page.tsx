import type { Metadata } from "next";
import { createPortfolioAction } from "@/lib/actions/portfolios";
import { PortfolioForm } from "@/components/admin/PortfolioForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Tambah Portofolio" };

export default function NewPortfolioPage() {
  return (
    <div>
      <PageHeader title="Tambah Proyek" />
      <PortfolioForm action={createPortfolioAction} submitLabel="Simpan Proyek" allowImages />
    </div>
  );
}
