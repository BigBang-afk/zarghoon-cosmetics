# Zarghoon Cosmetics

An international dropshipping store with its own admin panel. Products come from CJdropshipping.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL + Prisma 7, and Auth.js.

> **Build status:** Stage 1 of 7 is done: project setup, database, admin login with roles.

---

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
| `npm run db:migrate` | Applies database changes |
| `npm run db:seed` | Adds starter data (safe to run again) |
| `npm run db:studio` | Opens a simple website to look at your database tables |

## 4. Admin roles

- **Owner**: everything, including adding staff, settings and API keys.
- **Staff**: day-to-day work (products, orders, customers, content), but no staff or settings pages.

Owners add staff at **Admin → Staff**. Anyone can change their own password by clicking their
name at the top right.

## 5. How the login is protected

- Passwords are hashed with Argon2id (they are never stored as plain text).
- After 5 wrong passwords for one email (or 20 from one internet address) within 15 minutes,
  login is blocked for 15 minutes.
- Disabling a staff member, changing their role, or changing a password signs that person out
  on every device straight away.
- Every admin page checks the login and role on the server, not just in the browser.
- Every sign-in and staff change is recorded in **Admin → Activity log**.

## 6. Project layout (where things live)

```
prisma/schema.prisma     The database blueprint (all tables)
prisma/seed.ts           Starter data
src/auth.ts              Admin login setup (Auth.js)
src/proxy.ts             Sends signed-out visitors from /admin to the login page
src/lib/                 Shared server code (database, passwords, rate limit, activity log)
src/app/admin/           The admin panel pages
src/app/                 The shop pages (built in Stage 2)
```

## Coming next

Connecting CJdropshipping, payments, emails and deploying to Vercel are explained here as each
stage is built.
