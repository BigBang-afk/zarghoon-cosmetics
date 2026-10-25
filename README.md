# Zarghoon Cosmetics

An international dropshipping store with its own admin panel. Products come from CJdropshipping.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL + Prisma 7, and Auth.js.

> **Build status:** Stages 1–2 of 7 are done: admin login with roles, products in the admin, and the
> shop (home, shop all, categories, product pages) with sample products.

---

## Launch on Vercel (no computer setup needed)

You need free accounts on **GitHub** (stores the code) and **Vercel** (runs the website).
Sign up for Vercel using "Continue with GitHub".

1. **Import the project.** On https://vercel.com click **Add New → Project**, find the
   `zarghoon-cosmetics` repository and click **Import**. Do not click Deploy yet.
2. **Add your settings.** Open **Environment Variables** on that screen and add:

   | Name | Value |
   |---|---|
   | `AUTH_SECRET` | A long random text (at least 32 characters). You can make one at https://generate-secret.vercel.app/32 |
   | `SEED_OWNER_EMAIL` | The email you will log in with |
   | `SEED_OWNER_PASSWORD` | A strong password, 12+ characters |

3. Click **Deploy**. The first deploy **fails** because there is no database yet. That is expected:
   the build log shows a "SETUP NEEDED" box explaining what to add. Any later failure also shows
   that box (or the step that failed) in plain English.
4. **Add the database.** In your Vercel project open **Storage → Create Database → Neon
   (Serverless Postgres)**, choose the free plan and a region close to your customers, and connect
   it to the project. Vercel adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED` for you.
5. **Deploy again.** Open **Deployments**, click the **⋯** next to the latest one, and choose **Redeploy**.
   During the build, the database tables and your Owner account are created automatically.
6. Open `https://<your-project>.vercel.app/admin` and log in.
7. **Optional, for safety:** after the first successful login, delete `SEED_OWNER_PASSWORD` from
   **Settings → Environment Variables**. It is only needed once. Change your password at
   **Admin → your name → Change password**.

From now on, every time new code is pushed to GitHub, Vercel updates the website by itself.

---

## Running on your own computer (optional, for developers)

## 1. What you need on your computer

1. **Node.js 22** (or newer). Download it from https://nodejs.org (pick the "LTS" version).
2. **A PostgreSQL database.** Choose one:
   - **Easiest: Neon (free, nothing to install).** Sign up at https://neon.tech, create a project,
     and copy the connection string. It looks like
     `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`.
   - **Or install PostgreSQL** on your computer from https://www.postgresql.org/download/.
     The connection string is then like `postgresql://postgres:YOURPASSWORD@localhost:5432/zarghoon`.

## 2. Run the store on your computer

Open a terminal in the project folder and run these one by one:

```bash
# 1. Install the code libraries (this also prepares the database client)
npm install

# 2. Create your private settings file from the template
cp .env.example .env
```

Now open `.env` in a text editor and fill in:

| Setting | What to put |
|---|---|
| `DATABASE_URL` | Your database connection string from step 1 |
| `AUTH_SECRET` | A long random text. Create one by running `npx auth secret` (or `openssl rand -base64 32`) |
| `AUTH_URL` | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | `true` |
| `SEED_OWNER_EMAIL` | The email you will use to log in to the admin |
| `SEED_OWNER_PASSWORD` | A strong password, at least 12 characters |

Leave the other settings empty for now. Later stages explain them.

```bash
# 3. Create the database tables
npm run db:migrate

# 4. Add starter data: your Owner account, currencies, shipping countries
npm run db:seed

# 5. Start the website
npm run dev
```

Open http://localhost:3000 for the shop and http://localhost:3000/admin for the admin.

## 3. Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the site for development (reloads when you change code) |
| `npm run build` | Builds the site the same way Vercel will |
| `npm run lint` / `npm run typecheck` | Checks the code for mistakes |
| `npm test` | Runs the automated tests (pricing and money) |
| `npm run db:migrate` | Applies database changes |
| `npm run db:seed` | Adds starter data (safe to run again) |
| `npm run db:studio` | Opens a simple website to look at your database tables |

## 4. Products and prices

- **Admin → Products** lists everything, with search, filters and bulk changes (show/hide, category,
  markup, tags, delete). Click a product to edit it; **Add product** creates one by hand.
- **Price rule:** when a variant has a CJ cost, its price is **CJ cost × markup, rounded up to .99**
  (e.g. $4.20 × 3 = $12.60 → **$12.99**). Tick **Manual price** to type your own price instead.
- The **store default markup** is in **Admin → Settings** (Owner only). Changing it re-prices every
  product that has no markup of its own and no manual price. A product can also have its own markup.
- **Currencies:** prices are stored and charged in US dollars. GBP, EUR, AED, SAR and PKR are shown
  to shoppers using the exchange rates you type in **Settings → Currencies**.
- **Sample products:** 12 sample products are added once, so you can test. Delete them all with
  **Products → Delete all sample products** before launch; they will not come back.
- Images: paste image links (`https://…`). CJ product images are added automatically in Stage 4.

## 5. Admin roles

- **Owner**: everything, including adding staff, settings and API keys.
- **Staff**: day-to-day work (products, orders, customers, content), but no staff or settings pages.

Owners add staff at **Admin → Staff**. Anyone can change their own password by clicking their
name at the top right.

## 6. How the login is protected

- Passwords are hashed with Argon2id (they are never stored as plain text).
- After 5 wrong passwords for one email (or 20 from one internet address) within 15 minutes,
  login is blocked for 15 minutes.
- Disabling a staff member, changing their role, or changing a password signs that person out
  on every device straight away.
- Every admin page checks the login and role on the server, not just in the browser.
- Every sign-in and staff change is recorded in **Admin → Activity log**.

## 7. Project layout (where things live)

```
prisma/schema.prisma     The database blueprint (all tables)
prisma/seed.ts           Starter data
src/auth.ts              Admin login setup (Auth.js)
src/proxy.ts             Sends signed-out visitors from /admin to the login page
src/lib/                 Shared server code (database, passwords, rate limit, activity log)
src/lib/pricing.ts       Price rules (markup, rounding) — tested in tests/pricing.test.ts
src/lib/catalog.ts       Reads products for the shop (cached for speed)
src/app/admin/           The admin panel pages
src/app/(shop)/          The shop pages
scripts/                 Build script for Vercel, sample image generator
```

## Coming next

Connecting CJdropshipping, payments, emails and deploying to Vercel are explained here as each
stage is built.
