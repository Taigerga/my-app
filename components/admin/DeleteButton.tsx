"use client";

import { useState } from "react";

export function DeleteButton({ label = "Hapus", confirmText }: { label?: string; confirmText: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50"
      >
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-sm text-stone-500">{confirmText}</span>
      <button
        type="submit"
        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Ya, hapus
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:border-stone-400"
      >
        Batal
      </button>
    </span>
  );
}
