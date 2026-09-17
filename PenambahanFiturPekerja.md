# Diskusi & Perencanaan Role Worker/Pekerja

Saya ingin menambahkan role pengguna baru ke dalam sistem, yaitu **Worker/Pekerja**.

Jangan langsung melakukan coding atau mengubah file project. Untuk tahap ini, lakukan **analisis, diskusi, dan perencanaan arsitektur terlebih dahulu**.

## Konteks

Saat ini sistem memiliki role utama:

1. Admin
2. User/Pengguna biasa

Saya ingin menambahkan role:

3. Worker/Pekerja

Worker akan memiliki dashboard yang secara konsep mirip dengan Admin karena Worker bertugas membantu mengelola konten/data website.

Namun, Worker **tidak memiliki kewenangan penuh seperti Admin**.

---

# Fitur yang Dapat Dikelola Worker

Worker dapat membuat dan mengelola data:

- Produk
- Kategori
- Artikel
- Galeri
- Inquiry

Tetapi terdapat mekanisme **approval Admin**.

Artinya:

- Worker dapat membuat data.
- Worker dapat mengedit data miliknya.
- Worker dapat menghapus/mengajukan perubahan sesuai aturan yang ditentukan.
- Data yang dibuat atau diubah oleh Worker **tidak langsung dipublikasikan**.
- Data harus menunggu persetujuan Admin.
- Admin dapat menerima atau menolak pengajuan Worker.
- Hanya data yang telah disetujui Admin yang dapat dianggap sebagai data resmi/published.

---

# Tujuan Diskusi

Sebelum implementasi, saya ingin Anda mendiskusikan dan merancang terlebih dahulu:

## 1. Perbedaan Dashboard Admin vs Worker

Analisis bagaimana sebaiknya dashboard Admin dan Worker dibedakan.

Contohnya:

### Admin

Admin harus memiliki kewenangan penuh terhadap sistem:

- Dashboard/overview
- Manajemen user
- Manajemen Worker
- Manajemen Produk
- Manajemen Portofolio
- Manajemen Kategori
- Manajemen Artikel
- Manajemen Galeri
- Manajemen Inquiry
- Manajemen Profil Perusahaan dan Profil Akun Admin
- Approval data Worker
- Pengaturan sistem web
- Pembuatan akun untuk admin dan pekerja/worker di dashboard admin
- Dan fitur administratif lainnya jika memang diperlukan

### Worker

Worker hanya memiliki akses terhadap pekerjaan operasional/content management, misalnya:

- Dashboard/overview Worker
- Produk
- Kategori
- Artikel
- Galeri
- Inquiry
- Profil Akun Pekerja

Tetapi Worker tidak boleh memiliki akses terhadap:

- Manajemen user
- Manajemen role/permission
- Pengaturan sistem web
- Approval milik sendiri
- Fitur administratif yang bersifat sensitif

Jangan menganggap daftar di atas sudah final. Evaluasi kembali dan berikan rekomendasi berdasarkan kebutuhan sistem.

---

# 2. Mekanisme Approval

Diskusikan bagaimana workflow approval yang paling tepat.

Contoh alur:

Worker
↓
Membuat/Mengubah data
↓
Status: Pending Approval
↓
Admin melakukan review
↓
├── Approve → Published/Approved
└── Reject → Rejected + alasan

Tetapi jangan langsung menganggap workflow tersebut sebagai keputusan final.

Analisis apakah setiap entity membutuhkan workflow yang sama:

- Produk
- Kategori
- Artikel
- Galeri
- Inquiry

Contohnya, apakah Inquiry memang perlu approval atau sebenarnya cukup dapat dibaca/diproses Worker dan Admin?

Berikan rekomendasi dan alasannya.

---

# 3. Status Data

Diskusikan status yang diperlukan untuk setiap jenis data.

Contoh kemungkinan(ingat ini hanya contoh):

- draft
- pending
- approved
- rejected
- published
- archived

Namun jangan menambahkan status yang tidak diperlukan.

Tentukan apakah lebih baik menggunakan:

### Opsi A
Status sederhana pada tabel utama.

atau:

### Opsi B
Memisahkan data utama dengan tabel approval/submission/revision.

Bandingkan kedua pendekatan tersebut dari sisi:

- Simplicity
- Maintainability
- Audit trail
- Data integrity
- Scalability
- Kemudahan implementasi Laravel
- Kemudahan pengembangan di masa depan

---

# 4. Hak Akses Worker

Rancang permission Worker secara detail.

Contoh:

| Fitur | Admin | Worker |
|---|---|---|
| Dashboard | ✓ | ✓ |
| Produk | Full | CRUD tetapi butuh persetujuan |
| Kategori | Full | CRUD tetapi butuh persetujuan |
| Artikel | Full | CRUD tetapi butuh persetujuan |
| Galeri | Full | CRUD tetapi butuh persetujuan |
| Inquiry | Full | Process/View |
| Approval | ✓ | ✗ |
| User Management | ✓ | ✗ |
| Worker Management | ✓ | ✗ |
| System web Settings | ✓ | ✗ |

Tetapi tabel tersebut hanya contoh.

