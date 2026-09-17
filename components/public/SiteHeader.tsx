"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const LINKS = [
  { href: "/products", label: "Produk" },
  { href: "/portfolio", label: "Portofolio" },
  { href: "/articles", label: "Artikel" },
  { href: "/gallery", label: "Galeri" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
];

export function SiteHeader({ brand, phone, logoUrl }: { brand: string; phone?: string | null; logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${brand} — beranda`}>
          {logoUrl ? (
            <span className="relative block h-8 w-8 overflow-hidden">
              <Image src={logoUrl} alt="" fill sizes="32px" className="object-contain" />
            </span>
          ) : null}
          <span className="font-display text-xl font-semibold text-ink">{brand}</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigasi utama">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-stone-600 underline-offset-4 transition hover:text-ink hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-ink"
            >
              <Phone size={15} aria-hidden />
              {phone}
            </a>
          ) : null}
          <Link
            href="/contact"
            className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-white transition hover:bg-pine-deep active:translate-y-[1px]"
          >
            Tanya Produk
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="rounded-lg p-2 text-stone-700 hover:bg-stone-200/60 lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line bg-cream px-4 py-3 lg:hidden" aria-label="Navigasi seluler">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-200/60"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-pine px-4 py-2.5 text-center text-sm font-medium text-white"
              >
                Tanya Produk
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
