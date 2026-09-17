"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireWorker } from "./helpers";
import { logActivity } from "./workflow";

const StatusSchema = z.enum(["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"]);

/** Worker memproses inquiry bebas tanpa approval; dicatat siapa yang menangani. */
export async function processWorkerInquiry(id: string, formData: FormData) {
  const { session } = await requireWorker();
  const parsed = StatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) throw new Error("Status tidak valid.");
  const current = await db.inquiry.findUnique({ where: { id }, select: { status: true } });
  if (!current) throw new Error("Inquiry tidak ditemukan.");
  await db.inquiry.update({ where: { id }, data: { status: parsed.data, handledById: session.user.id } });
  await logActivity({
    actorId: session.user.id,
    action: "PROCESS_INQUIRY",
    entityType: "inquiry",
    entityId: id,
    fromStatus: current.status,
    toStatus: parsed.data,
  });
  revalidatePath("/admin");
  revalidatePath("/worker");
  redirect(`/worker/inquiries/${id}?msg=Status inquiry diperbarui.`);
}
