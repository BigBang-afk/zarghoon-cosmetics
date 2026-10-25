import Link from "next/link";
import type { ProductCard as Card } from "@/lib/catalog";
import { SmartImage } from "@/components/smart-image";
import { Price } from "./currency";
import { Stars } from "./stars";

export function ProductCard({ product, priority = false }: { product: Card; priority?: boolean }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
        {product.image ? (
          <>
            <SmartImage
              src={product.image.url}
              alt={product.image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              priority={priority}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            {product.secondImage && (
              <SmartImage
                src={product.secondImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">No image</div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.compareAtCents && <span className="rounded-full bg-saffron px-2 py-0.5 text-xs text-white">Sale</span>}
          {!product.inStock && <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">Sold out</span>}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {product.categoryName && <p className="text-xs tracking-wider text-stone-500 uppercase">{product.categoryName}</p>}
        <h3 className="font-sans text-sm font-medium text-ink group-hover:underline">{product.title}</h3>
        {product.rating != null && (
          <p className="flex items-center gap-1 text-xs text-stone-500">
            <Stars rating={product.rating} size="size-3.5" /> ({product.reviewCount})
          </p>
        )}
        <Price cents={product.minPriceCents} compareAtCents={product.compareAtCents} className="text-sm font-semibold" />
      </div>
    </Link>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Card[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-xl bg-stone-200" />
      ))}
    </div>
  );
}
