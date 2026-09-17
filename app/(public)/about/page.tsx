import type { Metadata } from "next";
import Image from "next/image";
import { getCompanyProfile } from "@/services/public.service";
import { Reveal } from "@/components/public/Reveal";

export const metadata: Metadata = { title: "Tentang Kami" };

export default async function AboutPage() {
  const company = await getCompanyProfile();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">Tentang Kami</h1>
          <p className="mt-3 max-w-md leading-relaxed text-stone-600">
            {company?.description ?? "Profil perusahaan furniture custom."}
          </p>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-stone-200">
          <Image
            src="https://picsum.photos/seed/furniture-team-workshop/1000/560"
            alt="Tim workshop furniture"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {[
          { t: "Visi", d: company?.vision ?? "Menjadi produsen furniture custom terpercaya." },
          { t: "Misi", d: company?.mission ?? "Kualitas material, pengerjaan rapi, konsultasi transparan." },
        ].map((v, i) => (
          <Reveal key={v.t} delay={i * 0.08}>
            <section className="h-full rounded-2xl bg-pine p-6 text-white">
              <h2 className="font-display text-2xl font-semibold">{v.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-200">{v.d}</p>
            </section>
          </Reveal>
        ))}
      </div>

      {company?.history ? (
        <Reveal>
          <section className="mt-4 rounded-2xl border border-line bg-white p-6 md:p-8" aria-label="Sejarah perusahaan">
            <h2 className="font-display text-2xl font-semibold text-ink">Sejarah</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-stone-600">{company.history}</p>
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <section className="mt-4 rounded-2xl border border-line bg-white p-6 md:p-8" aria-label="Informasi kontak">
          <h2 className="font-display text-2xl font-semibold text-ink">Kontak & Lokasi</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            {[
              ["Alamat", company?.address],
              ["Telepon", company?.phone],
              ["WhatsApp", company?.whatsapp],
              ["Email", company?.email],
              ["Jam Operasional", company?.hours],
            ].map(([k, v]) =>
              v ? (
                <div key={k} className="flex gap-3">
                  <dt className="w-32 shrink-0 text-stone-500">{k}</dt>
                  <dd className="text-stone-800">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>
          {company?.mapsUrl ? (
            <a
              href={company.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-full border border-pine/40 px-5 py-2.5 text-sm font-medium text-pine transition hover:bg-pine hover:text-white"
            >
              Buka Google Maps
            </a>
          ) : null}
        </section>
      </Reveal>
    </main>
  );
}
