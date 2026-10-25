import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Re-use one database client while developing, so hot reloads don't open
// a new connection pool every time a file changes.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Vercel's database integrations may use any of these names.
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
