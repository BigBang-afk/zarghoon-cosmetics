"use client";

import { useActionState } from "react";
import { deleteCategoryAction, saveCategoryAction, type CategoryState } from "./actions";

type Category = { id: string; name: string; slug: string; description: string | null; imageUrl: string | null; sortOrder: number; isVisible: boolean; productCount: number };

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction, pending] = useActionState<CategoryState, FormData>(saveCategoryAction, {});
  return (
    <div className="card p-4">
      <form action={formAction} className="grid gap-3 sm:grid-cols-6">
        {category && <input type="hidden" name="id" value={category.id} />}
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input name="name" defaultValue={category?.name} required className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">URL handle</label>
          <input name="slug" defaultValue={category?.slug} placeholder="made from the name" className="input" />
        </div>
        <div>
          <label className="label">Order</label>
          <input name="sortOrder" type="number" min={0} defaultValue={category?.sortOrder ?? 0} className="input" />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" name="isVisible" defaultChecked={category?.isVisible ?? true} /> Visible
        </label>
        <div className="sm:col-span-3">
          <label className="label">Description</label>
          <input name="description" defaultValue={category?.description ?? ""} className="input" />
        </div>
        <div className="sm:col-span-3">
          <label className="label">Image link</label>
          <input name="imageUrl" defaultValue={category?.imageUrl ?? ""} placeholder="https://…" className="input" />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
          <button disabled={pending} className="btn-primary">{category ? "Save" : "Add category"}</button>
          {category && <span className="text-xs text-stone-500">{category.productCount} products</span>}
          {state.error && <span className="text-sm text-red-700">{state.error}</span>}
          {state.message && <span className="text-sm text-juniper">{state.message}</span>}
          {category && (
            <button
              type="button"
              className="ml-auto text-sm text-red-700 hover:underline"
              onClick={() => {
                if (confirm(`Delete “${category.name}”? Its products stay, but without a category.`)) deleteCategoryAction(category.id);
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
