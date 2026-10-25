// Pricing rules. All amounts are whole US cents.

/**
 * Rounds a price up to the nearest amount ending in .99
 * (e.g. 1260 → 1299, 1200 → 1299, 1199 → 1199). Never goes below the input.
 */
export function roundUpToNinetyNine(cents: number) {
  if (cents <= 99) return 99;
  return Math.ceil((cents - 99) / 100) * 100 + 99;
}

/** Selling price = CJ cost × markup, rounded up to .99. */
export function priceFromCost(cjCostCents: number, markup: number) {
  if (!Number.isFinite(cjCostCents) || cjCostCents < 0) throw new Error("Invalid CJ cost");
  if (!Number.isFinite(markup) || markup <= 0) throw new Error("Invalid markup");
  return roundUpToNinetyNine(Math.round(cjCostCents * markup));
}

/** The markup that applies to a product: its own, or else the store default. */
export function effectiveMarkup(productMarkup: number | null | undefined, defaultMarkup: number) {
  return productMarkup && productMarkup > 0 ? productMarkup : defaultMarkup;
}

/**
 * The price a variant should have. A manual override keeps the typed price;
 * otherwise the price follows CJ cost × markup (when the CJ cost is known).
 */
export function variantPrice(v: {
  priceCents: number;
  priceOverride: boolean;
  cjCostCents: number | null;
  markup: number;
}) {
  if (v.priceOverride || v.cjCostCents == null) return v.priceCents;
  return priceFromCost(v.cjCostCents, v.markup);
}

/** Profit per unit before shipping and payment fees. */
export function unitMargin(priceCents: number, cjCostCents: number | null) {
  return cjCostCents == null ? null : priceCents - cjCostCents;
}
