"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { DropzoneInput } from "./DropzoneInput";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-500";
const labelCls = "mb-1 block text-sm font-medium text-stone-700";

const FIELDS: { key: string; label: string; type?: "text" | "textarea" }[] = [
  { key: "name", label: "Nama perusahaan" },
  { key: "tagline", label: "Tagline" },
  { key: "description", label: "Deskripsi", type: "textarea" },
  { key: "history", label: "Sejarah", type: "textarea" },
  { key: "vision", label: "Visi", type: "textarea" },
  { key: "mission", label: "Misi", type: "textarea" },
  { key: "phone", label: "Telepon" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "address", label: "Alamat", type: "textarea" },
  { key: "mapsUrl", label: "URL Google Maps" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "hours", label: "Jam operasional" },
];

export function CompanyForm({
  action,
  defaults,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
  defaults: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = (k: string) => state?.values?.[k] ?? defaults[k] ?? "";

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <div>
        <h2 className="font-medium text-stone-900">Profil Perusahaan</h2>
        <p className="mt-0.5 text-xs text-stone-500">Informasi yang tampil di website publik.</p>
      </div>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label htmlFor={`cp-${f.key}`} className={labelCls}>{f.label}</label>
          {f.type === "textarea" ? (
            <textarea id={`cp-${f.key}`} name={f.key} rows={3} defaultValue={v(f.key)} className={inputCls} />
          ) : (
            <input id={`cp-${f.key}`} name={f.key} defaultValue={v(f.key)} className={inputCls} />
          )}
          {state?.fieldErrors?.[f.key] ? (
            <p role="alert" className="mt-1 text-sm text-red-700">{state.fieldErrors[f.key][0]}</p>
          ) : null}
        </div>
      ))}
      <DropzoneInput
        id="cp-logo"
        name="logo"
        label="Logo (opsional, maks 2MB)"
        maxFiles={1}
      />
      <div>
        <DropzoneInput
          id="cp-hero"
          name="hero"
          label="Foto Hero Beranda (opsional, maks 2MB)"
          maxFiles={1}
          hint="Foto workshop/showroom perusahaan. Kosongkan untuk memakai foto produk unggulan."
        />
        {defaults.heroImageUrl === "1" ? (
          <span className="mt-2 flex items-center gap-2 text-sm text-stone-600">
            <input id="cp-remove-hero" name="removeHero" type="checkbox" className="h-4 w-4" />
            <label htmlFor="cp-remove-hero">Hapus foto hero saat ini (kembali ke foto produk)</label>
          </span>
        ) : null}
      </div>
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60">
        {pending ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  );
}

