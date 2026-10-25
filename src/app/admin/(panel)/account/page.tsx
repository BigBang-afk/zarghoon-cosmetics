import { requireAdmin } from "@/lib/admin-auth";
import { PasswordForm } from "./password-form";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const me = await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">My account</h1>
        <p className="text-sm text-stone-500">{me.name} · {me.email} · {me.role === "OWNER" ? "Owner" : "Staff"}</p>
      </div>
      <section className="card p-5">
        <h2 className="mb-4 text-lg">Change password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
