# Furniture — Company Profile + Sistem Informasi Perusahaan

Website perusahaan furniture: **company profile + katalog produk + portofolio + artikel + galeri + inquiry pelanggan** di sisi publik, dan **dashboard admin** untuk mengelola seluruh konten. Semua data dinamis berasal dari database MySQL — tidak ada konten penting yang di-hard-code.

Alur bisnis utama:

```text
Public Website → Inquiry → Database → Admin Dashboard
```

## Fitur

**Website publik** (`/`): beranda editorial, tentang perusahaan (`/about`), katalog produk dengan cari/filter kategori/pagination (`/products`, `/products/[slug]`), portofolio proyek (`/portfolio`), artikel/berita (`/articles`), galeri (`/gallery`), kontak + form inquiry (`/contact`, tanpa login, tanpa harga — tombol "Tanya Produk").

**Admin** (`/admin`, login wajib role ADMIN): dashboard statistik + badge approval, pusat **Approval** pengajuan worker (setujui/tolak + alasan wajib), CRUD produk (multi-upload maks 8 foto + gambar utama), CRUD kategori (proteksi hapus bila dipakai produk), CRUD portofolio (maks 10 foto, eksklusif admin), CRUD artikel (editor Tiptap + Draf/Tayang), galeri (upload + metadata + hapus), profil perusahaan singleton, kelola inquiry (cari, filter status, ubah status, balas via WhatsApp), **Kelola Worker** (buat akun, nonaktifkan, reset password), notifikasi (bell + daftar).

**Worker** (`/worker`, login role WORKER): dashboard status pengajuan (pending/disetujui/ditolak), kelola Produk/Artikel/Galeri **milik sendiri** (terbit via approval admin), kategori (langsung berlaku, tanpa hapus), inquiry (proses bebas, tercatat), Pengajuan Saya (riwayat + alasan penolakan), notifikasi, profil akun. Alur: `DRAF → ajukan → PENDING → APPROVED (tayang) / REJECTED (perbaiki)`. Mengubah karya yang tayang menurunkannya sementara sampai review ulang disetujui.

## Tech Stack

| Kategori | Pilihan |
|---|---|
| Framework | Next.js 16.3 (App Router, `app/` di root) + React 19 |
| Bahasa | TypeScript (strict, tanpa `any`) |
| Styling | Tailwind CSS v4 + Motion (animasi) |
| Database | MySQL + Prisma v6 |
| Auth | Auth.js v5 (Credentials + bcrypt + JWT sesi 8 jam, role `ADMIN`/`WORKER`) |
| Validasi | Zod (server-side, selalu) |
| Editor | Tiptap (output HTML disanitasi server-side) |
| Ikon | Lucide React |
| Package manager | npm |

Arsitektur: `UI → Server Action → Service → Prisma → MySQL`. Server Components sebagai default; Client Components hanya untuk interaktivitas (form, galeri, editor, dropzone).

## Instalasi

```bash
npm install
cp .env.example .env   # lalu isi nilainya (lihat bawah)
```

## Environment Variables

```env
DATABASE_URL="mysql://root:@localhost:3306/furniture_db"
AUTH_SECRET=""            # generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STORAGE_PROVIDER="local"
```

> Jangan commit file `.env`. Lihat komentar di `.env.example` untuk variabel storage produksi (R2/S3).

## Database: Migrasi & Seed

```bash
npx prisma migrate dev      # buat/update tabel
npm run db:seed             # isi data demo development
npx prisma studio           # (opsional) GUI database
```

**Akun demo — KHUSUS DEVELOPMENT, ganti/hapus di produksi:**

```text
admin:  admin@furniture.local / Admin123!
worker: worker@furniture.local / Worker123!
```

Seed mengisi: 6 kategori, 12 produk + foto (picsum, ganti foto asli di produksi), 3 portofolio, 3 artikel, 6 galeri, 5 inquiry, 1 profil perusahaan, 1 worker demo + contoh pengajuan PENDING (1 produk + 1 artikel) + notifikasi untuk admin.

> Awas: seed menghapus seluruh isi tabel dulu. Jangan jalankan di database berisi data asli.

## Development & Production

