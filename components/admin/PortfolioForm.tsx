"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { DropzoneInput } from "./DropzoneInput";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";
const labelCls = "mb-1 block text-sm font-medium text-stone-700";

export function PortfolioForm({
  action,
  defaults,
  submitLabel,
  allowImages = false,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
  defaults?: { [key: string]: string | boolean | undefined };
  submitLabel: string;
  allowImages?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = (k: string) => {
    const fromState = state?.values?.[k];
    if (typeof fromState === "string") return fromState;
    const d = defaults?.[k];
    return typeof d === "string" ? d : "";
  };
  const featured = state?.values ? state.values.featured === "on" : defaults?.featured === true;

  return (
    <form action={formAction} className="max-w-3xl space-y-4 rounded-2xl border border-line bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-t" className={labelCls}>Nama proyek</label>
          <input id="pf-t" name="title" required defaultValue={v("title")} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-s" className={labelCls}>Slug</label>
          <input id="pf-s" name="slug" required defaultValue={v("slug")} className={inputCls} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pf-c" className={labelCls}>Klien</label>
          <input id="pf-c" name="client" defaultValue={v("client")} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-l" className={labelCls}>Lokasi</label>
          <input id="pf-l" name="location" defaultValue={v("location")} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-y" className={labelCls}>Tahun</label>
          <input id="pf-y" name="year" type="number" min={1900} max={2100} defaultValue={v("year")} className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="pf-d" className={labelCls}>Deskripsi</label>
        <textarea id="pf-d" name="description" rows={4} defaultValue={v("description")} className={inputCls} />
      </div>
      <div className="flex items-center gap-2">
        <input id="pf-f" name="featured" type="checkbox" defaultChecked={featured} className="h-4 w-4" />
        <label htmlFor="pf-f" className="text-sm text-stone-700">Unggulan (homepage)</label>
      </div>
      {allowImages ? (
        <DropzoneInput
          id="pf-img"
          name="images"
          label="Foto (maks 10, tiap file maks 2MB)"
          multiple
          maxFiles={10}
        />
      ) : null}
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}

