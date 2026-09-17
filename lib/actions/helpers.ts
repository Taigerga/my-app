import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak memiliki akses admin.");
  }
  return session;
}

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

export function formValues(formData: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

/** Nilai string untuk dikembalikan ke form saat validasi gagal (checkbox → "on"/""). */
export function stringValues(formData: FormData, keys: string[]): Record<string, string> {
  return { ...formValues(formData, keys), featured: formData.get("featured") === "on" ? "on" : "" };
}
