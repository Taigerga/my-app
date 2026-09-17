import type { Metadata } from "next";
import { getDashboardStats, getRecentInquiries } from "@/services/dashboard.service";

export const metadata: Metadata = { title: "Dashboard Admin" };

const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Batal",
};

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([getDashboardStats(), getRecentInquiries()]);

  const cards = [
    { label: "Total Produk", value: stats.products },
    { label: "Total Portofolio", value: stats.portfolios },
    { label: "Total Artikel", value: stats.articles },
    { label: "Total Inquiry", value: stats.inquiries },
    { label: "Inquiry Baru", value: stats.newInquiries },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-stone-900">Dashboard</h1>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Statistik">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-white p-4">
            <p className="text-2xl font-semibold text-ink">{c.value}</p>
            <p className="mt-1 text-sm text-stone-500">{c.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-line bg-white p-4" aria-label="Statistik inquiry">
        <h2 className="mb-3 font-medium text-stone-900">Statistik Inquiry</h2>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="rounded-lg bg-stone-50 px-3 py-2">
              <dt className="text-xs text-stone-500">{STATUS_LABEL[status] ?? status}</dt>
              <dd className="text-lg font-semibold text-ink">{count}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-line bg-white p-4" aria-label="Inquiry terbaru">
        <h2 className="mb-3 font-medium text-stone-900">Inquiry Terbaru</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-stone-500">Belum ada inquiry masuk.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {recent.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-medium text-stone-900">{q.name}</p>
                  <p className="text-stone-500">
                    {q.product?.name ?? "Pertanyaan umum"} · {q.quantity} pcs ·{" "}
                    {new Date(q.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                  {STATUS_LABEL[q.status] ?? q.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
