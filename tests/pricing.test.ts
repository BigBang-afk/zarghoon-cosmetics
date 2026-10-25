import { describe, expect, it } from "vitest";
import { effectiveMarkup, priceFromCost, roundUpToNinetyNine, unitMargin, variantPrice } from "@/lib/pricing";
import { convertFromUsdCents, dollarsToCents, formatMoney } from "@/lib/money";

describe("roundUpToNinetyNine", () => {
  it.each([
    [1260, 1299], [1299, 1299], [1300, 1399], [1200, 1299], [1199, 1199], [50, 99], [0, 99],
  ])("%i → %i", (input, expected) => expect(roundUpToNinetyNine(input)).toBe(expected));

  it("never goes below the input", () => {
    for (let c = 0; c < 5000; c += 7) expect(roundUpToNinetyNine(c)).toBeGreaterThanOrEqual(c);
  });
});

describe("priceFromCost", () => {
  it("applies a 3× markup and rounds up to .99", () => {
    expect(priceFromCost(420, 3)).toBe(1299); // $4.20 × 3 = $12.60 → $12.99
    expect(priceFromCost(1000, 2.5)).toBe(2599); // $25.00 → $25.99
  });
  it("rejects bad input", () => {
    expect(() => priceFromCost(-1, 3)).toThrow();
    expect(() => priceFromCost(100, 0)).toThrow();
  });
});

describe("effectiveMarkup", () => {
  it("uses the product's markup when set, else the default", () => {
    expect(effectiveMarkup(2.5, 3)).toBe(2.5);
    expect(effectiveMarkup(null, 3)).toBe(3);
    expect(effectiveMarkup(0, 3)).toBe(3);
  });
});

describe("variantPrice", () => {
  it("keeps a manual override", () => {
    expect(variantPrice({ priceCents: 1500, priceOverride: true, cjCostCents: 420, markup: 3 })).toBe(1500);
  });
  it("follows cost × markup when not overridden", () => {
    expect(variantPrice({ priceCents: 1500, priceOverride: false, cjCostCents: 420, markup: 3 })).toBe(1299);
  });
  it("keeps the price when the CJ cost is unknown", () => {
    expect(variantPrice({ priceCents: 1500, priceOverride: false, cjCostCents: null, markup: 3 })).toBe(1500);
  });
});

describe("unitMargin", () => {
  it("is price minus CJ cost", () => {
    expect(unitMargin(1299, 420)).toBe(879);
    expect(unitMargin(1299, null)).toBeNull();
  });
});

describe("money", () => {
  const PKR = { code: "PKR", symbol: "Rs ", rateToUsd: 281, decimals: 0 };
  const GBP = { code: "GBP", symbol: "£", rateToUsd: 0.75, decimals: 2 };
  it("converts and formats", () => {
    expect(formatMoney(1299)).toBe("$12.99");
    expect(formatMoney(1299, GBP)).toBe("£9.74");
    expect(convertFromUsdCents(1299, PKR)).toBe(3650);
    expect(formatMoney(129900, PKR)).toBe("Rs 365,019");
  });
  it("parses dollar input", () => {
    expect(dollarsToCents("12.5")).toBe(1250);
    expect(dollarsToCents("$4.20")).toBe(420);
    expect(dollarsToCents("abc")).toBeNull();
    expect(dollarsToCents("1.234")).toBeNull();
  });
});
