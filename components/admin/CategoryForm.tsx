"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";

export function CategoryForm({
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
    <form action={formAction} className="max-w-xl space-y-4 rounded-2xl border border-line bg-white p-6">
      <div>
        <label htmlFor="cf-name" className="mb-1 block text-sm font-medium text-stone-700">Nama kategori</label>
        <input id="cf-name" name="name" required defaultValue={v("name")} className={inputCls} />
        {state?.fieldErrors?.name ? <p role="alert" className="mt-1 text-sm text-red-700">{state.fieldErrors.name[0]}</p> : null}
      </div>
      <div>
        <label htmlFor="cf-slug" className="mb-1 block text-sm font-medium text-stone-700">Slug</label>
        <input id="cf-slug" name="slug" required defaultValue={v("slug")} placeholder="kursi" className={inputCls} />
        {state?.fieldErrors?.slug ? <p role="alert" className="mt-1 text-sm text-red-700">{state.fieldErrors.slug[0]}</p> : null}
      </div>
      <div>
        <label htmlFor="cf-desc" className="mb-1 block text-sm font-medium text-stone-700">Deskripsi</label>
        <textarea id="cf-desc" name="description" rows={3} defaultValue={v("description")} className={inputCls} />
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
