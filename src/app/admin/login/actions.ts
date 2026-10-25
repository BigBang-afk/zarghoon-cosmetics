"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string };

// Only allow redirects back into the admin area (never to another website).
function safeRedirect(from: FormDataEntryValue | null) {
  const path = typeof from === "string" ? from : "";
  return path.startsWith("/admin") && !path.startsWith("//") && path !== "/admin/login"
    ? path
    : "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("admin", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: safeRedirect(formData.get("from")),
    });
    return {};
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "rate_limited") {
      return { error: "Too many failed attempts. Please wait 15 minutes and try again." };
    }
    if (error instanceof AuthError) {
      return { error: "Wrong email or password." };
    }
    throw error; // a successful sign-in "throws" a redirect, which Next.js handles
  }
}
