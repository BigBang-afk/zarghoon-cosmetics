"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity";
import { refreshShop } from "@/lib/shop-cache";
import { recalculatePrices } from "@/lib/repricing";

export type SettingsState = { error?: string; message?: string };

const pricingSchema = z.object({
  defaultMarkup: z.coerce.number().min(1, "Markup must be at least 1×").max(20),
  paymentFeePercent: z.coerce.number().min(0).max(20),
  paymentFeeFixed: z.coerce.number().min(0).max(10),
});

export async function savePricingAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireAdmin("OWNER");
  const parsed = pricingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { defaultMarkup, paymentFeePercent, paymentFeeFixed } = parsed.data;

  const before = await db.storeSettings.findUniqueOrThrow({ where: { id: 1 } });
  await db.storeSettings.update({
    where: { id: 1 },
    data: { defaultMarkup, paymentFeePercent, paymentFeeFixedCents: Math.round(paymentFeeFixed * 100) },
  });
  let changed = 0;
  if (Number(before.defaultMarkup) !== defaultMarkup) changed = await recalculatePrices();

  await logActivity({
    adminUserId: me.id, action: "settings.pricing",
    details: { defaultMarkup: { from: Number(before.defaultMarkup), to: defaultMarkup }, paymentFeePercent, paymentFeeFixed },
  });
  refreshShop("products");
  refresh();
  return { message: changed ? `Saved. ${changed} prices were updated to the new markup.` : "Saved." };
}

const rateSchema = z.object({
  code: z.string().regex(/^[A-Z]{3}$/),
  rateToUsd: z.coerce.number().positive("Rates must be above 0").max(1_000_000),
  isEnabled: z.boolean(),
});

export async function saveCurrenciesAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireAdmin("OWNER");
  const codes = formData.getAll("code").map(String);
  const rows = [];
  for (const code of codes) {
    const parsed = rateSchema.safeParse({
      code,
      rateToUsd: formData.get(`rate_${code}`),
      isEnabled: code === "USD" || formData.get(`enabled_${code}`) === "on",
    });
    if (!parsed.success) return { error: `${code}: ${parsed.error.issues[0].message}` };
    rows.push(parsed.data);
  }
  for (const r of rows) {
    await db.currency.update({
      where: { code: r.code },
      data: { rateToUsd: r.code === "USD" ? 1 : r.rateToUsd, isEnabled: r.isEnabled },
    });
  }
  await logActivity({ adminUserId: me.id, action: "settings.currencies", details: Object.fromEntries(rows.map((r) => [r.code, r.rateToUsd])) });
  refreshShop("currencies");
  refresh();
  return { message: "Exchange rates saved." };
}

export async function saveCountriesAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const me = await requireAdmin("OWNER");
  const enabled = new Set(formData.getAll("enabled").map(String));
  const newCode = String(formData.get("newCode") ?? "").trim().toUpperCase();
  const newName = String(formData.get("newName") ?? "").trim();

  const all = await db.shippingCountry.findMany();
  for (const c of all) {
    const on = enabled.has(c.code);
    if (on !== c.isEnabled) await db.shippingCountry.update({ where: { code: c.code }, data: { isEnabled: on } });
  }
  if (newCode || newName) {
    if (!/^[A-Z]{2}$/.test(newCode) || !newName || newName.length > 80) {
      return { error: "To add a country, enter its 2-letter code (e.g. NZ) and its name." };
    }
    await db.shippingCountry.upsert({ where: { code: newCode }, update: { name: newName, isEnabled: true }, create: { code: newCode, name: newName } });
  }
  await logActivity({ adminUserId: me.id, action: "settings.countries", details: { enabled: [...enabled], added: newCode || null } });
  refreshShop("countries");
  refresh();
  return { message: "Shipping countries saved." };
}
