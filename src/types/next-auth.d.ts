import type { AdminRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: AdminRole;
    sessionVersion: number;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
      sessionVersion: number;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
    sessionVersion: number;
  }
}
