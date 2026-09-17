# Furniture — Company Profile + Sistem Informasi Perusahaan

Website perusahaan furniture: **company profile + katalog produk + portofolio + artikel + galeri + inquiry pelanggan** di sisi publik, dan **dashboard admin** untuk mengelola seluruh konten. Semua data dinamis berasal dari database MySQL — tidak ada konten penting yang di-hard-code.

Alur bisnis utama:

```text
Public Website → Inquiry → Database → Admin Dashboard
```

## Fitur

**Website publik** (`/`): beranda editorial, tentang perusahaan (`/about`), katalog produk dengan cari/filter kategori/pagination (`/products`, `/products/[slug]`), portofolio proyek (`/portfolio`), artikel/berita (`/articles`), galeri (`/gallery`), kontak + form inquiry (`/contact`, tanpa login, tanpa harga — tombol "Tanya Produk").

**Admin** (`/admin`, login wajib): dashboard statistik, CRUD produk (multi-upload maks 8 foto + gambar utama), CRUD kategori (proteksi hapus bila dipakai produk), CRUD portofolio (maks 10 foto), CRUD artikel (editor Tiptap + Draf/Tayang), galeri (upload + metadata + hapus), profil perusahaan singleton, kelola inquiry (cari, filter status, ubah status, balas via WhatsApp).

## Tech Stack

| Kategori | Pilihan |
|---|---|
| Framework | Next.js 16.3 (App Router, `app/` di root) + React 19 |
| Bahasa | TypeScript (strict, tanpa `any`) |
| Styling | Tailwind CSS v4 + Motion (animasi) |
| Database | MySQL + Prisma v6 |
| Auth | Auth.js v5 (Credentials + bcrypt + JWT, role `ADMIN`) |
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
email: admin@furniture.local
password: Admin123!
```

Seed mengisi: 6 kategori, 12 produk + foto (picsum, ganti foto asli di produksi), 3 portofolio, 3 artikel, 6 galeri, 5 inquiry, 1 profil perusahaan.

## Development & Production

```bash
npm run dev     # http://localhost:3000 (butuh MySQL jalan + .env terisi)
npm run lint    # ESLint, wajib bersih
npx tsc --noEmit
npm run build   # wajib exit 0 sebelum dianggap selesai
npm start       # jalankan hasil build
```

Login admin di `/login`. Seluruh `/admin/*` diproteksi ganda: `proxy.ts` (redirect) + cek `auth()` + role di setiap layout/action.

## Struktur Folder

```text
app/
├── (public)/            # beranda, about, products, portfolio, articles, gallery, contact
├── (auth)/login/        # login admin
├── admin/               # dashboard + CRUD (layout sidebar terpisah)
├── sitemap.ts robots.ts
components/
├── public/              # header, footer, kartu, galeri, form inquiry, reveal
└── admin/               # form CRUD, dropzone, editor, tombol hapus, pagination
lib/
├── db.ts auth.ts storage.ts upload.ts sanitize.ts rate-limit.ts validations.ts
└── actions/             # server actions per domain
services/                # query database (public, catalog, content, dashboard, admin)
prisma/                  # schema.prisma, seed.ts, migrations/
proxy.ts                 # proteksi optimistis /admin/*
```

Upload development tersimpan di `public/uploads/` (git-ignored). Untuk produksi gunakan object storage (R2/S3) dengan mengimplementasikan interface di `lib/storage.ts` — service layer tidak perlu berubah. Tambahkan domain storage ke `remotePatterns` di `next.config.ts`.

## Troubleshooting

| Gejala | Penyebab umum |
|---|---|
| `Can't reach database` saat migrate/dev | MySQL belum jalan / `DATABASE_URL` salah (cek port 3306, user, nama DB) |
| Redirect loop `/login` | `AUTH_SECRET` kosong |
| Error `encType ... function as the action` | Jangan pasang `encType`/`method` pada form Server Action (React 19 melarang) |
| `npm install` gagal `edgesOut` | Bug npm 11 + Node 26 → ulangi dengan `--legacy-peer-deps` |
| Tipe basi `.next/types` setelah pindah route | Jalankan `npx next typegen` (jangan hapus `.next` saat dev jalan) |
| Foto seed picsum tidak muncul offline | Wajar — ganti dengan upload asli via dashboard |

## Batasan (Keputusan Sadar)

Tanpa harga (inquiry only), single admin, Bahasa Indonesia, tanpa cart/payment, tanpa test otomatis (checklist uji manual di bawah), tanpa dark mode (brand dikunci terang), Cache Components belum diaktifkan.

Checklist uji manual: login/logout · proteksi admin · CRUD tiap entitas · upload + gambar utama · inquiry publik→admin→ubah status · validasi form · draft/publish artikel · responsif mobile/tablet/desktop · 404/loading/error states.
