import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function logActivity(entry: {
  adminUserId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
}) {
  await db.activityLog.create({ data: entry });
}
