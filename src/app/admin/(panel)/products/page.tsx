import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/money";
import { deleteSampleProductsAction } from "./actions";
import { ProductsTable, type ProductRow } from "./products-table";

export const metadata = { title: "Products" };

const PAGE_SIZE = 50;
const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const status = STATUSES.find((s) => s === sp.status);
  const categoryId = typeof sp.category === "string" ? sp.category : "";
  const costChanged = sp.flag === "cost";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
        { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
        { cjProductId: q },
      ],
    }),
    ...(status && { status }),
    ...(categoryId && { categoryId: categoryId === "none" ? null : categoryId }),
    ...(costChanged && { costChanged: true }),
  };

  const [products, total, categories, sampleCount, flaggedCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { select: { priceCents: true, stock: true } },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.product.count({ where: { isSample: true } }),
    db.product.count({ where: { costChanged: true } }),
  ]);

  const rows: ProductRow[] = products.map((p) => {
    const prices = p.variants.map((v) => v.priceCents);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      image: p.images[0]?.url ?? null,
      category: p.category?.name ?? null,
      variantCount: p.variants.length,
      stock: p.variants.reduce((s, v) => s + v.stock, 0),
      price: min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`,
      costChanged: p.costChanged,
      isSample: p.isSample,
    };
  });

  const pages = Math.ceil(total / PAGE_SIZE);
  const link = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: q || undefined, status, category: categoryId || undefined, flag: costChanged ? "cost" : undefined, ...changes };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/admin/products?${s}` : "/admin/products";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl">Products</h1>
        <div className="ml-auto flex gap-2">
          <Link href="/admin/products/categories" className="btn-secondary">Categories</Link>
          <Link href="/admin/products/new" className="btn-primary"><Plus className="size-4" /> Add product</Link>
        </div>
      </div>

      {flaggedCount > 0 && !costChanged && (
        <Link href={link({ flag: "cost" })} className="block rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 hover:underline">
          {flaggedCount} {flaggedCount === 1 ? "product has" : "products have"} a changed CJ cost. Review them →
        </Link>
      )}

      {sampleCount > 0 && me.role === "OWNER" && (
        <form action={deleteSampleProductsAction} className="flex flex-wrap items-center gap-3 rounded-lg bg-stone-200/60 px-4 py-3 text-sm">
          <span>{sampleCount} sample products are in your store for testing. Delete them before you launch.</span>
          <button className="btn-secondary ml-auto py-1">Delete all sample products</button>
        </form>
      )}

      <div className="flex flex-wrap gap-1 border-b border-stone-200">
        {[{ label: "All", value: undefined }, ...STATUSES.map((s) => ({ label: s.charAt(0) + s.slice(1).toLowerCase(), value: s }))].map((t) => (
          <Link
            key={t.label}
            href={link({ status: t.value, page: undefined })}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${status === t.value ? "border-juniper font-medium text-juniper" : "border-transparent text-stone-500 hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap gap-2" action="/admin/products">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Search by title, tag, SKU or CJ ID" className="input max-w-xs" />
        <select name="category" defaultValue={categoryId} className="input w-auto">
          <option value="">All categories</option>
          <option value="none">No category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn-secondary">Filter</button>
        {(q || categoryId || costChanged) && <Link href={link({ q: undefined, category: undefined, flag: undefined })} className="btn">Clear</Link>}
      </form>

      <ProductsTable rows={rows} categories={categories} />

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Page {page} of {pages} · {total} products</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={link({ page: String(page - 1) })} className="btn-secondary">Previous</Link>}
            {page < pages && <Link href={link({ page: String(page + 1) })} className="btn-secondary">Next</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
