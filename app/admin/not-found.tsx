import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
      <p className="font-display text-5xl font-semibold text-stone-300">404</p>
      <h1 className="mt-3 font-medium text-stone-900">Data tidak ditemukan</h1>
      <p className="mt-1 text-sm text-stone-500">Item yang Anda cari tidak ada atau sudah dihapus.</p>
      <Link
        href="/admin"
        className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-stone-800"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
