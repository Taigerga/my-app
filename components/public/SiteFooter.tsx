import Image from "next/image";
import Link from "next/link";

export function SiteFooter({
  company,
}: {
  company: {
    name: string;
    logoUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    hours?: string | null;
    instagram?: string | null;
    facebook?: string | null;
  } | null;
}) {
  return (
    <footer className="bg-pine-deep text-stone-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
            {company?.logoUrl ? (
              <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-md bg-cream p-0.5">
                <Image src={company.logoUrl} alt="" fill sizes="28px" className="object-contain" />
              </span>
            ) : null}
            {company?.name ?? "Furniture"}
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-300">
            {company?.address ?? "Custom furniture minimal, elegan, dan hangat."}
          </p>
          {company?.hours ? <p className="mt-2 text-sm text-stone-300">{company.hours}</p> : null}
        </div>
        <nav aria-label="Navigasi footer">
          <p className="text-sm font-medium text-white">Jelajahi</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {[
              { href: "/products", label: "Katalog Produk" },
              { href: "/portfolio", label: "Portofolio" },
              { href: "/articles", label: "Artikel" },
              { href: "/gallery", label: "Galeri" },
              { href: "/about", label: "Tentang Kami" },
              { href: "/contact", label: "Hubungi Kami" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-stone-300 transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-sm font-medium text-white">Kontak</p>
          <ul className="mt-3 space-y-1.5 text-sm text-stone-300">
            {company?.phone ? <li>{company.phone}</li> : null}
            {company?.whatsapp ? <li>WA: {company.whatsapp}</li> : null}
            {company?.email ? <li>{company.email}</li> : null}
            <li className="flex gap-3 pt-1">
              {company?.instagram ? (
                <a href={company.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Instagram
                </a>
              ) : null}
              {company?.facebook ? (
                <a href={company.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Facebook
                </a>
              ) : null}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-stone-400">
          © {new Date().getFullYear()} {company?.name ?? "Furniture"}. Seluruh konten dikelola via dashboard admin.
        </p>
      </div>
    </footer>
  );
}
