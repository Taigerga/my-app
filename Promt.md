# Project Brief — Company Profile + Sistem Informasi Perusahaan Furniture

## 1. Role

Anda bertindak sebagai **Senior Full-Stack Web Developer, Software Architect, UI/UX Engineer, dan Code Reviewer**.

Tugas Anda adalah membangun aplikasi web perusahaan furniture berbasis **Next.js 16** yang bukan hanya berupa landing page/company profile statis, tetapi merupakan **sistem informasi perusahaan** dengan website publik dan dashboard admin untuk mengelola konten.

Sebelum melakukan implementasi, lakukan analisis requirement, periksa struktur project yang sudah ada, dan gunakan dokumentasi resmi teknologi yang digunakan sebagai referensi utama.

---

## 2. Tujuan Sistem

Buat sebuah website perusahaan furniture yang memiliki dua bagian utama:

1. **Public Website**
   - Berfungsi sebagai company profile.
   - Menampilkan informasi perusahaan.
   - Menampilkan katalog produk.
   - Menampilkan portofolio/proyek.
   - Menampilkan artikel/berita.
   - Menyediakan form inquiry pelanggan.

2. **Admin System**
   - Dashboard khusus administrator.
   - Admin dapat mengelola seluruh konten yang ditampilkan pada website publik.
   - Admin dapat mengelola produk, kategori, portofolio, artikel, galeri, informasi perusahaan, dan inquiry pelanggan.

Sistem harus memiliki **alur bisnis nyata**, sehingga proyek tidak dianggap hanya sebagai landing page.

---

## 3. Prinsip Utama

- Jangan membuat website hanya sebagai landing page.
- Company profile harus menjadi bagian dari sistem informasi.
- Semua data dinamis harus berasal dari database.
- Admin dapat melakukan CRUD terhadap data utama.
- Gunakan arsitektur yang maintainable dan scalable.
- Jangan melakukan overengineering tanpa alasan.
- Gunakan teknologi yang sesuai dengan Next.js 16.
- Prioritaskan dokumentasi resmi.
- Jangan menggunakan library yang tidak diperlukan.
- Jangan membuat fitur hanya untuk terlihat kompleks.
- UI harus profesional, modern, responsive, dan nyaman digunakan.
- Hindari desain yang terlalu ramai, norak, atau menggunakan animasi berlebihan.
- Gunakan komponen reusable.
- Gunakan TypeScript secara konsisten.
- Validasi input di server.
- Terapkan authorization pada seluruh fitur admin.
- Jangan mempercayai validasi client-side sebagai satu-satunya validasi.

---

## 4. Teknologi Utama

| Kategori | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js 16 (App Router) | Struktur **tanpa** folder `src/` — `app/` langsung di root project |
| Bahasa | TypeScript | Konsisten di seluruh codebase, hindari `any` |
| UI | React terbaru kompatibel Next.js 16 | Server Components sebagai default |
| Styling | Tailwind CSS | Hindari CSS-in-JS tambahan yang tidak perlu |
| Database | PostgreSQL | Kecuali ada alasan teknis kuat memakai alternatif |
| ORM | Prisma | Kecuali project sudah memakai Drizzle |
| Authentication | Auth.js (NextAuth) v5, session strategy database/JWT sesuai kebutuhan | Wajib kompatibel App Router & Server Actions |
| Validation | Zod | Wajib dijalankan di server, bukan hanya client |
| Icons | Lucide React | — |
| Rich Text Editor | Tiptap (untuk konten artikel) | Output HTML wajib disanitasi sebelum disimpan/ditampilkan |
| Image/File Storage | Lihat Bagian 24 | Local disk **hanya** untuk development |
| Package Manager | pnpm | Kecuali project sudah punya lockfile npm/yarn — ikuti yang sudah ada |
| Testing | Vitest (unit/service layer), Playwright (E2E flow inquiry & admin CRUD) | Sesuai skala kebutuhan, jangan overengineer test suite |
| Linting/Formatting | ESLint, Prettier | Wajib lolos sebelum implementasi dianggap selesai |

Untuk database, periksa kondisi project terlebih dahulu. Jika project belum memiliki database, gunakan **PostgreSQL + Prisma** kecuali terdapat alasan teknis yang kuat untuk menggunakan alternatif lain.

