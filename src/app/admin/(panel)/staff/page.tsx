import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDateTime } from "@/lib/format";
import { changeRoleAction, toggleStaffActiveAction } from "./actions";
import { NewStaffForm } from "./new-staff-form";

export const metadata = { title: "Staff" };

export default async function StaffPage() {
  const me = await requireAdmin("OWNER");
  const staff = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Staff accounts</h1>
        <p className="text-sm text-stone-500">Only Owners can see this page.</p>
      </div>

      <section className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {staff.map((u) => {
              const isMe = u.id === me.id;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}{isMe && <span className="text-stone-400"> (you)</span>}</div>
                    <div className="text-stone-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{u.role === "OWNER" ? "Owner" : "Staff"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.isActive ? "bg-juniper-light text-juniper" : "bg-stone-200 text-stone-600"}`}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</td>
                  <td className="px-4 py-3">
                    {!isMe && (
                      <div className="flex justify-end gap-2">
                        <form action={changeRoleAction.bind(null, u.id, u.role === "OWNER" ? "STAFF" : "OWNER")}>
                          <button className="btn-secondary px-3 py-1 text-xs">
                            Make {u.role === "OWNER" ? "Staff" : "Owner"}
                          </button>
                        </form>
                        <form action={toggleStaffActiveAction.bind(null, u.id)}>
                          <button className="btn-secondary px-3 py-1 text-xs">{u.isActive ? "Disable" : "Enable"}</button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 text-lg">Add a staff member</h2>
        <NewStaffForm />
      </section>
    </div>
  );
}
