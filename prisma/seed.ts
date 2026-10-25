// Fills the database with starter data. Safe to run more than once.
// Run with:  npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Starting exchange rates (units per 1 USD). Update them any time in admin.
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", rateToUsd: 1, decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", rateToUsd: 0.75, decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", rateToUsd: 0.86, decimals: 2 },
  { code: "AED", name: "UAE Dirham", symbol: "AED ", rateToUsd: 3.6725, decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR ", rateToUsd: 3.75, decimals: 2 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs ", rateToUsd: 281, decimals: 0 },
];

const COUNTRIES: [string, string][] = [
  ["US", "United States"], ["GB", "United Kingdom"], ["CA", "Canada"], ["AU", "Australia"],
  ["IE", "Ireland"], ["DE", "Germany"], ["FR", "France"], ["NL", "Netherlands"],
  ["BE", "Belgium"], ["ES", "Spain"], ["IT", "Italy"], ["SE", "Sweden"],
  ["AE", "United Arab Emirates"], ["SA", "Saudi Arabia"], ["QA", "Qatar"], ["KW", "Kuwait"],
  ["BH", "Bahrain"], ["OM", "Oman"], ["PK", "Pakistan"], ["MY", "Malaysia"], ["SG", "Singapore"],
];

async function main() {
  // Create the first Owner account, only if the store has no Owner yet.
  // After the first deploy you can delete SEED_OWNER_PASSWORD from your settings.
  const ownerCount = await db.adminUser.count({ where: { role: "OWNER" } });
  if (ownerCount > 0) {
    console.log("An Owner account already exists, skipping.");
  } else {
    const email = process.env.SEED_OWNER_EMAIL?.toLowerCase().trim();
    const password = process.env.SEED_OWNER_PASSWORD;
    const where = "in Vercel → Settings → Environment Variables (tick Production), then Redeploy";
    if (!email) throw new Error(`SEED_OWNER_EMAIL is missing. Add it ${where}.`);
    if (!password) throw new Error(`SEED_OWNER_PASSWORD is missing. Add it ${where}.`);
    if (password.length < 12) {
      throw new Error(
        `SEED_OWNER_PASSWORD is only ${password.length} characters; it needs at least 12. Change it ${where}.`,
      );
    }
    await db.adminUser.create({
      data: { email, name: "Store Owner", role: "OWNER", passwordHash: await hashPassword(password) },
    });
    console.log(`Created Owner account: ${email}`);
  }

  await db.storeSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  for (const [i, c] of CURRENCIES.entries()) {
    await db.currency.upsert({ where: { code: c.code }, update: {}, create: { ...c, sortOrder: i } });
  }
  for (const [code, name] of COUNTRIES) {
    await db.shippingCountry.upsert({ where: { code }, update: {}, create: { code, name } });
  }
  console.log(`Settings, ${CURRENCIES.length} currencies and ${COUNTRIES.length} shipping countries are ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
