import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminGetCurrentUser } from "@/services/admin.service";
import { AccountForm } from "@/components/admin/AccountForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Profil Akun" };

export default async function WorkerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const user = session?.user?.id ? await adminGetCurrentUser(session.user.id) : null;
  if (!user) notFound();

  return (
    <div className="max-w-xl">
      <PageHeader title="Profil Akun" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <AccountForm user={user} redirectTo="/worker/profile" />
    </div>
  );
}
