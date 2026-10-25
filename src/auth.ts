import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { burnPasswordCheck, verifyPassword } from "@/lib/password";
import { isLoginBlocked, recordLoginAttempt } from "@/lib/login-rate-limit";
import { logActivity } from "@/lib/activity";

class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

const loginSchema = z.object({
  email: z.email().max(254).transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // admins stay signed in for 8 hours
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";

        if (await isLoginBlocked(email, ip)) throw new TooManyAttempts();

        const admin = await db.adminUser.findUnique({ where: { email } });
        if (!admin || !admin.isActive) {
          await burnPasswordCheck(password);
          await recordLoginAttempt(email, ip, false);
          return null;
        }

        if (!(await verifyPassword(admin.passwordHash, password))) {
          await recordLoginAttempt(email, ip, false);
          return null;
        }

        await recordLoginAttempt(email, ip, true);
        await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
        await logActivity({ adminUserId: admin.id, action: "auth.login", details: { ip } });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          sessionVersion: admin.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.sessionVersion = token.sessionVersion;
      return session;
    },
  },
});
