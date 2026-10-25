"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { SmartImage } from "@/components/smart-image";
import { bulkProductsAction, type BulkState } from "./actions";

export type ProductRow = {
  id: string;
  title: string;
  status: string;
  image: string | null;
  category: string | null;
  variantCount: number;
  stock: number;
  price: string;
  costChanged: boolean;
  isSample: boolean;
};

export function ProductsTable({ rows, categories }: { rows: ProductRow[]; categories: { id: string; name: string }[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [op, setOp] = useState("");
  const [state, formAction, pending] = useActionState<BulkState, FormData>(async (prev, fd) => {
    const result = await bulkProductsAction(prev, fd);
    if (!result.error) setSelected(new Set());
    return result;
  }, {});

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="card overflow-hidden">
      {selected.size > 0 && (
        <form
          action={formAction}
          onSubmit={(e) => {
            if (op === "delete" && !confirm(`Delete ${selected.size} products? This can't be undone. Tip: “Archive” hides them instead.`)) e.preventDefault();
          }}
          className="flex flex-wrap items-center gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3"
        >
          {[...selected].map((id) => <input key={id} type="hidden" name="ids" value={id} />)}
          <span className="text-sm font-medium">{selected.size} selected</span>
          <select name="op" value={op} onChange={(e) => setOp(e.target.value)} className="input w-auto py-1.5" required>
            <option value="">Choose an action…</option>
            <option value="ACTIVE">Set as active (visible)</option>
            <option value="DRAFT">Set as draft (hidden)</option>
            <option value="ARCHIVED">Archive</option>
            <option value="category">Change category</option>
            <option value="markup">Set markup</option>
            <option value="addTag">Add tag</option>
            <option value="delete">Delete</option>
          </select>
          {op === "category" && (
            <select name="value" className="input w-auto py-1.5">
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {op === "markup" && (
            <input name="value" type="number" step="0.1" min="1" max="20" placeholder="e.g. 3 (empty = default)" className="input w-52 py-1.5" />
          )}
          {op === "addTag" && <input name="value" placeholder="Tag" className="input w-40 py-1.5" maxLength={50} />}
          <button disabled={pending || !op} className="btn-primary py-1.5">{pending ? "Working…" : "Apply"}</button>
        </form>
      )}
      {(state.message || state.error) && (
        <p className={`border-b border-stone-200 px-4 py-2 text-sm ${state.error ? "text-red-700" : "text-juniper"}`}>
          {state.error ?? state.message}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500 uppercase">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
                />
              </th>
              <th className="px-2 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-stone-500">No products found.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? "bg-juniper-light/40" : "hover:bg-stone-50"}>
                <td className="px-4 py-3">
                  <input type="checkbox" aria-label={`Select ${r.title}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                </td>
                <td className="px-2 py-3">
                  <Link href={`/admin/products/${r.id}`} className="flex items-center gap-3">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-white">
                      {r.image && <SmartImage src={r.image} alt="" fill sizes="40px" className="object-cover" />}
                    </span>
                    <span>
                      <span className="font-medium hover:underline">{r.title}</span>
                      <span className="mt-0.5 flex gap-1.5">
                        {r.isSample && <span className="rounded bg-stone-100 px-1.5 text-[10px] text-stone-500">SAMPLE</span>}
                        {r.costChanged && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 text-[10px] text-amber-800">
                            <AlertTriangle className="size-3" /> CJ COST CHANGED
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className={`px-4 py-3 ${r.stock === 0 ? "text-red-700" : ""}`}>
                  {r.stock} in stock{r.variantCount > 1 && <span className="text-stone-400"> · {r.variantCount} variants</span>}
                </td>
                <td className="px-4 py-3">{r.price}</td>
                <td className="px-4 py-3 text-stone-600">{r.category ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