---

## 5. Wajib Membaca Dokumentasi

Sebelum implementasi, pelajari dokumentasi resmi terbaru yang relevan. Prioritaskan:

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Prisma
- Auth.js (NextAuth) v5
- Zod

Gunakan dokumentasi resmi sebagai sumber utama. Jangan menggunakan API atau pola implementasi Next.js lama apabila sudah tidak sesuai dengan Next.js 16.

Perhatikan perubahan terbaru pada: App Router, Server Components, Client Components, Server Actions, Route Handlers, Caching, Revalidation, Authentication, Middleware/proxy jika relevan, Form handling, Metadata, Image optimization.

---

## 6. Arsitektur Aplikasi

Gunakan App Router **tanpa** folder `src/` — semua berada langsung di root project (saat `create-next-app`, jawab **No** pada pertanyaan penggunaan direktori `src/`).

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── about/
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/
│   ├── portfolio/
│   │   ├── page.tsx
│   │   └── [slug]/
│   ├── articles/
│   │   ├── page.tsx
│   │   └── [slug]/
│   ├── gallery/
│   └── contact/
│
├── (auth)/
│   └── login/
│
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products/
│   ├── categories/
│   ├── portfolios/
│   ├── articles/
│   ├── gallery/
│   ├── inquiries/
│   └── company-profile/
│
└── api/
    └── ...

components/
├── ui/
├── public/
└── admin/

lib/
├── db.ts
├── auth.ts
├── storage.ts          # abstraction layer image/file storage
└── validations/

services/
├── product.service.ts
├── category.service.ts
├── portfolio.service.ts
├── article.service.ts
├── inquiry.service.ts
├── gallery.service.ts
└── company.service.ts

types/

prisma/
├── schema.prisma
└── seed.ts
```

Struktur di atas adalah acuan konseptual — sesuaikan dengan best practice Next.js 16 setelah melakukan research dokumentasi, tetapi **jangan** memindahkan kembali ke dalam `src/`.

---

## 7. Role Sistem

Minimal terdapat dua role:

**Admin** dapat: login, melihat dashboard, mengelola produk, mengelola kategori, mengelola portofolio, mengelola artikel, mengelola galeri, mengelola company profile, melihat dan mengelola inquiry, mengubah status inquiry.

**Customer / Visitor** tidak wajib login. Dapat: melihat company profile, melihat produk, melihat detail produk, melihat portofolio, melihat artikel, melihat galeri, mengirim inquiry.

Jangan mewajibkan customer login apabila requirement bisnis perusahaan tidak membutuhkannya.

---

## 8. Public Website — Homepage

Route: `/`

Isi: Navbar, Hero section, Company introduction, Featured products, Company statistics, Company advantages, Featured portfolio, Latest articles, CTA inquiry/contact, Footer.

Homepage tidak boleh terlalu penuh. Prioritaskan hierarchy dan readability.

---

## 9. Company Profile

Route: `/about`

Tampilkan: nama perusahaan, logo, deskripsi, sejarah perusahaan, visi, misi, nilai perusahaan, keunggulan, informasi kontak, lokasi.

Semua informasi utama harus dapat dikelola melalui dashboard admin.

---

## 10. Product Catalog

Route: `/products`, `/products/[slug]`

**Product List** menampilkan: produk, foto, nama, kategori, deskripsi singkat, status. Tambahkan search, filter kategori, dan pagination (**default 12 item/halaman**) jika jumlah data besar.

**Product Detail** menampilkan: nama produk, gallery foto (maksimal 8 gambar per produk, satu ditandai sebagai gambar utama/thumbnail), deskripsi, spesifikasi, material, ukuran, warna/varian jika tersedia, kategori, produk terkait, tombol **"Tanya Produk"**.

---

## 11. Customer Inquiry System

Fitur utama sistem. Customer tidak perlu membeli produk secara langsung.

```text
Visitor → Products → Product Detail → Tanya Produk
   → Inquiry Form → Server Validation → Database → Admin Dashboard
