// Converting and showing prices in the shopper's chosen currency.

export type CurrencyInfo = { code: string; symbol: string; rateToUsd: number; decimals: number };

export const BASE_CURRENCY: CurrencyInfo = { code: "USD", symbol: "$", rateToUsd: 1, decimals: 2 };

/** Converts USD cents into the chosen currency (a plain number, e.g. 3651.5 PKR). */
export function convertFromUsdCents(cents: number, currency: CurrencyInfo) {
  const amount = (cents / 100) * currency.rateToUsd;
  const factor = 10 ** currency.decimals;
  return Math.round(amount * factor) / factor;
}

export function formatMoney(cents: number, currency: CurrencyInfo = BASE_CURRENCY) {
  const amount = convertFromUsdCents(cents, currency);
  const number = amount.toLocaleString("en-US", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });
  return `${currency.symbol}${number}`;
}

/** "12.50" → 1250. Returns null for anything that isn't a valid amount. */
export function dollarsToCents(input: string) {
  const s = input.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

export function centsToDollars(cents: number | null | undefined) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}
