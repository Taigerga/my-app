"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { saveUploads } from "@/lib/upload";
import { CompanyProfileSchema } from "@/lib/validations";
import { formValues, requireAdmin, type ActionState } from "./helpers";

const KEYS = [
  "name", "tagline", "description", "history", "vision", "mission",
  "phone", "whatsapp", "email", "address", "mapsUrl",
  "instagram", "facebook", "linkedin", "hours",
];

export async function updateCompanyAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = formValues(formData, KEYS);
  const parsed = CompanyProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }

  const current = await db.companyProfile.findFirst();
  const logoFiles = formData.getAll("logo").filter((f): f is File => f instanceof File && f.size > 0);
  let logoUrl = current?.logoUrl ?? null;
  if (logoFiles.length > 0) {
    try {
      const [url] = await saveUploads(logoFiles.slice(0, 1), getStorage(), "logo");
      if (logoUrl) await getStorage().remove(logoUrl);
      logoUrl = url;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Upload logo gagal.", values: raw };
    }
  }

  const heroFiles = formData.getAll("hero").filter((f): f is File => f instanceof File && f.size > 0);
  let heroImageUrl = current?.heroImageUrl ?? null;
  if (formData.get("removeHero") === "on") {
    if (heroImageUrl) await getStorage().remove(heroImageUrl);
    heroImageUrl = null;
  } else if (heroFiles.length > 0) {
    try {
      const [url] = await saveUploads(heroFiles.slice(0, 1), getStorage(), "hero");
      if (heroImageUrl) await getStorage().remove(heroImageUrl);
      heroImageUrl = url;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Upload foto hero gagal.", values: raw };
    }
  }

  const data = {
    name: parsed.data.name,
    tagline: parsed.data.tagline || null,
    description: parsed.data.description || null,
    history: parsed.data.history || null,
    vision: parsed.data.vision || null,
    mission: parsed.data.mission || null,
    phone: parsed.data.phone || null,
    whatsapp: parsed.data.whatsapp || null,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
    mapsUrl: parsed.data.mapsUrl || null,
    instagram: parsed.data.instagram || null,
    facebook: parsed.data.facebook || null,
    linkedin: parsed.data.linkedin || null,
    hours: parsed.data.hours || null,
    logoUrl,
    heroImageUrl,
  };

  if (current) {
    await db.companyProfile.update({ where: { id: current.id }, data });
  } else {
    await db.companyProfile.create({ data });
  }

  revalidatePath("/", "layout");
  redirect("/admin/company-profile?msg=Profil perusahaan berhasil disimpan.");
}
