import { promises as fs } from "node:fs";
import path from "node:path";

export interface StorageProvider {
  upload(file: File, filename: string): Promise<{ url: string }>;
  remove(url: string): Promise<void>;
}

/** Development: simpan ke public/uploads. Production: ganti implementasi (R2/S3) tanpa ubah service. */
export class LocalStorage implements StorageProvider {
  private dir = path.join(process.cwd(), "public", "uploads");

  async upload(file: File, filename: string) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    await fs.mkdir(this.dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(this.dir, safe), bytes);
    return { url: `/uploads/${safe}` };
  }

  async remove(url: string) {
    if (!url.startsWith("/uploads/")) return;
    const name = path.basename(url);
    if (name === "." || name === "..") return;
    await fs.unlink(path.join(this.dir, name)).catch(() => undefined);
  }
}

export function getStorage(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider !== "local") {
    throw new Error(`Storage provider "${provider}" belum dikonfigurasi. Gunakan "local" untuk development.`);
  }
  return new LocalStorage();
}
