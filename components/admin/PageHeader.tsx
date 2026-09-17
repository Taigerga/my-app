import Link from "next/link";

export function PageHeader({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
      {actionHref ? (
        <Link
          href={actionHref}
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-[1px]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function FlashMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="mb-4 rounded-xl border border-pine/30 bg-moss px-4 py-2.5 text-sm text-pine-deep">
      {message}
    </p>
  );
}
