import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { EMPTY_PRODUCT, ProductForm } from "../product-form";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, settings] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.storeSettings.findUniqueOrThrow({ where: { id: 1 } }),
  ]);
  return <ProductForm initial={EMPTY_PRODUCT} categories={categories} defaultMarkup={Number(settings.defaultMarkup)} />;
}
