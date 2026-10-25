import "server-only";
import { db } from "@/lib/db";
import { effectiveMarkup, priceFromCost } from "@/lib/pricing";

/**
 * Re-applies "CJ cost × markup" to every variant that follows the markup
 * (i.e. not manually overridden). Limit to some products with `productIds`.
 * Returns how many prices changed.
 */
export async function recalculatePrices(productIds?: string[]) {
  const settings = await db.storeSettings.findUniqueOrThrow({ where: { id: 1 } });
  const defaultMarkup = Number(settings.defaultMarkup);

  const variants = await db.productVariant.findMany({
    where: {
      priceOverride: false,
      cjCostCents: { not: null },
      ...(productIds && { productId: { in: productIds } }),
    },
    select: { id: true, priceCents: true, cjCostCents: true, product: { select: { markup: true } } },
  });

  let changed = 0;
  for (const v of variants) {
    const markup = effectiveMarkup(v.product.markup == null ? null : Number(v.product.markup), defaultMarkup);
    const price = priceFromCost(v.cjCostCents!, markup);
    if (price !== v.priceCents) {
      await db.productVariant.update({ where: { id: v.id }, data: { priceCents: price } });
      changed++;
    }
  }
  return changed;
}
