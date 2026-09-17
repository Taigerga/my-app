"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { DropzoneInput } from "./DropzoneInput";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";
const labelCls = "mb-1 block text-sm font-medium text-stone-700";

function Err({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-red-700">
      {messages[0]}
    </p>
  );
}

export function ProductForm({
  action,
  categories,
  defaults,
  submitLabel,
  allowImages = false,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
  categories: { id: string; name: string; approvalStatus?: string }[];
  defaults?: { [key: string]: string | boolean | undefined };
  submitLabel: string;
  allowImages?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const str = (k: string) => {
    const fromState = state?.values?.[k];
    if (typeof fromState === "string") return fromState;
    const d = defaults?.[k];
    return typeof d === "string" ? d : "";
  };
  const v = str;
  const featured = state?.values ? state.values.featured === "on" : defaults?.featured === true;

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className={labelCls}>Nama produk</label>
          <input id="pf-name" name="name" required defaultValue={v("name")} className={inputCls} />
          <Err messages={state?.fieldErrors?.name} />
        </div>
        <div>
          <label htmlFor="pf-slug" className={labelCls}>Slug</label>
          <input id="pf-slug" name="slug" required defaultValue={v("slug")} placeholder="kursi-jati-minimalis" className={inputCls} />
          <Err messages={state?.fieldErrors?.slug} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pf-cat" className={labelCls}>Kategori</label>
          <select id="pf-cat" name="categoryId" required defaultValue={v("categoryId")} className={inputCls}>
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.approvalStatus && c.approvalStatus !== "APPROVED" ? `${c.name} (perlu review)` : c.name}</option>
            ))}
          </select>
          <Err messages={state?.fieldErrors?.categoryId} />
        </div>
        <div>
          <label htmlFor="pf-status" className={labelCls}>Status</label>
          <select id="pf-status" name="status" defaultValue={v("status") || "ACTIVE"} className={inputCls}>
            <option value="ACTIVE">Aktif</option>
            <option value="DRAFT">Draf</option>
            <option value="ARCHIVED">Arsip</option>
          </select>
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input id="pf-featured" name="featured" type="checkbox" defaultChecked={featured} className="h-4 w-4" />
          <label htmlFor="pf-featured" className="text-sm text-stone-700">Unggulan (homepage)</label>
        </div>
      </div>
      <div>
        <label htmlFor="pf-short" className={labelCls}>Deskripsi singkat</label>
        <input id="pf-short" name="shortDesc" defaultValue={v("shortDesc")} maxLength={500} className={inputCls} />
      </div>
      <div>
        <label htmlFor="pf-desc" className={labelCls}>Deskripsi</label>
        <textarea id="pf-desc" name="description" rows={4} defaultValue={v("description")} className={inputCls} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="pf-mat" className={labelCls}>Material</label>
          <input id="pf-mat" name="material" defaultValue={v("material")} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-dim" className={labelCls}>Dimensi</label>
          <input id="pf-dim" name="dimensions" defaultValue={v("dimensions")} placeholder="180x90x75 cm" className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-color" className={labelCls}>Warna</label>
          <input id="pf-color" name="color" defaultValue={v("color")} className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="pf-spec" className={labelCls}>Spesifikasi</label>
        <textarea id="pf-spec" name="specifications" rows={3} defaultValue={v("specifications")} className={inputCls} />
      </div>
      {allowImages ? (
        <DropzoneInput
          id="pf-img"
          name="images"
          label="Foto (maks 8, tiap file maks 2MB)"
          multiple
          maxFiles={8}
        />
      ) : null}
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}

