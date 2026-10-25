"use client";

import { createContext, use, useSyncExternalStore } from "react";
import { BASE_CURRENCY, formatMoney, type CurrencyInfo } from "@/lib/money";

// The shopper's currency is remembered in a cookie for a year. Prices are
// stored in USD and converted here, so every page can be cached and fast.
const COOKIE = "currency";
const listeners = new Set<() => void>();

function readCookie() {
  const match = document.cookie.match(/(?:^|; )currency=([A-Z]{3})/);
  return match?.[1] ?? null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const CurrencyContext = createContext<CurrencyInfo[]>([BASE_CURRENCY]);

export function CurrencyProvider({ currencies, children }: { currencies: CurrencyInfo[]; children: React.ReactNode }) {
  return <CurrencyContext value={currencies.length ? currencies : [BASE_CURRENCY]}>{children}</CurrencyContext>;
}

export function useCurrency() {
  const currencies = use(CurrencyContext);
  const code = useSyncExternalStore(subscribe, () => readCookie() ?? "USD", () => "USD");
  const currency = currencies.find((c) => c.code === code) ?? currencies.find((c) => c.code === "USD") ?? BASE_CURRENCY;

  function setCurrency(next: string) {
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    listeners.forEach((l) => l());
  }
  return { currency, currencies, setCurrency };
}

export function Price({
  cents,
  compareAtCents,
  from = false,
  className = "",
}: {
  cents: number;
  compareAtCents?: number | null;
  from?: boolean;
  className?: string;
}) {
  const { currency } = useCurrency();
  const onSale = compareAtCents != null && compareAtCents > cents;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={onSale ? "text-saffron" : undefined}>
        {from && <span className="text-[0.85em] font-normal text-stone-500">From </span>}
        {formatMoney(cents, currency)}
      </span>
      {onSale && (
        <s className="text-[0.85em] font-normal text-stone-400">
          <span className="sr-only">Was </span>
          {formatMoney(compareAtCents, currency)}
        </s>
      )}
    </span>
  );
}

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, currencies, setCurrency } = useCurrency();
  if (currencies.length < 2) return null;
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">Currency</span>
      <select
        value={currency.code}
        onChange={(e) => setCurrency(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border border-stone-300 bg-white py-1 pr-7 pl-2 text-sm"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>{c.code}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 size-3 text-stone-500" viewBox="0 0 12 12" aria-hidden>
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </label>
  );
}
