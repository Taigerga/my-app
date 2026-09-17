import type { Metadata } from "next";
import { getCompanyProfile } from "@/services/public.service";
import { getAllActiveProducts } from "@/services/catalog.service";
import { InquiryForm } from "@/components/public/InquiryForm";

export const metadata: Metadata = { title: "Kontak & Inquiry" };

export default async function ContactPage() {
  const [company, products] = await Promise.all([getCompanyProfile(), getAllActiveProducts()]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display max-w-xl text-4xl font-semibold text-ink">Hubungi Kami</h1>
      <p className="mt-3 max-w-lg leading-relaxed text-stone-600">
        Isi form inquiry atau hubungi langsung — balasan maksimal 1×24 jam pada jam operasional.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <aside className="h-fit rounded-2xl bg-pine p-6 text-white">
          <h2 className="font-medium">Kontak langsung</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-200">
            {company?.address ? <li>{company.address}</li> : null}
            {company?.phone ? <li>Tel: {company.phone}</li> : null}
            {company?.whatsapp ? <li>WA: {company.whatsapp}</li> : null}
            {company?.email ? <li>{company.email}</li> : null}
            {company?.hours ? <li className="pt-1 text-stone-300">{company.hours}</li> : null}
          </ul>
        </aside>
        <section className="rounded-2xl border border-line bg-white p-6" aria-label="Form inquiry">
          <InquiryForm products={products} whatsapp={company?.whatsapp} />
        </section>
      </div>
    </main>
  );
}
