import { CheckCircle2, Circle } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Home" };

const STAGES = [
  { n: 1, title: "Project setup, database & admin login", done: true },
  { n: 2, title: "Products in admin + shop product pages" },
  { n: 3, title: "Cart & checkout (test payments)" },
  { n: 4, title: "CJ connection + product search/import" },
  { n: 5, title: "Send orders to CJ + tracking sync" },
  { n: 6, title: "Dashboard, discounts, customers, content, emails" },
  { n: 7, title: "Tests, security review, deploy" },
];

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const { denied } = await searchParams;

  return (
    <div className="space-y-6">
      {denied && (
        <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          That page is only available to the store Owner.
        </p>
      )}
      <div>
        <h1 className="text-2xl">Welcome, {admin.name.split(" ")[0]}</h1>
        <p className="text-sm text-stone-500">Your sales dashboard will appear here in Stage 6.</p>
      </div>
      <section className="card p-5">
        <h2 className="mb-4 text-lg">Build progress</h2>
        <ol className="space-y-3">
          {STAGES.map((s) => (
            <li key={s.n} className="flex items-center gap-3 text-sm">
              {s.done ? (
                <CheckCircle2 className="size-5 text-juniper" />
              ) : (
                <Circle className="size-5 text-stone-300" />
              )}
              <span className={s.done ? "font-medium" : "text-stone-500"}>
                Stage {s.n}: {s.title}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
