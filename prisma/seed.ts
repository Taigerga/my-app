import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

async function main() {
  // Bersihkan urutan aman (child dulu)
  await prisma.inquiry.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.article.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@furniture.local",
      passwordHash,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  const categories = await Promise.all(
    [
      { name: "Kursi", slug: "kursi", description: "Kursi kayu & custom" },
      { name: "Meja", slug: "meja", description: "Meja makan, kerja, kopi" },
      { name: "Lemari", slug: "lemari", description: "Lemari pakaian & arsip" },
      { name: "Sofa", slug: "sofa", description: "Sofa ruang tamu & kantor" },
      { name: "Bedroom", slug: "bedroom", description: "Dipan, nakas, wardrobe" },
      { name: "Office", slug: "office", description: "Furniture kantor" },
    ].map((c) => prisma.category.create({ data: c })),
  );
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const productsSeed = [
    { name: "Kursi Jati Minimalis", slug: "kursi-jati-minimalis", cat: "kursi", material: "Jati solid", dimensions: "45x50x85 cm", color: "Natural", featured: true },
    { name: "Kursi Kantor Ergonomis", slug: "kursi-kantor-ergonomis", cat: "office", material: "Fabric + nylon", dimensions: "60x60x110 cm", color: "Abu", featured: true },
    { name: "Meja Makan 6 Kursi", slug: "meja-makan-6-kursi", cat: "meja", material: "Jati + HPL", dimensions: "180x90x75 cm", color: "Walnut", featured: true },
    { name: "Meja Kerja Lipat", slug: "meja-kerja-lipat", cat: "office", material: "Multiplek + besi", dimensions: "120x60x75 cm", color: "Putih" },
    { name: "Lemari Pakaian 3 Pintu", slug: "lemari-pakaian-3-pintu", cat: "lemari", material: "Blockboard + duco", dimensions: "150x55x200 cm", color: "Broken white" },
    { name: "Sofa Linen 3 Dudukan", slug: "sofa-linen-3-dudukan", cat: "sofa", material: "Kayu + busa + linen", dimensions: "200x85x85 cm", color: "Beige", featured: true },
    { name: "Dipan Jati Uk 160", slug: "dipan-jati-160", cat: "bedroom", material: "Jati solid", dimensions: "160x200 cm", color: "Natural" },
    { name: "Nakas Minimalis", slug: "nakas-minimalis", cat: "bedroom", material: "MDF + duco", dimensions: "45x40x50 cm", color: "Greige" },
    { name: "Meja Kopi Bundar", slug: "meja-kopi-bundar", cat: "meja", material: "Jati + besi", dimensions: "D80x45 cm", color: "Natural" },
    { name: "Rak Arsip Kantor", slug: "rak-arsip-kantor", cat: "office", material: "Besi + multiplek", dimensions: "90x40x180 cm", color: "Abu" },
    { name: "Kursi Teras Rotan", slug: "kursi-teras-rotan", cat: "kursi", material: "Rotan + jati", dimensions: "55x60x90 cm", color: "Natural" },
    { name: "Wardrobe Sliding", slug: "wardrobe-sliding", cat: "lemari", material: "Multiplek + HPL", dimensions: "200x60x220 cm", color: "Oak" },
  ];

  for (const p of productsSeed) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        shortDesc: `${p.name} — demo development, tanpa harga.`,
        description: `${p.name} dibuat custom sesuai kebutuhan. Hubungi kami untuk konsultasi material dan ukuran.`,
        material: p.material,
        dimensions: p.dimensions,
        color: p.color,
        specifications: `Material: ${p.material}\nDimensi: ${p.dimensions}\nWarna: ${p.color}`,
        status: "ACTIVE",
        featured: p.featured ?? false,
        categoryId: bySlug[p.cat].id,
        images: {
          create: [0, 1].map((i) => ({
            url: img(`${p.slug}-${i}`),
            alt: `${p.name} foto ${i + 1}`,
            sortOrder: i,
            isMain: i === 0,
          })),
        },
      },
    });
    void created;
  }

  const portfoliosSeed = [
    { title: "Interior Kantor Startup Jakarta", slug: "interior-kantor-startup-jakarta", client: "PT Maju Bersama", location: "Jakarta Selatan", year: 2025 },
    { title: "Set Meja Makan Villa Bali", slug: "set-meja-makan-villa-bali", client: "Villa Arunika", location: "Badung, Bali", year: 2024 },
    { title: "Pengadaan Lemari Sekolah", slug: "pengadaan-lemari-sekolah", client: "Yayasan Cahaya Ilmu", location: "Bogor", year: 2025 },
  ];
  for (const pf of portfoliosSeed) {
    await prisma.portfolio.create({
      data: {
        ...pf,
        description: `${pf.title} — proyek demo development.`,
        featured: true,
        images: { create: [0, 1].map((i) => ({ url: img(`${pf.slug}-${i}`), alt: `${pf.title} ${i + 1}`, sortOrder: i })) },
      },
    });
  }

  await prisma.article.createMany({
    data: [
      {
        title: "Cara Merawat Furniture Jati agar Awet",
        slug: "merawat-furniture-jati",
        excerpt: "Tips sederhana merawat jati solid di iklim tropis.",
        content: "<p>Artikel demo development. Bersihkan debu rutin, hindari panas langsung, dan poles berkala.</p>",
        thumbnail: img("artikel-jati"),
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: admin.id,
      },
      {
        title: "Panduan Memilih Meja Kerja yang Tepat",
        slug: "memilih-meja-kerja",
        excerpt: "Ukuran, material, dan ergonomi untuk kerja harian.",
        content: "<p>Artikel demo development tentang memilih meja kerja.</p>",
        thumbnail: img("artikel-meja"),
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: admin.id,
      },
      {
        title: "Draf: Tren Warna Furniture 2026",
        slug: "draf-tren-warna-2026",
        excerpt: "Draf internal, belum tayang.",
        content: "<p>Draf demo, status DRAFT.</p>",
        status: "DRAFT",
        authorId: admin.id,
      },
    ],
  });

  await prisma.gallery.createMany({
    data: ["produk", "workshop", "kantor", "proyek", "kegiatan", "produk"].map((cat, i) => ({
      title: `Galeri ${cat} ${i + 1}`,
      url: img(`galeri-${cat}-${i}`),
      category: cat,
    })),
  });

  const firstProduct = await prisma.product.findFirstOrThrow();
  await prisma.inquiry.createMany({
    data: [
      { name: "Budi Santoso", email: "budi@mail.com", whatsapp: "081234567890", quantity: 4, message: "Tanya kursi jati minimalis untuk cafe.", status: "NEW", productId: firstProduct.id },
      { name: "Sari Dewi", email: "sari@mail.com", whatsapp: "082198765432", quantity: 1, message: "Meja makan custom ukuran 200cm bisa?", status: "CONTACTED", productId: firstProduct.id },
      { name: "Andi Pratama", email: "andi@mail.com", whatsapp: "081377788899", quantity: 10, message: "Pengadaan kursi kantor 10 unit.", status: "PROCESSING" },
      { name: "Rina Wulandari", email: "rina@mail.com", whatsapp: "085612345678", quantity: 2, message: "Sofa linen ready stock?", status: "COMPLETED" },
      { name: "Dedi Kurniawan", email: "dedi@mail.com", whatsapp: "081299988877", quantity: 1, message: "Batal, ukuran tidak cocok.", status: "CANCELLED" },
    ],
  });

  await prisma.companyProfile.create({
    data: {
      name: "Furniture Demo (Development)",
      tagline: "Custom furniture minimal, elegan, hangat",
      description: "Profil perusahaan demo untuk development. Ganti via dashboard admin.",
      history: "Berdiri sebagai workshop kecil, berkembang menjadi produsen custom furniture.",
      vision: "Menjadi produsen furniture custom terpercaya.",
      mission: "Kualitas material, pengerjaan rapi, harga transparan via konsultasi.",
      phone: "021-0000000",
      whatsapp: "081200000000",
      email: "info@furniture-demo.local",
      address: "Jl. Demo No. 1, Jepara",
      mapsUrl: "https://maps.google.com/?q=Jepara",
      instagram: "https://instagram.com/",
      facebook: "https://facebook.com/",
      linkedin: "https://linkedin.com/",
      hours: "Senin–Sabtu 08.00–17.00",
      heroImageUrl: img("hero-workshop-perusahaan"),
      logoUrl: "/logo.svg",
    },
  });

  console.log("Seed OK: admin admin@furniture.local / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
