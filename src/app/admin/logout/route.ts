import { signOut } from "@/auth";

// Used when a session is no longer valid (account disabled or password changed).
export async function GET() {
  await signOut({ redirectTo: "/admin/login" });
}
