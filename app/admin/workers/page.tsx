import type { Metadata } from "next";
import { createWorkerAction, listWorkers, toggleWorkerActive } from "@/lib/actions/workers";
import { WorkerCreateForm, WorkerResetForm } from "@/components/admin/WorkerForms";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Kelola Worker" };

export default async function AdminWorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const workers = await listWorkers();

  return (
    <div>
      <PageHeader title="Kelola Worker" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section aria-label="Buat akun worker">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Buat Akun Worker</h2>
          <WorkerCreateForm action={createWorkerAction} />
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-stone-500">
            Worker login lewat halaman yang sama dan diarahkan ke dashboard <code>/worker</code>.
            Nonaktifkan akun untuk mencabut akses tanpa menghapus data karyanya.
          </p>
        </section>
        <section aria-label="Daftar worker">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Daftar ({workers.length})</h2>
          {workers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-stone-500" role="status">
              Belum ada akun worker.
            </p>
          ) : (
            <ul className="space-y-2">
              {workers.map((w) => (
                <li key={w.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-900">
                        {w.name ?? w.email}
                        {!w.isActive ? (
                          <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-600">Nonaktif</span>
                        ) : null}
                        {w.pending > 0 ? (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{w.pending} pending</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-stone-500">
                        {w.email} · {w._count.productsCreated} produk · {w._count.articlesCreated} artikel · {w._count.galleriesCreated} galeri
                      </p>
                    </div>
                    <form action={toggleWorkerActive.bind(null, w.id, !w.isActive)}>
                      <button
                        type="submit"
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${w.isActive ? "border-stone-300 hover:border-red-300 hover:text-red-700" : "border-pine/40 text-pine hover:bg-pine hover:text-white"}`}
                      >
                        {w.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                  </div>
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-stone-500 hover:text-stone-800">Reset password</summary>
                    <div className="mt-2">
                      <WorkerResetForm workerId={w.id} />
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
