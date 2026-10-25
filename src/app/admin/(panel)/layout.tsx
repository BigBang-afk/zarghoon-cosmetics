import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Zarghoon Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Reading the login session happens per request, so it sits inside Suspense.
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100" />}>
      <SignedInShell>{children}</SignedInShell>
    </Suspense>
  );
}

async function SignedInShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell admin={admin} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}
