import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { CategoryForm } from "./category-form";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-stone-500 hover:underline">← Products</Link>
        <h1 className="text-2xl">Categories</h1>
        <p className="text-sm text-stone-500">Categories appear in the shop menu, in order. Hidden ones are not shown.</p>
      </div>
      {categories.map((c) => (
        <CategoryForm key={c.id} category={{ ...c, productCount: c._count.products }} />
      ))}
      <h2 className="pt-4 text-lg">Add a category</h2>
      <CategoryForm key="new" />
    </div>
  );
}
