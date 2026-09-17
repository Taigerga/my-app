import type { StorageProvider } from "./storage";

/** Validasi file upload image: tipe + ukuran (maks 2MB). Cek magic number dasar via header bytes. */
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024;

const SIGNATURES: { mime: string; magic: number[][] }[] = [
  { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  { mime: "image/png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  { mime: "image/webp", magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF....
];

export async function validateImageFile(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "Tipe file harus jpg, jpeg, png, atau webp." };
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { ok: false, error: "Ukuran gambar maksimal 2MB." };
  }
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const matches = SIGNATURES.some(
    (s) => s.mime === file.type && s.magic.some((m) => m.every((b, i) => head[i] === b)),
  );
  if (!matches) {
    return { ok: false, error: "Isi file tidak sesuai dengan tipe gambar." };
  }
  return { ok: true };
}

export async function saveUploads(files: File[], storage: StorageProvider, prefix: string) {
  const urls: string[] = [];
  for (const [i, file] of files.entries()) {
    const check = await validateImageFile(file);
    if (!check.ok) throw new Error(check.error);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const { url } = await storage.upload(file, `${prefix}-${Date.now()}-${i}.${ext}`);
    urls.push(url);
  }
  return urls;
}
