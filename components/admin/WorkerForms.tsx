"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { resetWorkerPassword } from "@/lib/actions/workers";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";
const labelCls = "mb-1 block text-sm font-medium text-stone-700";

export function WorkerCreateForm({
  action,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-2xl border border-line bg-white p-6">
      <div>
        <label htmlFor="w-name" className={labelCls}>Nama pekerja</label>
        <input id="w-name" name="name" required defaultValue={state?.values?.name ?? ""} className={inputCls} />
        {state?.fieldErrors?.name ? <p role="alert" className="mt-1 text-sm text-red-700">{state.fieldErrors.name[0]}</p> : null}
      </div>
      <div>
        <label htmlFor="w-email" className={labelCls}>Email login</label>
        <input id="w-email" name="email" type="email" required defaultValue={state?.values?.email ?? ""} className={inputCls} />
        {state?.fieldErrors?.email ? <p role="alert" className="mt-1 text-sm text-red-700">{state.fieldErrors.email[0]}</p> : null}
      </div>
      <div>
        <label htmlFor="w-pass" className={labelCls}>Password awal (min 8)</label>
        <input id="w-pass" name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
        {state?.fieldErrors?.password ? <p role="alert" className="mt-1 text-sm text-red-700">{state.fieldErrors.password[0]}</p> : null}
      </div>
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Menyimpan..." : "Buat Akun Worker"}
      </button>
    </form>
  );
}

export function WorkerResetForm({ workerId }: { workerId: string }) {
  const [state, formAction, pending] = useActionState(resetWorkerPassword.bind(null, workerId), undefined);
  return (
    <form action={formAction} className="mt-2 flex flex-wrap items-center gap-2">
      <label htmlFor={`wr-${workerId}`} className="sr-only">Password baru</label>
      <input
        id={`wr-${workerId}`}
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Password baru..."
        autoComplete="new-password"
        className="min-w-44 flex-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm outline-none focus:border-stone-500"
      />
      <button type="submit" disabled={pending} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-stone-500 disabled:opacity-60">
        {pending ? "..." : "Reset"}
      </button>
      {state?.error ? <p role="alert" className="w-full text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
