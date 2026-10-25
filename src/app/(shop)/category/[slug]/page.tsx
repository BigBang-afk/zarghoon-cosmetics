import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { findProductCards, getCategoryBySlug } from "@/lib/catalog";
import { parseShopParams } from "@/lib/shop-params";
import { GridSkeleton, ProductGrid } from "@/components/shop/product-card";
import { ShopFilters } from "../../shop/filters";

// Built on first visit, like product pages (see getPrebuiltProductSlugs).
export async function generateStaticParams() {
  return [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  if (!category) return { title: "Not found" };
  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || `Shop ${category.name} at Zarghoon Cosmetics.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: category.imageUrl ? { images: [category.imageUrl] } : undefined,
  };
}

export default function CategoryPage(props: PageProps<"/category/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Suspense fallback={<GridSkeleton />}>
        <CategoryContent {...props} />
      </Suspense>
    </div>
  );
}

async function CategoryContent({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseShopParams(await searchParams);
  const products = await findProductCards({ ...filters, category: slug });
  return (
    <>
      <h1 className="text-4xl">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-stone-600">{category.description}</p>}
      <div className="mt-6">
        <ShopFilters categories={[]} showCategory={false} />
      </div>
      <p className="mt-8 mb-6 text-sm text-stone-500">{products.length} products</p>
      {products.length ? (
        <ProductGrid products={products} priorityCount={4} />
      ) : (
        <p className="rounded-xl bg-white p-10 text-center text-stone-500">No products match these filters.</p>
      )}
    </>
  );
}
