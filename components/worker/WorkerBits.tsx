const TONE: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-600",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-moss text-pine-deep",
  REJECTED: "bg-red-100 text-red-700",
};

const LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING: "Pending",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

/** Badge status approval. Render hanya bila status bukan APPROVED (kondisi normal tanpa label). */
export function ApprovalBadge({ status }: { status: string }) {
  if (status === "APPROVED") return null;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TONE[status] ?? "bg-stone-100 text-stone-600"}`}>
      {LABEL[status] ?? status}
    </span>
  );
}

export type LockInfo = { locked: boolean; orphan: boolean; ownerName: string };

/** DRAF milik orang lain terkunci dari admin. Draf yatim (pembuat nonaktif) boleh dihapus. */
export function draftLock(
  row: { createdById: string; approvalStatus: string; createdBy: { name: string | null; email: string; isActive: boolean } },
  meId: string,
): LockInfo {
  const locked = row.createdById !== meId && row.approvalStatus === "DRAFT";
  return {
    locked,
    orphan: locked && !row.createdBy.isActive,
    ownerName: row.createdBy.name ?? row.createdBy.email,
  };
}

export function DraftLockNote({ ownerName, orphan }: { ownerName: string; orphan: boolean }) {
  return (
    <p className="text-xs text-stone-400">
      Draf milik {ownerName}{orphan ? " (akun nonaktif — boleh dihapus)" : " — hanya pemilik yang boleh mengubah"}.
    </p>
  );
}
