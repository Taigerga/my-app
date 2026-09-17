"use client";

import Link from "next/link";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center" role="alert">
      <h1 className="font-display text-3xl font-semibold text-ink">Halaman gagal dimuat</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        Terjadi gangguan sementara. Silakan coba lagi atau kembali ke beranda.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-pine px-6 py-2.5 text-sm font-medium text-white transition hover:bg-pine-deep"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-ink transition hover:border-ink"
        >
          Beranda
        </Link>
      </div>
    </main>
  );
}
