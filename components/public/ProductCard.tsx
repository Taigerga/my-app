import Image from "next/image";
import Link from "next/link";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  material?: string | null;
  category: { name: string };
  images: { url: string; alt?: string | null }[];
};

export function ProductCard({ product, large = false }: { product: ProductCardData; large?: boolean }) {
  const img = product.images[0];
  return (
    <li
      className="group h-full overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(28,25,23,0.35)]"
    >
      <Link href={`/products/${product.slug}`} className={large ? "grid h-full sm:grid-cols-2" : "block h-full"}>
        <div className={`relative overflow-hidden bg-stone-100 ${large ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-80" : "aspect-[4/3]"}`}>
          {img ? (
            <Image
              src={img.url}
              alt={img.alt ?? product.name}
              fill
              loading="lazy"
              sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 33vw"}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className={large ? "flex flex-col justify-center p-5 sm:p-6" : "p-4"}>
          <p className="text-xs font-medium uppercase tracking-wider text-pine">{product.category.name}</p>
          <h3 className={`font-display mt-1 font-semibold leading-snug text-ink group-hover:underline ${large ? "text-xl sm:text-2xl" : "text-lg"}`}>
            {product.name}
          </h3>
          {product.material ? (
            <p className="mt-1 truncate text-sm text-stone-500">{product.material}</p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
