import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { CurrencyInfo } from "@/lib/money";

// Cache labels. Admin changes call updateTag(...) with these so the shop
// shows the change straight away.
export const TAGS = {
  products: "products",
  categories: "categories",
  currencies: "currencies",
  settings: "settings",
  countries: "countries",
} as const;

export type ProductCard = {
  id: string;
  slug: string;
  title: string;
  image: { url: string; alt: string } | null;
  secondImage: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  minPriceCents: number;
  compareAtCents: number | null;
  inStock: boolean;
  tags: string[];
  createdAt: Date;
  rating: number | null;
  reviewCount: number;
};

async function reviewStats() {
  const rows = await db.review.groupBy({
    by: ["productId"],
    where: { status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.productId, { rating: r._avg.rating, count: r._count._all }]));
}

/** Every product visible in the shop, as small "cards". */
export async function getAllProductCards(): Promise<ProductCard[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("hours");

  const [products, stats] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { slug: true, name: true, isVisible: true } },
        images: { orderBy: { position: "asc" }, take: 2 },
        variants: { where: { isActive: true }, select: { priceCents: true, compareAtPriceCents: true, stock: true } },
      },
    }),
    reviewStats(),
  ]);

  return products
    .filter((p) => p.variants.length > 0)
    .map((p) => {
      const cheapest = p.variants.reduce((a, b) => (b.priceCents < a.priceCents ? b : a));
      const s = stats.get(p.id);
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt ?? p.title } : null,
        secondImage: p.images[1]?.url ?? null,
        categorySlug: p.category?.isVisible ? p.category.slug : null,
        categoryName: p.category?.isVisible ? p.category.name : null,
        minPriceCents: cheapest.priceCents,
        compareAtCents:
          cheapest.compareAtPriceCents && cheapest.compareAtPriceCents > cheapest.priceCents
            ? cheapest.compareAtPriceCents
            : null,
        inStock: p.variants.some((v) => v.stock > 0),
        tags: p.tags,
        createdAt: p.createdAt,
        rating: s?.rating ?? null,
        reviewCount: s?.count ?? 0,
      };
    });
}

export type ShopSort = "newest" | "price-asc" | "price-desc" | "rating";

export async function findProductCards(filters: {
  category?: string;
  minCents?: number;
  maxCents?: number;
  sort?: ShopSort;
  q?: string;
}) {
  const all = await getAllProductCards();
  const q = filters.q?.trim().toLowerCase();
  const list = all.filter(
    (p) =>
      (!filters.category || p.categorySlug === filters.category) &&
      (filters.minCents == null || p.minPriceCents >= filters.minCents) &&
      (filters.maxCents == null || p.minPriceCents <= filters.maxCents) &&
      (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))),
  );
  const sorters: Record<ShopSort, (a: ProductCard, b: ProductCard) => number> = {
    newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    "price-asc": (a, b) => a.minPriceCents - b.minPriceCents,
    "price-desc": (a, b) => b.minPriceCents - a.minPriceCents,
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount,
  };
  return list.sort(sorters[filters.sort ?? "newest"]);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("hours");

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { where: { isActive: true }, orderBy: { position: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, authorName: true, rating: true, title: true, body: true, createdAt: true, orderId: true },
      },
    },
  });
  if (!product || product.status !== "ACTIVE" || product.variants.length === 0) return null;

  // Only plain values can be cached, so drop database-only fields.
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    ingredients: product.ingredients,
    howToUse: product.howToUse,
    safetyInfo: product.safetyInfo,
    tags: product.tags,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    updatedAt: product.updatedAt,
    category: product.category?.isVisible ? { slug: product.category.slug, name: product.category.name } : null,
    images: product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt ?? product.title })),
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      options: (v.options ?? {}) as Record<string, string>,
      priceCents: v.priceCents,
      compareAtPriceCents: v.compareAtPriceCents,
      stock: v.stock,
      imageUrl: v.imageUrl,
    })),
    reviews: product.reviews,
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

/**
 * Product pages are not pre-built at deploy time. Each page is built on its
 * first visit and then cached, and an admin change rebuilds it with fresh data
 * (a pre-built copy would briefly show old prices after a change).
 * Next.js needs at least one value here, so a placeholder is used.
 */
export async function getPrebuiltProductSlugs() {
  return [{ slug: "__none__" }];
}

export async function getCategories() {
  "use cache";
  cacheTag(TAGS.categories);
  cacheLife("hours");
  return db.category.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, description: true, imageUrl: true, seoTitle: true, seoDescription: true },
  });
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getCurrencies(): Promise<CurrencyInfo[]> {
  "use cache";
  cacheTag(TAGS.currencies);
  cacheLife("hours");
  const rows = await db.currency.findMany({ where: { isEnabled: true }, orderBy: { sortOrder: "asc" } });
  return rows.map((c) => ({ code: c.code, symbol: c.symbol, rateToUsd: Number(c.rateToUsd), decimals: c.decimals }));
}

export async function getStoreSettings() {
  "use cache";
  cacheTag(TAGS.settings);
  cacheLife("hours");
  const s = await db.storeSettings.findUnique({ where: { id: 1 } });
  return {
    storeName: s?.storeName ?? "Zarghoon Cosmetics",
    logoUrl: s?.logoUrl ?? null,
    taxDutyNote: s?.taxDutyNote ?? "",
    announcementText: s?.announcementEnabled ? (s.announcementText ?? null) : null,
    announcementLink: s?.announcementLink ?? null,
  };
}

export async function getShippingCountries() {
  "use cache";
  cacheTag(TAGS.countries);
  cacheLife("hours");
  return db.shippingCountry.findMany({ where: { isEnabled: true }, orderBy: { name: "asc" } });
}

export async function getActiveBanners() {
  "use cache";
  cacheTag(TAGS.settings);
  cacheLife("hours");
  return db.banner.findMany({ where: { isActive: true }, orderBy: { position: "asc" } });
}
