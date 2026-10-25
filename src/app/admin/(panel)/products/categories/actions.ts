"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity";
import { refreshShop } from "@/lib/shop-cache";
import { slugify } from "@/lib/slug";
import { imageUrl } from "@/lib/validation/product";

export type CategoryState = { error?: string; message?: string };

const schema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.union([imageUrl, z.literal("")]).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isVisible: z.boolean(),
});

export async function saveCategoryAction(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  const me = await requireAdmin();
  const parsed = schema.safeParse({
    ...Object.fromEntries(formData),
    id: formData.get("id") || undefined,
    isVisible: formData.get("isVisible") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const c = parsed.data;
  const slug = slugify(c.slug || c.name);
  if (!slug) return { error: "Please use letters or numbers in the name." };

  const clash = await db.category.findFirst({ where: { slug, ...(c.id && { NOT: { id: c.id } }) } });
  if (clash) return { error: `Another category already uses the handle “${slug}”.` };

  const data = { name: c.name, slug, description: c.description || null, imageUrl: c.imageUrl || null, sortOrder: c.sortOrder, isVisible: c.isVisible };
  const saved = c.id ? await db.category.update({ where: { id: c.id }, data }) : await db.category.create({ data });
  await logActivity({ adminUserId: me.id, action: c.id ? "category.update" : "category.create", entityType: "Category", entityId: saved.id, details: { name: c.name } });
  refreshShop("categories", "products");
  refresh();
  return { message: c.id ? "Saved." : `“${c.name}” added.` };
}

export async function deleteCategoryAction(id: string) {
  const me = await requireAdmin();
  const category = await db.category.delete({ where: { id } }).catch(() => null);
  if (!category) return;
  await logActivity({ adminUserId: me.id, action: "category.delete", entityType: "Category", entityId: id, details: { name: category.name } });
  refreshShop("categories", "products");
  refresh();
}
