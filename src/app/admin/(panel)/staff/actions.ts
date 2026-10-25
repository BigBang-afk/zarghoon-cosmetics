"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity";

export type FormState = { error?: string; success?: string };

const newStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email").max(254).transform((e) => e.toLowerCase().trim()),
  password: z.string().min(12, "Password must be at least 12 characters").max(200),
  role: z.enum(["OWNER", "STAFF"]),
});

export async function createStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin("OWNER");
  const parsed = newStaffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password, role } = parsed.data;
  if (await db.adminUser.findUnique({ where: { email } })) {
    return { error: "An account with that email already exists." };
  }

  const user = await db.adminUser.create({
    data: { name, email, role, passwordHash: await hashPassword(password) },
  });
  await logActivity({
    adminUserId: me.id, action: "staff.create", entityType: "AdminUser", entityId: user.id,
    details: { email, role },
  });
  refresh();
  return { success: `${name} can now sign in.` };
}

async function activeOwnerCount() {
  return db.adminUser.count({ where: { role: "OWNER", isActive: true } });
}

export async function toggleStaffActiveAction(userId: string) {
  const me = await requireAdmin("OWNER");
  if (userId === me.id) return; // you can't disable yourself

  const user = await db.adminUser.findUnique({ where: { id: userId } });
  if (!user) return;
  if (user.isActive && user.role === "OWNER" && (await activeOwnerCount()) <= 1) return;

  await db.adminUser.update({
    where: { id: userId },
    // Bumping sessionVersion signs a disabled user out immediately.
    data: { isActive: !user.isActive, sessionVersion: { increment: 1 } },
  });
  await logActivity({
    adminUserId: me.id, action: user.isActive ? "staff.disable" : "staff.enable",
    entityType: "AdminUser", entityId: userId, details: { email: user.email },
  });
  refresh();
}

export async function changeRoleAction(userId: string, role: "OWNER" | "STAFF") {
  const me = await requireAdmin("OWNER");
  if (userId === me.id) return; // avoid locking yourself out

  const user = await db.adminUser.findUnique({ where: { id: userId } });
  if (!user || user.role === role) return;

  await db.adminUser.update({
    where: { id: userId },
    data: { role, sessionVersion: { increment: 1 } },
  });
  await logActivity({
    adminUserId: me.id, action: "staff.role", entityType: "AdminUser", entityId: userId,
    details: { email: user.email, from: user.role, to: role },
  });
  refresh();
}
