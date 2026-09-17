import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export const CategorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").max(100),
  slug: z
    .string()
    .min(2)
    .max(191)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan strip."),
  description: z.string().max(2000).optional().or(z.literal("")),
});

const slugField = z
  .string()
  .min(2)
  .max(191)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan strip.");

export const ProductSchema = z.object({
  name: z.string().min(2).max(191),
  slug: slugField,
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  shortDesc: z.string().max(500).optional().or(z.literal("")),
  description: z.string().max(20000).optional().or(z.literal("")),
  material: z.string().max(191).optional().or(z.literal("")),
  dimensions: z.string().max(191).optional().or(z.literal("")),
  color: z.string().max(191).optional().or(z.literal("")),
  specifications: z.string().max(20000).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
});

export const PortfolioSchema = z.object({
  title: z.string().min(2).max(191),
  slug: slugField,
  client: z.string().max(191).optional().or(z.literal("")),
  location: z.string().max(191).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  description: z.string().max(20000).optional().or(z.literal("")),
  featured: z.boolean().default(false),
});

export const ArticleSchema = z.object({
  title: z.string().min(4).max(191),
  slug: slugField,
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "Konten wajib diisi."),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const GallerySchema = z.object({
  title: z.string().min(2).max(191),
  category: z.enum(["produk", "workshop", "kantor", "proyek", "kegiatan"]),
});

export const InquirySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").max(191),
  email: z.string().min(1).email("Format email tidak valid."),
  whatsapp: z
    .string()
    .min(9, "Nomor WhatsApp tidak valid.")
    .max(30)
    .regex(/^[0-9+()\-\s]+$/, "Nomor WhatsApp hanya angka dan + - ( ) spasi."),
  quantity: z.coerce.number().int().min(1).max(10000),
  message: z.string().min(5, "Pesan minimal 5 karakter.").max(5000),
  productId: z.string().optional().or(z.literal("")),
});

export const CompanyProfileSchema = z.object({
  name: z.string().min(2).max(191),
  tagline: z.string().max(255).optional().or(z.literal("")),
  description: z.string().max(20000).optional().or(z.literal("")),
  history: z.string().max(20000).optional().or(z.literal("")),
  vision: z.string().max(5000).optional().or(z.literal("")),
  mission: z.string().max(5000).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid.").optional().or(z.literal("")),
  address: z.string().max(2000).optional().or(z.literal("")),
  mapsUrl: z.string().url("URL Google Maps tidak valid.").optional().or(z.literal("")),
  instagram: z.string().max(255).optional().or(z.literal("")),
  facebook: z.string().max(255).optional().or(z.literal("")),
  linkedin: z.string().max(255).optional().or(z.literal("")),
  hours: z.string().max(191).optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type InquiryInput = z.infer<typeof InquirySchema>;

export const AccountSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").max(100),
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter.").max(100),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Password baru harus berbeda dari yang lama.",
    path: ["newPassword"],
  });