Buat rancangan permission yang lebih tepat berdasarkan analisis sistem.

---

# 5. Ownership Data

Diskusikan apakah Worker hanya boleh mengedit data yang dibuat oleh dirinya sendiri atau boleh mengedit data yang dibuat Worker lain.

Bandingkan:

### Model A — Self Ownership
Worker hanya dapat mengelola data yang dibuat oleh dirinya sendiri.

### Model B — Shared Worker Management
Semua Worker dapat mengelola data yang dibuat Worker lain.

### Model C — Hybrid
Beberapa data hanya dapat diedit pembuatnya, sementara data tertentu dapat diedit semua Worker.

Berikan rekomendasi berdasarkan kebutuhan sistem perusahaan kecil-menengah.

---

# 6. Approval Revision

Perhatikan kasus berikut:

Worker membuat Produk A.

Admin menyetujui Produk A.

Kemudian Worker mengubah Produk A.

Apakah perubahan tersebut:

1. Langsung diterapkan?
2. Membuat status kembali menjadi Pending?
3. Membuat versi/revisi baru yang harus disetujui Admin?
4. Data lama tetap published sampai revisi disetujui?

Diskusikan mekanisme yang paling aman dan maintainable.

---

# 7. Rejected Data

Diskusikan apa yang terjadi ketika Admin menolak pengajuan Worker.

Contoh:

Worker mengajukan Artikel
↓
Admin Reject
↓
Worker melihat alasan penolakan
↓
Worker memperbaiki artikel
↓
Submit kembali
↓
Pending Approval

Tentukan apakah diperlukan:

- rejection_reason
- reviewed_by
- reviewed_at
- submitted_at
- approved_at
- revision history

---

# 8. Dashboard Information Architecture

Buat rancangan menu/sidebar untuk kedua dashboard.

Contoh:

## Admin Dashboard (ingat ini hanya contoh) : 

- Dashboard
- Produk
- Kategori
- Portofolio
- Artikel
- Galeri
- Inquiry
- Approval/Persetujuan(Nanti sebelah kanan ada pilihan bebas mau pakai lambang/logo/card atau apapun yang pasti untuk produk, kategori, artikel, galeri, dan inquiry yang dibuat oleh pekerja. Ketika ditekan muncul list approval)
- User Management
- Worker Management
- Activity Log
- Profil Perusahaan
- Settings
- Dan lain lain



## Worker Dashboard (ingat ini hanya contoh) :

- Dashboard
- Produk
- Kategori
- Artikel
- Galeri
- Inquiry
- My Submissions
- Notifications
- Profile Akun pekerja/worker

Evaluasi kembali struktur tersebut dan berikan struktur yang lebih baik jika diperlukan.

---

# 9. Dashboard Metrics

Diskusikan informasi apa yang sebaiknya ditampilkan pada dashboard masing-masing role.

### Admin

Contoh:

- Total User
- Total Worker
- Total Produk
- Total Artikel
- Total Galeri
- Pending Approval
- Approved
- Rejected
- Inquiry masuk
- Aktivitas terbaru

### Worker

Contoh:

- Produk yang dibuat
- Artikel yang dibuat
- Galeri yang dibuat
- Pending Submission
- Approved
- Rejected
- Inquiry yang perlu diproses
- Aktivitas/revisi terbaru

Jangan hanya menyalin metrics Admin ke Worker. Tentukan metrics berdasarkan kebutuhan masing-masing role.

---

# 10. Notification

Diskusikan apakah sistem membutuhkan notification.

Contoh:

### Worker menerima notifikasi:

- Submission berhasil dikirim
- Data disetujui Admin
- Data ditolak Admin
- Ada alasan penolakan
- Revision perlu diperbaiki

### Admin menerima notifikasi:

- Ada submission baru
- Ada revisi yang menunggu approval
- Ada inquiry baru

Tentukan mekanisme notification yang sesuai untuk tahap awal dan kemungkinan pengembangan selanjutnya.

---

# 11. Audit Trail

Karena Worker dapat mengirimkan data yang harus disetujui Admin, analisis kebutuhan audit trail.

Minimal pertimbangkan:

- siapa yang membuat data
- siapa yang mengubah data
- siapa yang mengajukan approval
- siapa yang melakukan approval
- kapan dilakukan
- status sebelumnya
- status sesudahnya
- alasan rejection

Diskusikan apakah cukup menggunakan field pada tabel utama atau membutuhkan tabel activity/audit log khusus.

---

# 12. Database

Setelah workflow disepakati, buat rancangan database secara konseptual.

Jangan langsung membuat migration.

Jelaskan kemungkinan perubahan pada:

- users
- products
- categories
- articles
- galleries
- inquiries

Dan jika diperlukan:

- approvals
- submissions
- revisions
- activity_logs
- notifications

Berikan alasan kenapa tabel tertentu diperlukan atau tidak diperlukan.

---

# 13. Authorization

Diskusikan bagaimana authorization sebaiknya diterapkan.

Pertimbangkan:

- Middleware
- Policy
- Gates
- Permission/Role system

Jangan hanya mengandalkan pengecekan:

