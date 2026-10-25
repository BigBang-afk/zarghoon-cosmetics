"use client";

import { deleteProductAction } from "../actions";

export function DeleteProductButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteProductAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete “${title}”? This can't be undone. Tip: set it to Archived to hide it instead.`)) e.preventDefault();
      }}
    >
      <button className="btn border border-red-200 bg-white text-red-700 hover:bg-red-50">Delete product</button>
    </form>
  );
}
