export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12" aria-label="Memuat katalog" role="status">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-stone-200" />
      <div className="mt-6 h-11 w-full max-w-md animate-pulse rounded-full bg-stone-200" />
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="aspect-[4/3] animate-pulse bg-stone-200" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
