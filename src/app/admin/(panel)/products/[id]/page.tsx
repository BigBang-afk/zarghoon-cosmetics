import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import type { ProductInput } from "@/lib/validation/product";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-button";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;

  const [product, categories, settings] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.storeSettings.findUniqueOrThrow({ where: { id: 1 } }),
  ]);
  if (!product) notFound();

  const optionNames: string[] = [];
  for (const v of product.variants) {
    for (const k of Object.keys((v.options ?? {}) as Record<string, string>)) if (!optionNames.includes(k)) optionNames.push(k);
  }

  const initial: ProductInput = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    ingredients: product.ingredients,
    howToUse: product.howToUse,
    safetyInfo: product.safetyInfo,
    status: product.status,
    categoryId: product.categoryId,
    tags: product.tags,
    markup: product.markup == null ? null : Number(product.markup),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    optionNames,
    images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: product.variants.map((v) => ({
      id: v.id,
      options: (v.options ?? {}) as Record<string, string>,
      sku: v.sku,
      cjCostCents: v.cjCostCents,
      priceCents: v.priceCents,
      priceOverride: v.priceOverride,
      compareAtPriceCents: v.compareAtPriceCents,
      stock: v.stock,
      imageUrl: v.imageUrl,
      isActive: v.isActive,
    })),
  };

  return (
    <div className="space-y-5">
      {created && <p className="rounded-lg bg-juniper-light px-4 py-3 text-sm text-juniper">Product created.</p>}
      {product.costChanged && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          CJ changed the cost of this product. Check the prices below; saving clears this warning.
        </p>
      )}
      <ProductForm initial={initial} categories={categories} defaultMarkup={Number(settings.defaultMarkup)} cjProductId={product.cjProductId} />
      <div className="flex justify-end border-t border-stone-200 pt-5">
        <DeleteProductButton id={product.id} title={product.title} />
      </div>
    </div>
  );
}