```

Form: Nama, Email, Nomor WhatsApp, Produk, Jumlah, Pesan.

Status inquiry: `NEW`, `CONTACTED`, `PROCESSING`, `COMPLETED`, `CANCELLED`.

Admin dapat: melihat inquiry, membuka detail, mengubah status, mencari inquiry, filter berdasarkan status, melihat tanggal inquiry.

---

## 12. Portfolio / Project

Route: `/portfolio`, `/portfolio/[slug]`

Data: nama proyek, client, tahun, lokasi, kategori, deskripsi, foto (maksimal 10 gambar per proyek).

Admin dapat melakukan CRUD.

---

## 13. Article / News

Route: `/articles`, `/articles/[slug]`

Fitur: judul, slug, thumbnail, content (rich text via Tiptap, disanitasi sebelum disimpan), author, published date, status draft/published.

Admin dapat: create, read, update, delete, publish/unpublish.

Gunakan slug SEO-friendly.

---

## 14. Gallery

Route: `/gallery`

Berisi: foto produk, foto workshop, foto kantor, foto proyek, foto kegiatan perusahaan.

Admin dapat: upload, edit metadata, delete, categorize. Pastikan image handling aman (lihat Bagian 24).

---

## 15. Admin Dashboard

Route: `/admin`

Minimal menampilkan: Total Products, Total Portfolio, Total Articles, Total Inquiry, New Inquiry.

Tambahkan visualisasi sederhana jika relevan, contoh:

```text
Inquiry Statistics
──────────────────────
New          12
Contacted     8
Processing    5
Completed    20
```

Jangan membuat dashboard terlalu kompleks jika tidak diperlukan.

---

## 16. Admin Product Management

Route: `/admin/products`

Fitur: list, search, filter, pagination, create, edit, delete, view detail, upload image (multi-upload, drag-to-reorder untuk menentukan gambar utama).

Form: Product Name, Category, Description, Material, Dimension, Color, Specifications, Image, Status.

Gunakan server-side validation.

---

## 17. Admin Category Management

Route: `/admin/categories`

CRUD: create, read, update, delete.

Contoh: Kursi, Meja, Lemari, Sofa, Bedroom, Office, Custom Furniture.

---

## 18. Admin Portfolio Management

Route: `/admin/portfolios`

CRUD: project name, client, location, year, category, description, images, status.

---

## 19. Admin Article Management

Route: `/admin/articles`

CRUD: title, slug, thumbnail, content, author, status, published date.

Status: `DRAFT`, `PUBLISHED`.

---

## 20. Admin Company Profile Management

Route: `/admin/company-profile`

Admin dapat mengubah: Company Name, Logo, Description, History, Vision, Mission, Phone, WhatsApp, Email, Address, Google Maps URL, Instagram, Facebook, LinkedIn, Operating Hours.

Jangan hard-code informasi perusahaan pada component jika data tersebut seharusnya dapat diubah admin.

---

## 21. Database

Gunakan relational database. Minimal model:

```text
User
Category
Product
ProductImage
Portfolio
PortfolioImage
Article
Gallery
Inquiry
CompanyProfile
```

Relasi konseptual:

```text
Category ── Product ── ProductImage
Portfolio ── PortfolioImage
Product ── Inquiry
User ── Article
CompanyProfile (singleton)
```

Ketentuan:

- UUID atau CUID untuk identifier.
- `createdAt`, `updatedAt` pada seluruh model.
- `slug` untuk entity publik yang membutuhkannya (Product, Portfolio, Article), dengan **unique index**.
- Enum untuk status (`InquiryStatus`, `ArticleStatus`, `ProductStatus`, `Role`).
- Index tambahan pada foreign key yang sering di-query (`Product.categoryId`, `Inquiry.status`, `Inquiry.productId`).
- Buat foreign key dan relation dengan benar (`onDelete` policy eksplisit — misal `Restrict` untuk Category yang masih dipakai Product, `Cascade` untuk child images).

---

## 22. Authentication

Menggunakan **Auth.js (NextAuth) v5** dengan Credentials provider (email + password hashing via bcrypt/argon2).

Requirement:

- Login, logout.
- Protected admin routes (diverifikasi di server — middleware/route segment, **bukan** hanya menyembunyikan menu di frontend).
- Session management.
- Password hashing.
- Authorization berdasarkan role (`Role.ADMIN`).

Visitor tidak boleh dapat mengakses `/admin/*` tanpa authentication dan authorization yang valid.

---

## 23. Security

Implementasikan minimal:

- Password hashing (bcrypt/argon2).
- Server-side validation (Zod) pada seluruh Server Action & Route Handler.
- Authorization di server pada setiap operasi admin.
- CSRF protection: Server Actions Next.js sudah memiliki proteksi origin-checking bawaan — pastikan tidak menonaktifkannya; untuk Route Handler yang menerima form dari luar origin, tambahkan pengecekan tambahan bila relevan.
- Rate limiting pada endpoint sensitif (login, inquiry form) untuk mencegah spam/brute-force.
- Validasi file upload: cek MIME type asli (bukan hanya ekstensi), restriksi ukuran (misal maks 2MB/gambar), restriksi tipe (`jpg`, `jpeg`, `png`, `webp`).
- Sanitization content HTML dari rich text editor (misal via `sanitize-html` atau `dompurify` server-side) sebelum disimpan.
- Jangan expose secret key, gunakan environment variables, jangan commit `.env`.
- Jangan percaya input dari client.

---

## 24. Image Handling & Storage Strategy

Karena website furniture sangat bergantung pada gambar, dan upload ke local disk **tidak persist** pada deployment serverless (Vercel dkk):

- **Development**: boleh menyimpan ke local disk (`public/uploads/` atau folder terpisah) untuk mempercepat iterasi.
- **Production**: gunakan external object storage (pilih salah satu sesuai preferensi/infra yang tersedia — misal Cloudflare R2, AWS S3, atau UploadThing). Buat **abstraction layer** di `lib/storage.ts` (interface `upload()`, `delete()`, `getUrl()`) agar provider storage dapat diganti tanpa mengubah service layer.
- Gunakan `next/image` dengan `remotePatterns` untuk domain storage eksternal.
- Gunakan responsive image, lazy loading, alt text wajib.
- Pisahkan image storage (file fisik) dari metadata database (path/URL saja yang disimpan di DB).

---

## 25. UI/UX

Gaya: **Modern Corporate Furniture** — professional, minimal, elegant, clean, premium, warm, responsive.

Hindari: gradient berlebihan, animasi berlebihan, parallax berlebihan, glassmorphism berlebihan, font terlalu dekoratif, warna terlalu mencolok, card berlebihan, layout yang terlihat seperti template AI generik.

Gunakan whitespace dengan baik.

---

## 26. Responsive Design

Wajib mendukung: Mobile, Tablet, Desktop, Large Desktop. Prioritaskan mobile usability: navbar responsive, table admin dapat digunakan pada mobile (card view di layar kecil), form tidak overflow, image responsive, button mudah ditekan, typography tetap terbaca.

---

## 27. Accessibility

Terapkan dasar WCAG: semantic HTML, keyboard navigation, focus state, proper heading hierarchy, accessible form labels, alt text, sufficient color contrast, tidak mengandalkan warna saja untuk status (tambahkan label/icon), accessible error message, ARIA hanya jika diperlukan.

---

## 28. SEO

Implementasikan: metadata dinamis (title, description, Open Graph, Twitter/X card) berdasarkan data database untuk halaman produk & artikel, canonical URL jika diperlukan, sitemap, `robots.txt`, semantic HTML, SEO-friendly slug.

---

## 29. Performance

- Server Components sebagai default; Client Components hanya ketika diperlukan (`"use client"` seminimal mungkin).
- Image optimization via `next/image`.
- Caching & revalidation yang sesuai setelah perubahan data admin (`revalidatePath`/`revalidateTag`).
- Pagination pada seluruh list data besar.
- Database indexing pada kolom yang sering di-query.
- Hindari N+1 queries (gunakan `include`/`select` Prisma secara eksplisit).
- Jangan mengambil seluruh data jika hanya membutuhkan sebagian.

---

## 30. Data Fetching

Prioritaskan Server Components, Server Actions, dan Route Handlers sesuai kebutuhan. Jangan membuat semua operasi menjadi API endpoint hanya karena frontend menggunakan React. Gunakan Route Handler ketika memang diperlukan: external API, client-side interaction tertentu, webhook, public endpoint, integrasi sistem lain.

---

## 31. Service Layer

Pisahkan business logic dari UI.

```text
UI → Server Action / Route Handler → Service → ORM (Prisma) → Database
```

Component/page tidak boleh dipenuhi business logic yang kompleks.

---

## 32. Validation

Gunakan Zod: `ProductSchema`, `InquirySchema`, `CategorySchema`, `PortfolioSchema`, `ArticleSchema`, `CompanyProfileSchema`, `GallerySchema`, `LoginSchema`.

Validasi harus dilakukan di server. Client-side validation boleh digunakan sebagai UX tambahan, tetapi bukan pengganti server validation.

---

## 33. Error Handling

Implementasikan loading state, empty state, error state, form validation error, not found, unauthorized, forbidden, database error handling. Gunakan `loading.tsx`, `error.tsx`, `not-found.tsx` sesuai struktur route.

---

## 34. Admin UX

Dashboard admin harus berbeda secara visual dari public website.

```text
┌─────────────────────────────────────────┐
│ Sidebar          │ Header              │
│                  │                     │
│ Dashboard        │ Content             │
│ Products         │                     │
│ Categories       │                     │
│ Portfolio        │                     │
│ Articles         │                     │
│ Gallery          │                     │
│ Inquiry          │                     │
│ Company Profile  │                     │
│                  │                     │
│ Logout           │                     │
└─────────────────────────────────────────┘
```

Tambahkan: sidebar responsive (collapse di mobile), breadcrumb, page title, search, filter, confirmation dialog untuk delete, toast notification, empty state.

---

## 35. Seed Data

Buat seed database (`prisma/seed.ts`) untuk development, minimal:

- 1 admin.
- 5–10 categories.
- 10–20 products.
- Beberapa portfolio.
- Beberapa articles.
- Beberapa gallery.
- Beberapa inquiry.
- 1 company profile.

Gunakan data dummy yang jelas ditandai sebagai development/demo data. Jangan menggunakan data perusahaan asli jika belum diberikan.

---

## 36. Environment Variables

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=

# Storage (pilih sesuai provider yang dipakai)
STORAGE_PROVIDER=       # local | s3 | r2 | uploadthing
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_ENDPOINT=
STORAGE_PUBLIC_URL=
```

Jangan hard-code secret. Buat `.env.example` yang selalu sinkron dengan variable yang benar-benar dipakai.

---

## 37. Development Workflow

1. Inspect repository.
2. Periksa `package.json`.
3. Periksa versi Next.js.
4. Periksa struktur folder.
5. Periksa database configuration.
6. Periksa existing components.
7. Periksa existing dependencies.
8. Baca dokumentasi resmi.
9. Buat implementation plan.
10. Baru mulai implementasi.

Jangan langsung mengubah banyak file tanpa memahami project yang sudah ada.

---

## 38. Implementation Order

**Phase 1 — Foundation**: project structure (root `app/`, bukan `src/`), database, ORM, environment, authentication, basic UI system.

**Phase 2 — Public Website**: navbar, homepage, about, products, product detail, portfolio, articles, gallery, contact.

**Phase 3 — Admin System**: admin layout, dashboard, product CRUD, category CRUD, portfolio CRUD, article CRUD, gallery management, company profile management, inquiry management.

**Phase 4 — Integration**: hubungkan public website dengan database, pastikan perubahan admin tercermin di public website via caching/revalidation yang tepat.

**Phase 5 — Security & Quality**: authorization, validation, error handling, upload security, rate limiting, accessibility, SEO, performance.

**Phase 6 — Testing**: authentication, authorization, CRUD, form validation, inquiry, image upload, public pages, responsive layout, error handling.

---

## 39. Testing Checklist

**Authentication**: admin dapat login · password tidak disimpan plaintext · user tanpa permission tidak dapat membuka admin · logout bekerja.

**Product**: create · read · update · delete · validation · image upload · category relation.

**Inquiry**: visitor dapat mengirim inquiry · validation berjalan · data masuk database · admin dapat melihat · admin dapat mengubah status.

**Article**: draft · publish · slug · detail page · metadata.

**Public Website**: responsive · SEO · accessibility · loading state · empty state · error state.

---

## 40. Code Quality

Kode harus type-safe, modular, reusable, mudah dibaca, tidak duplicate secara berlebihan, naming convention konsisten, tanpa dead code, tanpa `console.log` yang tidak diperlukan, tanpa `any` tanpa alasan, tanpa workaround yang tidak terdokumentasi, tanpa mengabaikan TypeScript error.

---

## 41. Jangan Melakukan Hal Berikut

Jangan: membuat hanya homepage · membuat seluruh data hard-coded · membuat dashboard palsu yang tidak terhubung database · membuat tombol CRUD yang tidak benar-benar bekerja · menyimpan password plaintext · menaruh secret di source code · membuat API hanya demi terlihat seperti sistem · menggunakan library berlebihan · menggunakan dependency yang tidak kompatibel dengan Next.js 16 · menggunakan API Next.js versi lama tanpa memeriksa dokumentasi · membuat UI terlalu kompleks · membuat fitur e-commerce jika tidak ada requirement · menambahkan payment gateway tanpa kebutuhan bisnis · menambahkan customer authentication tanpa kebutuhan · menganggap company profile = landing page · **memindahkan struktur folder ke dalam `src/`**.

---

## 42. Prinsip Fitur Bisnis

Sistem ini **bukan marketplace**.

```text
Company Profile + Product Catalog + Portfolio
+ Content Management + Customer Inquiry + Admin Dashboard
```

Bukan: Marketplace, E-Commerce, Payment Gateway, Shopping Cart, Order Management — kecuali requirement perusahaan nantinya secara eksplisit memerlukannya.

---

## 43. Dokumentasi Project

Setelah implementasi, buat/update `README.md` berisi minimal: project overview, features, tech stack, architecture, installation, environment variables, database setup, migration, seed, development, production build, authentication, folder structure, deployment, troubleshooting.

Tambahkan diagram alur singkat:

```text
Public Website → Inquiry → Database → Admin Dashboard
```

---

## 44. Output yang Saya Harapkan dari Anda

**A. Project Analysis** — kondisi project, teknologi yang sudah tersedia, dependency yang sudah tersedia, bagian yang perlu ditambahkan, potensi konflik dependency.

**B. Architecture Plan** — folder structure (root `app/`), database architecture, authentication architecture, data flow, public/admin separation.

**C. Database Design** — semua model, field, relation, enum, index yang diperlukan.

**D. Implementation Plan** — tahap implementasi yang jelas.

Setelah plan disetujui atau jika instruksi lingkungan mengizinkan autonomous implementation, lanjutkan implementasi secara bertahap.

---

## 45. Acceptance Criteria

1. Website public dapat diakses.
2. Company profile berasal dari database.
3. Produk berasal dari database.
4. Admin dapat login.
5. Admin memiliki dashboard.
6. Admin dapat CRUD produk.
7. Admin dapat CRUD kategori.
8. Admin dapat CRUD portfolio.
9. Admin dapat CRUD artikel.
10. Admin dapat mengelola gallery.
11. Admin dapat mengubah company profile.
12. Visitor dapat mengirim inquiry.
13. Inquiry tersimpan di database.
14. Admin dapat mengelola inquiry.
15. Authorization admin bekerja.
16. Server-side validation bekerja.
17. Image handling bekerja (termasuk strategi storage production).
18. Website responsive.
19. SEO dasar diterapkan.
20. Accessibility dasar diterapkan.
21. Error/loading/empty state tersedia.
22. Tidak ada data penting yang hanya hard-coded.
23. Tidak ada secret yang di-commit.
24. `npm run build` (atau `pnpm build`) berhasil.
25. TypeScript tidak memiliki error.
26. README tersedia.
27. Struktur project menggunakan `app/` di root, **tanpa** `src/`.

---

## 46. Prinsip Akhir

Jangan mengejar jumlah fitur. Prioritaskan:

```text
Requirement → Architecture → Database → Business Logic
→ Public Website → Admin System → Integration
→ Security → Testing → Documentation
```

Tujuan akhir adalah menghasilkan **sistem informasi company profile perusahaan yang benar-benar dapat digunakan**, bukan sekadar website presentasi. Gunakan Next.js 16 dan ekosistem modernnya secara tepat, tetapi tetap jaga agar implementasi sederhana, maintainable, dan sesuai kebutuhan perusahaan.