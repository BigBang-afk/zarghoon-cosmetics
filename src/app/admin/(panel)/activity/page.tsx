import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Activity log" };

export default async function ActivityPage() {
  await requireAdmin();
  const entries = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { adminUser: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Activity log</h1>
        <p className="text-sm text-stone-500">The latest 100 changes made in the admin.</p>
      </div>
      <section className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Who</th>
              <th className="px-4 py-3 font-medium">What</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {entries.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-500">Nothing yet.</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 whitespace-nowrap text-stone-500">{formatDateTime(e.createdAt)}</td>
                <td className="px-4 py-3">{e.adminUser?.name ?? "System"}</td>
                <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                <td className="px-4 py-3 font-mono text-xs break-all text-stone-500">
                  {e.details ? JSON.stringify(e.details) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
