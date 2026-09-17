"use client";

export default function WorkerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
      <h1 className="font-medium text-red-900">Terjadi kesalahan</h1>
      <p className="mx-auto mt-1 max-w-md text-sm text-red-700">Coba muat ulang halaman ini.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-red-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-800"
      >
        Coba Lagi
      </button>
    </div>
  );
}
