import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak memiliki akses admin.");
  }
  return session;
}

/** Worker aktif, atau admin (supervisi). Kembalikan session + flag isAdmin. */
export async function requireWorker() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "WORKER") {
    throw new Error("Tidak memiliki akses worker.");
  }
  return { session, isAdmin: session.user.role === "ADMIN" };
}

/** Pastikan row milik user saat ini, kecuali admin (bypass supervisi). */
export function requireOwnerOrAdmin(createdById: string, user: { id: string; role: string }) {
  if (user.role !== "ADMIN" && createdById !== user.id) {
    throw new Error("Anda hanya dapat mengelola data milik sendiri.");
  }
}

/**
 * Kunci DRAF milik pekerja dari tangan admin.
 * Aturan: DRAF milik orang lain tidak boleh diedit/dihapus admin,
 * kecuali hapus draf yatim (pembuatnya sudah dinonaktifkan).
 * PENDING ke atas tetap wewenang penuh admin.
 */
export async function assertAdminCanModify(input: {
  createdById: string;
  approvalStatus: string;
  adminId: string;
  kind: "edit" | "delete";
}): Promise<void> {
  if (input.createdById === input.adminId || input.approvalStatus !== "DRAFT") return;
  if (input.kind === "delete") {
    const creator = await db.user.findUnique({ where: { id: input.createdById }, select: { isActive: true } });
    if (creator && !creator.isActive) return;
  }
  throw new Error("Draf milik pekerja hanya dapat dikelola pemiliknya. Minta ia yang mengubah/menghapus, atau tunggu sampai diajukan.");
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
