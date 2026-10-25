"use client";

import { useActionState } from "react";
import { saveCountriesAction, saveCurrenciesAction, savePricingAction, type SettingsState } from "./actions";

function Status({ state }: { state: SettingsState }) {
  if (state.error) return <span role="alert" className="text-sm text-red-700">{state.error}</span>;
  if (state.message) return <span className="text-sm text-juniper">{state.message}</span>;
  return null;
}

export function PricingForm({ defaultMarkup, feePercent, feeFixed }: { defaultMarkup: number; feePercent: number; feeFixed: number }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(savePricingAction, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="label" htmlFor="defaultMarkup">Default markup (×)</label>
        <input id="defaultMarkup" name="defaultMarkup" type="number" step="0.05" min="1" max="20" defaultValue={defaultMarkup} className="input" />
        <p className="mt-1 text-xs text-stone-500">Selling price = CJ cost × this, rounded up to .99.</p>
      </div>
      <div>
        <label className="label" htmlFor="paymentFeePercent">Payment fee (%)</label>
        <input id="paymentFeePercent" name="paymentFeePercent" type="number" step="0.01" min="0" max="20" defaultValue={feePercent} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="paymentFeeFixed">Payment fee per order ($)</label>
        <input id="paymentFeeFixed" name="paymentFeeFixed" type="number" step="0.01" min="0" max="10" defaultValue={feeFixed} className="input" />
        <p className="mt-1 text-xs text-stone-500">Used to estimate profit. Updated once you choose a payment provider.</p>
      </div>
      <div className="flex items-center gap-3 sm:col-span-3">
        <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save pricing"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function CurrenciesForm({ currencies }: { currencies: { code: string; name: string; rateToUsd: number; isEnabled: boolean }[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveCurrenciesAction, {});
  return (
    <form action={action}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="text-xs text-stone-500 uppercase">
            <tr><th className="py-2 font-medium">Currency</th><th className="py-2 font-medium">1 USD =</th><th className="py-2 font-medium">Shown in shop</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {currencies.map((c) => (
              <tr key={c.code}>
                <td className="py-2">
                  <input type="hidden" name="code" value={c.code} />
                  <span className="font-medium">{c.code}</span> <span className="text-stone-500">{c.name}</span>
                </td>
                <td className="py-2">
                  <input name={`rate_${c.code}`} type="number" step="any" min="0" defaultValue={c.rateToUsd} readOnly={c.code === "USD"}
                    className="input w-36 py-1 read-only:bg-stone-50" aria-label={`${c.code} rate`} />
                </td>
                <td className="py-2">
                  <input type="checkbox" name={`enabled_${c.code}`} defaultChecked={c.isEnabled} disabled={c.code === "USD"} aria-label={`Show ${c.code}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-stone-500">
        Prices are charged in US dollars; other currencies are shown as a guide. Check rates on a site like xe.com and update them here.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save rates"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function CountriesForm({ countries }: { countries: { code: string; name: string; isEnabled: boolean }[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveCountriesAction, {});
  return (
    <form action={action}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {countries.map((c) => (
          <label key={c.code} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enabled" value={c.code} defaultChecked={c.isEnabled} />
            {c.name} <span className="text-stone-400">{c.code}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="label" htmlFor="newCode">Add country code</label>
          <input id="newCode" name="newCode" maxLength={2} placeholder="NZ" className="input w-24 uppercase" />
        </div>
        <div>
          <label className="label" htmlFor="newName">Country name</label>
          <input id="newName" name="newName" maxLength={80} placeholder="New Zealand" className="input w-48" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save countries"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}
