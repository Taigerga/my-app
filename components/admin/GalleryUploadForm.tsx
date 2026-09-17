"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { DropzoneInput } from "./DropzoneInput";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";

const CATEGORIES = ["produk", "workshop", "kantor", "proyek", "kegiatan"];

export function GalleryUploadForm({
  action,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-line bg-white p-5">
      <div>
        <label htmlFor="g-t" className="mb-1 block text-sm font-medium text-stone-700">Judul foto</label>
        <input id="g-t" name="title" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="g-c" className="mb-1 block text-sm font-medium text-stone-700">Kategori</label>
        <select id="g-c" name="category" className={inputCls}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <DropzoneInput id="g-i" name="image" label="Gambar (maks 2MB)" required maxFiles={1} />
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Mengunggah..." : "Upload Foto"}
      </button>
    </form>
  );
}

