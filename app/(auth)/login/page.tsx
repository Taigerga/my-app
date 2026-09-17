import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCompanyProfile } from "@/services/public.service";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; msg?: string }>;
}) {
  const { callbackUrl, msg } = await searchParams;
  const session = await auth();
  // Sudah login → arahkan ke dashboard sesuai role (hindari loop worker → /admin).
  if (session?.user?.role === "WORKER" && (!callbackUrl || callbackUrl.startsWith("/admin"))) {
    redirect("/worker");
  }
  if (session?.user?.role === "ADMIN" && callbackUrl?.startsWith("/worker")) {
    redirect("/admin");
  }
  const company = await getCompanyProfile();
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <section className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">
        {company?.logoUrl ? (
          <span className="relative mx-auto mb-3 block h-12 w-32">
            <Image src={company.logoUrl} alt={company.name} fill sizes="128px" className="object-contain" />
          </span>
        ) : null}
        <h1 className="text-center text-xl font-semibold text-ink">Login Staf</h1>
        <p className="mb-5 mt-1 text-center text-sm text-stone-500">
          {company?.name ?? "Kelola konten website furniture."}
        </p>
        {msg ? (
          <p role="status" className="mb-4 rounded-lg bg-moss px-3 py-2 text-center text-sm text-pine-deep">
            {msg}
          </p>
        ) : null}
        <LoginForm callbackUrl={callbackUrl ?? (session?.user?.role === "WORKER" ? "/worker" : "/admin")} />
      </section>
    </main>
  );
}
