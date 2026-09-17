import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminGetCompany, adminGetCurrentUser } from "@/services/admin.service";
import { updateCompanyAction } from "@/lib/actions/company";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { AccountForm } from "@/components/admin/AccountForm";
import { FlashMessage } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Profil Perusahaan" };

export default async function AdminCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const [company, account] = await Promise.all([
    adminGetCompany(),
    session?.user?.id ? adminGetCurrentUser(session.user.id) : null,
  ]);
  if (!account) notFound();

  const defaults: Record<string, string> = {
    name: company?.name ?? "",
    tagline: company?.tagline ?? "",
    description: company?.description ?? "",
    history: company?.history ?? "",
    vision: company?.vision ?? "",
    mission: company?.mission ?? "",
    phone: company?.phone ?? "",
    whatsapp: company?.whatsapp ?? "",
    email: company?.email ?? "",
    address: company?.address ?? "",
    mapsUrl: company?.mapsUrl ?? "",
    instagram: company?.instagram ?? "",
    facebook: company?.facebook ?? "",
    linkedin: company?.linkedin ?? "",
    hours: company?.hours ?? "",
    heroImageUrl: company?.heroImageUrl ? "1" : "",
  };

  return (
    <div>
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <div className="mx-auto grid w-full max-w-[97rem] items-start justify-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,52rem)_22rem_20rem]">
        <div className="min-w-0">
          <CompanyForm action={updateCompanyAction} defaults={defaults} />
        </div>
        <div className="min-w-0">
          <AccountForm user={account} />
        </div>
        <aside className="min-w-0 lg:col-span-2 xl:col-span-1" aria-label="Aset dan info tampil">
          <div className="grid items-start gap-4">
          <section className="rounded-2xl border border-line bg-white p-5" aria-label="Aset visual">
            <h2 className="font-medium text-stone-900">Aset Visual</h2>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-stone-500">Logo</p>
            {company?.logoUrl ? (
              <span className="relative mt-1 block h-20 w-40 overflow-hidden rounded-xl border border-line bg-stone-50">
                <Image src={company.logoUrl} alt="Logo perusahaan" fill sizes="160px" className="object-contain" />
              </span>
            ) : (
              <p className="mt-1 rounded-lg border border-dashed border-line px-3 py-2 text-xs text-stone-400">
                Belum ada logo — upload di form.
              </p>
            )}
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-stone-500">Foto hero beranda</p>
            {company?.heroImageUrl ? (
              <span className="relative mt-1 block aspect-[5/4] overflow-hidden rounded-xl border border-line">
                <Image src={company.heroImageUrl} alt="Foto hero beranda" fill sizes="320px" className="object-cover" />
              </span>
            ) : (
              <p className="mt-1 rounded-lg border border-dashed border-line px-3 py-2 text-xs text-stone-400">
                Belum ada foto hero — beranda memakai foto produk.
              </p>
            )}
          </section>
          <section className="rounded-2xl border border-line bg-white p-5" aria-label="Tampil di mana">
            <h2 className="font-medium text-stone-900">Tampil di mana</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Logo", "Header, footer, sidebar admin, halaman login"],
                ["Foto hero", "Foto besar beranda"],
                ["Tagline", "Sub-judul hero beranda"],
                ["Visi, misi, sejarah", "Halaman tentang"],
                ["Alamat & kontak", "Footer, halaman kontak & tentang"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-medium text-stone-800">{k}</dt>
                  <dd className="text-stone-500">{v}</dd>
                </div>
              ))}
            </dl>
            {company?.updatedAt ? (
              <p className="mt-4 border-t border-line pt-3 text-xs text-stone-400">
                Terakhir diperbarui{" "}
                {new Date(company.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            ) : null}
          </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
