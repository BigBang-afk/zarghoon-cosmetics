"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCurrency } from "@/components/shop/currency";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

/** Category, price and sort controls. Prices are typed in the shopper's currency. */
export function ShopFilters({ categories, showCategory = true }: { categories: { slug: string; name: string }[]; showCategory?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { currency } = useCurrency();

  const toLocal = (usd: string | null) =>
    usd ? String(Math.round(Number(usd) * currency.rateToUsd)) : "";
  const [min, setMin] = useState(toLocal(params.get("min")));
  const [max, setMax] = useState(toLocal(params.get("max")));

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Price inputs are in the chosen currency; the URL keeps US dollars.
  const toUsd = (local: string) => {
    const n = Number(local);
    return local.trim() && Number.isFinite(n) && n >= 0 ? (n / currency.rateToUsd).toFixed(2) : null;
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {showCategory && (
        <label className="text-sm">
          <span className="label">Category</span>
          <select className="input" value={params.get("category") ?? ""} onChange={(e) => update({ category: e.target.value || null })}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
      )}
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          update({ min: toUsd(min), max: toUsd(max) });
        }}
      >
        <label className="w-24 text-sm">
          <span className="label">Min ({currency.code})</span>
          <input className="input" inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} />
        </label>
        <label className="w-24 text-sm">
          <span className="label">Max ({currency.code})</span>
          <input className="input" inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} />
        </label>
        <button className="btn-secondary">Apply</button>
      </form>
      <label className="ml-auto text-sm">
        <span className="label">Sort by</span>
        <select className="input" value={params.get("sort") ?? "newest"} onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
