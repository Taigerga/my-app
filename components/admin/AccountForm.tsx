"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { updateAccountAction, changePasswordAction } from "@/lib/actions/account";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";
const labelCls = "mb-1 block text-sm font-medium text-stone-700";

function FormError({ state }: { state: ActionState | undefined }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {state.error}
    </p>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-red-700">
      {messages[0]}
    </p>
  );
}

function ProfileForm({ user }: { user: { name: string | null; email: string } }) {
  const [state, action, pending] = useActionState(updateAccountAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="ac-name" className={labelCls}>Nama admin</label>
        <input id="ac-name" name="name" required defaultValue={state?.values?.name ?? user.name ?? ""} className={inputCls} />
        <FieldError messages={state?.fieldErrors?.name} />
      </div>
      <div>
        <label htmlFor="ac-email" className={labelCls}>Email login</label>
        <input id="ac-email" name="email" type="email" required defaultValue={state?.values?.email ?? user.email} className={inputCls} />
        <FieldError messages={state?.fieldErrors?.email} />
        <p className="mt-1 text-xs text-stone-400">Mengganti email akan mengeluarkan Anda dan meminta login ulang.</p>
      </div>
      <FormError state={state} />
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Menyimpan..." : "Simpan Akun"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="space-y-3 border-t border-line pt-4">
      <h3 className="text-sm font-medium text-stone-800">Ganti Password</h3>
      <div>
        <label htmlFor="pw-cur" className={labelCls}>Password saat ini</label>
        <input id="pw-cur" name="currentPassword" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      <div>
        <label htmlFor="pw-new" className={labelCls}>Password baru (min 8 karakter)</label>
        <input id="pw-new" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
        <FieldError messages={state?.fieldErrors?.newPassword} />
      </div>
      <div>
        <label htmlFor="pw-conf" className={labelCls}>Konfirmasi password baru</label>
        <input id="pw-conf" name="confirmPassword" type="password" required autoComplete="new-password" className={inputCls} />
        <FieldError messages={state?.fieldErrors?.confirmPassword} />
      </div>
      <FormError state={state} />
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Menyimpan..." : "Ganti Password"}
      </button>
    </form>
  );
}

export function AccountForm({ user }: { user: { name: string | null; email: string } }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5" aria-label="Profil akun">
      <h2 className="font-medium text-stone-900">Profil Akun</h2>
      <p className="mb-4 mt-0.5 text-xs text-stone-500">Kredensial login dashboard admin.</p>
      <ProfileForm user={user} />
      <div className="mt-2">
        <PasswordForm />
      </div>
    </section>
  );
}
