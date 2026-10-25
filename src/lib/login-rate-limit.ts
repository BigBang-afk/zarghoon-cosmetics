import "server-only";
import { db } from "@/lib/db";

// Block an email after 5 failed tries, or an IP after 20, within 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;

export async function isLoginBlocked(email: string, ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const [emailFails, ipFails] = await Promise.all([
    db.loginAttempt.count({ where: { email, success: false, createdAt: { gte: since } } }),
    db.loginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } }),
  ]);
  return emailFails >= MAX_FAILS_PER_EMAIL || ipFails >= MAX_FAILS_PER_IP;
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean) {
  await db.loginAttempt.create({ data: { email, ip, success } });
}