```bash
npm run dev     # http://localhost:3000 (butuh MySQL jalan + .env terisi)
npm run lint    # ESLint, wajib bersih
npx tsc --noEmit
npm run build   # wajib exit 0 sebelum dianggap selesai
npm start       # jalankan hasil build
```

Login di `/login` (satu pintu; worker diarahkan ke `/worker`). Proteksi 3 lapis: `proxy.ts` (`/admin/*` ADMIN saja, `/worker/*` ADMIN/WORKER) + cek `auth()` + role di setiap layout/action + filter query (`createdById`, `approvalStatus`).

## Struktur Folder

```text
app/
├── (public)/            # beranda, about, products, portfolio, articles, gallery, contact
├── (auth)/login/        # login staf (satu pintu)
├── admin/               # dashboard + CRUD + approvals + workers + notifikasi
├── worker/              # dashboard + karya saya + submissions + notifikasi + profil
├── sitemap.ts robots.ts
components/
├── public/              # header, footer, kartu, galeri, form inquiry, reveal
├── admin/               # form CRUD, dropzone, editor, tombol hapus, pagination
├── worker/              # layout worker, bell, badge approval
└── notifications/       # daftar notifikasi (dipakai admin + worker)
lib/
├── db.ts auth.ts storage.ts upload.ts sanitize.ts rate-limit.ts validations.ts
└── actions/             # server actions per domain (+ worker-*, approvals, workers, notifications, workflow, account)
services/                # public, catalog, content, dashboard, admin, worker, approval, notification
prisma/                  # schema.prisma, seed.ts, migrations/
proxy.ts                 # proteksi optimistis /admin/* dan /worker/*
```

Upload development tersimpan di `public/uploads/` (git-ignored). Untuk produksi gunakan object storage (R2/S3) dengan mengimplementasikan interface di `lib/storage.ts` — service layer tidak perlu berubah. Tambahkan domain storage ke `remotePatterns` di `next.config.ts`.

## Troubleshooting

| Gejala | Penyebab umum |
|---|---|
| `Can't reach database` saat migrate/dev | MySQL belum jalan / `DATABASE_URL` salah (cek port 3306, user, nama DB) |
| Redirect loop `/login` | `AUTH_SECRET` kosong |
| Error `encType ... function as the action` | Jangan pasang `encType`/`method` pada form Server Action (React 19 melarang) |
| Error `body size limit for Server Actions` saat upload | Bawaan Next 1MB; sudah dinaikkan (`experimental.serverActions.bodySizeLimit: 20mb` di `next.config.ts`) — restart dev bila diubah |
| `npm install` gagal `edgesOut` | Bug npm 11 + Node 26 → ulangi dengan `--legacy-peer-deps` |
| Tipe basi `.next/types` setelah pindah route | Jalankan `npx next typegen` (jangan hapus `.next` saat dev jalan) |
| Foto seed picsum tidak muncul offline | Wajar — ganti dengan upload asli via dashboard |
| `EPERM ... query_engine` saat `prisma generate` | Dev server mengunci file engine → hentikan `next dev` dulu, generate, nyalakan lagi |
| Migrasi `createdById` gagal (tabel tidak kosong) | Normal untuk DB lama — migrasi worker_approval sudah menyertakan backfill otomatis ke admin pertama |

## Batasan (Keputusan Sadar)

Tanpa harga (inquiry only), Bahasa Indonesia, tanpa cart/payment, tanpa test otomatis, tanpa dark mode (brand dikunci terang), Cache Components belum diaktifkan, tanpa realtime/WebSocket (notifikasi dibaca saat navigasi), sesi JWT 8 jam (perubahan role/nonaktif berlaku maks setelah login ulang).

Checklist uji manual: login/logout tiap role · worker ditolak di `/admin` · akun nonaktif ditolak login · worker CRUD miliknya + ajukan → tidak tayang · admin approve → tayang · reject + alasan → worker lihat & perbaiki · worker-B tak bisa buka milik worker-A · edit tayangan turun sementara · inquiry diproses worker tercatat · upload + gambar utama · draft/publish artikel · responsif mobile/tablet/desktop · 404/loading/error states.
