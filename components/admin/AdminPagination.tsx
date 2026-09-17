import Link from "next/link";

export function AdminPagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Pagination admin">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
            n === page ? "bg-ink font-medium text-white" : "border border-stone-300 text-stone-600 hover:border-stone-500"
          }`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
