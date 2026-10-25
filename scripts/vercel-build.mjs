// The build Vercel runs. It checks your settings first and explains in plain
// English what is missing, then updates the database and builds the site.
import { execSync } from "node:child_process";

const env = { ...process.env };

// Vercel's database integrations use different names; accept the common ones
// (the same list as src/lib/db.ts).
function pick(names) {
  for (const name of names) if (env[name]) return env[name];
  return undefined;
}

env.DATABASE_URL = pick(["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL"]);
env.DATABASE_URL_UNPOOLED =
  pick(["DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"]) || env.DATABASE_URL;

const problems = [];
if (!env.DATABASE_URL) {
  problems.push(
    "No database is connected. In Vercel open your project → Storage → Create Database → Neon, " +
      "connect it to this project, then Redeploy.",
  );
}
if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
  problems.push(
    "AUTH_SECRET is missing or shorter than 32 characters. Add it in Settings → Environment Variables, then Redeploy.",
  );
}

if (problems.length) {
  console.error("\n==================== SETUP NEEDED ====================");
  for (const p of problems) console.error("❌ " + p);
  console.error("======================================================\n");
  process.exit(1);
}

function run(label, command) {
  console.log(`\n▶ ${label}`);
  try {
    execSync(command, { stdio: "inherit", env });
  } catch {
    console.error(`\n❌ Failed while: ${label}. Send the red lines above to your developer.\n`);
    process.exit(1);
  }
}

run("Updating database tables", "npx prisma migrate deploy");
run("Adding starter data (Owner account, currencies, countries)", "npx prisma db seed");
run("Building the website", "npx next build");
