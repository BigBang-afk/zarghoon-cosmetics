import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { CountriesForm, CurrenciesForm, PricingForm } from "./forms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin("OWNER");
  const [settings, currencies, countries] = await Promise.all([
    db.storeSettings.findUniqueOrThrow({ where: { id: 1 } }),
    db.currency.findMany({ orderBy: { sortOrder: "asc" } }),
    db.shippingCountry.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Settings</h1>
        <p className="text-sm text-stone-500">Store details, emails, staff and API keys are added in Stage 6.</p>
      </div>
      <section className="card p-5">
        <h2 className="mb-4 text-lg">Pricing</h2>
        <PricingForm
          defaultMarkup={Number(settings.defaultMarkup)}
          feePercent={Number(settings.paymentFeePercent)}
          feeFixed={settings.paymentFeeFixedCents / 100}
        />
      </section>
      <section className="card p-5">
        <h2 className="mb-4 text-lg">Currencies &amp; exchange rates</h2>
        <CurrenciesForm currencies={currencies.map((c) => ({ code: c.code, name: c.name, rateToUsd: Number(c.rateToUsd), isEnabled: c.isEnabled }))} />
      </section>
      <section className="card p-5">
        <h2 className="mb-1 text-lg">Shipping countries</h2>
        <p className="mb-4 text-xs text-stone-500">Customers can only order to ticked countries.</p>
        <CountriesForm countries={countries} />
      </section>
    </div>
  );
}
