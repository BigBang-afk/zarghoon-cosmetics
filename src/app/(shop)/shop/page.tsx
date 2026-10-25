import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { findProductCards, getCategories } from "@/lib/catalog";
import { parseShopParams } from "@/lib/shop-params";
import { GridSkeleton, ProductGrid } from "@/components/shop/product-card";
import { ShopFilters } from "./filters";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Browse all Zarghoon skincare, makeup, lip and body products.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl">Shop all</h1>
      <Suspense fallback={<GridSkeleton />}>
        <div className="mt-6">
          <ShopFilters categories={categories} />
        </div>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const filters = parseShopParams(await searchParams);
  const products = await findProductCards(filters);
  return (
    <div className="mt-8">
      <form action="/shop" className="mb-6 flex max-w-md gap-2">
        <input name="q" defaultValue={filters.q} placeholder="Search products" className="input" aria-label="Search products" />
        <button className="btn-primary">Search</button>
      </form>
      <p className="mb-6 text-sm text-stone-500">
        {products.length} {products.length === 1 ? "product" : "products"}
        {filters.q && <> for “{filters.q}” · <Link href="/shop" className="underline">clear</Link></>}
      </p>
      {products.length ? (
        <ProductGrid products={products} priorityCount={4} />
      ) : (
        <p className="rounded-xl bg-white p-10 text-center text-stone-500">No products match these filters.</p>
      )}
    </div>
  );
}
