"use client";

import { useActionState } from "react";
import dynamic from "next/dynamic";
import type { ActionState } from "@/lib/actions/helpers";
import { DropzoneInput } from "./DropzoneInput";

const ArticleEditor = dynamic(() => import("./ArticleEditor").then((m) => m.ArticleEditor), {
  ssr: false,
  loading: () => <div className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-400">Memuat editor...</div>,
});

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";
const labelCls = "mb-1 block text-sm font-medium text-stone-700";

export function ArticleForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
  defaults?: Record<string, string>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = (k: string) => state?.values?.[k] ?? defaults?.[k] ?? "";

  return (
    <form action={formAction} className="max-w-3xl space-y-4 rounded-2xl border border-line bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ar-t" className={labelCls}>Judul</label>
          <input id="ar-t" name="title" required defaultValue={v("title")} className={inputCls} />
        </div>
        <div>
          <label htmlFor="ar-s" className={labelCls}>Slug</label>
          <input id="ar-s" name="slug" required defaultValue={v("slug")} className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="ar-e" className={labelCls}>Ringkasan</label>
        <input id="ar-e" name="excerpt" defaultValue={v("excerpt")} maxLength={500} className={inputCls} />
      </div>
      <div>
        <span id="ar-c-label" className={labelCls}>Konten</span>
        <ArticleEditor key={state ? "retry" : "fresh"} initialHtml={v("content")} />
        {state?.fieldErrors?.content ? <p role="alert" className="mt-1 text-sm text-red-700">{state.fieldErrors.content[0]}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <DropzoneInput
          id="ar-thumb"
          name="thumbnail"
          label="Thumbnail (opsional, maks 2MB)"
          maxFiles={1}
        />
        <div>
          <label htmlFor="ar-st" className={labelCls}>Status</label>
          <select id="ar-st" name="status" defaultValue={v("status") || "DRAFT"} className={inputCls}>
            <option value="DRAFT">Draf</option>
            <option value="PUBLISHED">Tayang</option>
          </select>
        </div>
      </div>
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}

