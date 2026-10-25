import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { AdminRole } from "@/generated/prisma/enums";

export type CurrentAdmin = { id: string; name: string; email: string; role: AdminRole };

/**
 * Use at the top of every admin page and server action.
 * Signs the user out if their account was disabled or their password changed,
 * and blocks Staff from Owner-only pages when `role` is "OWNER".
 */
export async function requireAdmin(role?: AdminRole): Promise<CurrentAdmin> {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");

  const admin = await db.adminUser.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, isActive: true, sessionVersion: true },
  });
  if (!admin || !admin.isActive || admin.sessionVersion !== session.user.sessionVersion) {
    redirect("/admin/logout");
  }
  if (role === "OWNER" && admin.role !== "OWNER") redirect("/admin?denied=1");

  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
}
