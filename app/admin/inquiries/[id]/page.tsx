import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetInquiry } from "@/services/admin.service";
import { updateInquiryStatusAction, deleteInquiryAction } from "@/lib/actions/inquiries";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Detail Inquiry" };

const STATUSES = ["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Batal",
};

export default async function InquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const inq = await adminGetInquiry(id);
  if (!inq) notFound();

  const waLink = `https://wa.me/${inq.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo ${inq.name}, terima kasih atas inquiry Anda terkait ${inq.product?.name ?? "produk kami"}.`)}`;

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Inquiry: ${inq.name}`} />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <section className="rounded-2xl border border-line bg-white p-6" aria-label="Detail inquiry">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Nama", inq.name],
            ["Email", inq.email],
            ["WhatsApp", inq.whatsapp],
            ["Jumlah", `${inq.quantity} pcs`],
            ["Produk", inq.product ? `${inq.product.name}` : "Pertanyaan umum"],
            ["Tanggal", new Date(inq.createdAt).toLocaleString("id-ID")],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-stone-500">{k}</dt>
              <dd className="mt-0.5 font-medium text-stone-900">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm text-stone-500">Pesan</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-800">{inq.message}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-white transition hover:bg-pine-deep"
          >
            Balas via WhatsApp
          </a>
          <form action={deleteInquiryAction.bind(null, id)}>
            <DeleteButton confirmText="Hapus inquiry ini?" />
          </form>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-white p-6" aria-label="Ubah status">
        <h2 className="font-medium text-stone-900">Status: {STATUS_LABEL[inq.status]}</h2>
        <form action={updateInquiryStatusAction.bind(null, id)} className="mt-3 flex flex-wrap gap-2">
          <label htmlFor="inq-st" className="sr-only">Ubah status</label>
          <select id="inq-st" name="status" defaultValue={inq.status} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
            Simpan Status
          </button>
        </form>
        <Link href="/admin/inquiries" className="mt-4 inline-block text-sm text-stone-500 hover:text-ink hover:underline">
          ← Kembali ke daftar
        </Link>
      </section>
    </div>
  );
}
