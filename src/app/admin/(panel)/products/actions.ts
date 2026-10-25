"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity";
import { refreshShop } from "@/lib/shop-cache";
import { effectiveMarkup, variantPrice } from "@/lib/pricing";
import { recalculatePrices } from "@/lib/repricing";
import { productInput } from "@/lib/validation/product";

export type SaveState = { error?: string; saved?: boolean };

const blankToNull = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null);

export async function saveProductAction(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const me = await requireAdmin();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Something went wrong reading the form. Please reload and try again." };
  }
  const parsed = productInput.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;

  const clash = await db.product.findFirst({ where: { slug: p.slug, ...(p.id && { NOT: { id: p.id } }) } });
  if (clash) return { error: `The URL handle “${p.slug}” is already used by “${clash.title}”.` };
  if (p.categoryId && !(await db.category.findUnique({ where: { id: p.categoryId } }))) {
    return { error: "That category no longer exists." };
  }

  const settings = await db.storeSettings.findUniqueOrThrow({ where: { id: 1 } });
  const markup = effectiveMarkup(p.markup, Number(settings.defaultMarkup));

  const productData = {
    title: p.title,
    slug: p.slug,
    description: p.description,
    ingredients: blankToNull(p.ingredients),
    howToUse: blankToNull(p.howToUse),
    safetyInfo: blankToNull(p.safetyInfo),
    status: p.status,
    categoryId: p.categoryId,
    tags: [...new Set(p.tags)],
    markup: p.markup,
    seoTitle: blankToNull(p.seoTitle),
    seoDescription: blankToNull(p.seoDescription),
  };

  const variantsData = p.variants.map((v, position) => {
    const options = Object.fromEntries(p.optionNames.map((n) => [n, v.options[n]]));
    return {
      id: v.id,
      data: {
        title: p.optionNames.length ? p.optionNames.map((n) => v.options[n]).join(" / ") : "Default",
        options,
        sku: blankToNull(v.sku),
        cjCostCents: v.cjCostCents,
        priceOverride: v.priceOverride,
        priceCents: variantPrice({ ...v, markup }),
        compareAtPriceCents: v.compareAtPriceCents || null,
        stock: v.stock,
        imageUrl: v.imageUrl,
        isActive: v.isActive,
        position,
      },
    };
  });

  const productId = await db.$transaction(async (tx) => {
    let id = p.id;
    if (id) {
      const existing = await tx.product.findUnique({ where: { id } });
      if (!existing) throw new Error("Product not found");
      await tx.product.update({ where: { id }, data: { ...productData, costChanged: false } });
    } else {
      id = (await tx.product.create({ data: productData })).id;
    }

    // Images: replace the whole list in the new order.
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productImage.createMany({
      data: p.images.map((img, position) => ({ productId: id!, url: img.url, alt: blankToNull(img.alt), position })),
    });

    // Variants: update the kept ones, add new ones, delete removed ones.
    const keepIds = variantsData.map((v) => v.id).filter(Boolean) as string[];
    await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } });
    for (const v of variantsData) {
      if (v.id) {
        await tx.productVariant.update({ where: { id: v.id, productId: id }, data: v.data });
      } else {
        await tx.productVariant.create({ data: { ...v.data, productId: id! } });
      }
    }
    return id;
  });

  await logActivity({
    adminUserId: me.id,
    action: p.id ? "product.update" : "product.create",
    entityType: "Product",
    entityId: productId,
    details: { title: p.title, status: p.status, variants: p.variants.length },
  });
  refreshShop("products");

  if (!p.id) redirect(`/admin/products/${productId}?created=1`);
  refresh();
  return { saved: true };
}

export async function deleteProductAction(productId: string) {
  const me = await requireAdmin();
  const product = await db.product.delete({ where: { id: productId } }).catch(() => null);
  if (product) {
    await logActivity({ adminUserId: me.id, action: "product.delete", entityType: "Product", entityId: productId, details: { title: product.title } });
    refreshShop("products");
  }
  redirect("/admin/products");
}

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1, "Select at least one product").max(500),
  op: z.enum(["ACTIVE", "DRAFT", "ARCHIVED", "category", "markup", "addTag", "delete"]),
  value: z.string().max(100).optional(),
});

export type BulkState = { error?: string; message?: string };

export async function bulkProductsAction(_prev: BulkState, formData: FormData): Promise<BulkState> {
  const me = await requireAdmin();
  const parsed = bulkSchema.safeParse({
    ids: formData.getAll("ids").map(String),
    op: formData.get("op"),
    value: formData.get("value") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { ids, op, value } = parsed.data;
  const where = { id: { in: ids } };
  let message: string;

  switch (op) {
    case "ACTIVE":
    case "DRAFT":
    case "ARCHIVED":
      await db.product.updateMany({ where, data: { status: op } });
      message = `${ids.length} products set to ${op.toLowerCase()}.`;
      break;
    case "category": {
      const categoryId = value || null;
      if (categoryId && !(await db.category.findUnique({ where: { id: categoryId } }))) return { error: "Choose a category." };
      await db.product.updateMany({ where, data: { categoryId } });
      message = `Category changed for ${ids.length} products.`;
      break;
    }
    case "markup": {
      const n = value ? Number(value) : null;
      if (n != null && (!Number.isFinite(n) || n < 1 || n > 20)) return { error: "Markup must be between 1 and 20 (or empty for the store default)." };
      await db.product.updateMany({ where, data: { markup: n } });
      const changed = await recalculatePrices(ids);
      message = `Markup set to ${n ? `${n}×` : "store default"}. ${changed} prices updated.`;
      break;
    }
    case "addTag": {
      const tag = value?.trim();
      if (!tag) return { error: "Type a tag to add." };
      const products = await db.product.findMany({ where, select: { id: true, tags: true } });
      for (const p of products) {
        if (!p.tags.includes(tag)) await db.product.update({ where: { id: p.id }, data: { tags: [...p.tags, tag] } });
      }
      message = `Tag “${tag}” added to ${ids.length} products.`;
      break;
    }
    case "delete":
      await db.product.deleteMany({ where });
      message = `${ids.length} products deleted.`;
      break;
  }

  await logActivity({ adminUserId: me.id, action: `product.bulk.${op}`, entityType: "Product", details: { count: ids.length, value: value ?? null } });
  refreshShop("products");
  refresh();
  return { message };
}

export async function deleteSampleProductsAction() {
  const me = await requireAdmin("OWNER");
  const { count } = await db.product.deleteMany({ where: { isSample: true } });
  await logActivity({ adminUserId: me.id, action: "product.delete_samples", details: { count } });
  refreshShop("products");
  refresh();
}
