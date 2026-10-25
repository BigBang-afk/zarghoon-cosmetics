import type { ShopSort } from "@/lib/catalog";

const SORTS: ShopSort[] = ["newest", "price-asc", "price-desc", "rating"];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function usdToCents(v: string | undefined) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

/** Reads the shop's filters from the address bar, ignoring anything invalid. */
export function parseShopParams(sp: Record<string, string | string[] | undefined>) {
  const sort = one(sp.sort) as ShopSort | undefined;
  return {
    category: one(sp.category)?.slice(0, 100),
    q: one(sp.q)?.slice(0, 100),
    minCents: usdToCents(one(sp.min)),
    maxCents: usdToCents(one(sp.max)),
    sort: sort && SORTS.includes(sort) ? sort : "newest",
  };
}
