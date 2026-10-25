"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity";

export type PasswordState = { error?: string };

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password").max(200),
    next: z.string().min(12, "New password must be at least 12 characters").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "The new passwords don't match" });

export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const me = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(user.passwordHash, parsed.data.current))) {
    return { error: "Your current password is wrong." };
  }

  await db.adminUser.update({
    where: { id: me.id },
    data: { passwordHash: await hashPassword(parsed.data.next), sessionVersion: { increment: 1 } },
  });
  await logActivity({ adminUserId: me.id, action: "auth.password_change" });

  // Signs you out everywhere; sign in again with the new password.
  await signOut({ redirectTo: "/admin/login" });
  return {};
}
