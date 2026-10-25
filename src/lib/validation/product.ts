import { z } from "zod";

// Images must be on this site ("/samples/x.svg") or a secure https:// link.
// This blocks "javascript:" and other unsafe links.
export const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((u) => /^\/[^/]/.test(u) || /^https:\/\/[^\s]+$/i.test(u), "Image links must start with https:// or /");

const cents = z.number().int().min(0).max(100_000_00);

export const variantInput = z.object({
  id: z.string().optional(),
  options: z.record(z.string().trim().max(60), z.string().trim().min(1, "Every variant needs a value for each option").max(60)),
  sku: z.string().trim().max(100).nullable(),
  cjCostCents: cents.nullable(),
  priceCents: cents.min(1, "Every variant needs a price"),
  priceOverride: z.boolean(),
  compareAtPriceCents: cents.nullable(),
  stock: z.number().int().min(0).max(1_000_000),
  imageUrl: imageUrl.nullable(),
  isActive: z.boolean(),
});

export const productInput = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "The URL handle can only use a–z, 0–9 and dashes")
      .max(100),
    description: z.string().max(20_000),
    ingredients: z.string().max(10_000).nullable(),
    howToUse: z.string().max(10_000).nullable(),
    safetyInfo: z.string().max(10_000).nullable(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    categoryId: z.string().nullable(),
    tags: z.array(z.string().trim().min(1).max(50)).max(30),
    markup: z.number().min(1, "Markup must be at least 1×").max(20).nullable(),
    seoTitle: z.string().trim().max(70).nullable(),
    seoDescription: z.string().trim().max(160).nullable(),
    optionNames: z.array(z.string().trim().min(1, "Option names can't be empty").max(40)).max(3),
    images: z.array(z.object({ url: imageUrl, alt: z.string().trim().max(200).nullable() })).max(20),
    variants: z.array(variantInput).min(1, "Add at least one variant").max(100),
  })
  .superRefine((p, ctx) => {
    if (p.optionNames.length === 0 && p.variants.length > 1) {
      ctx.addIssue({ code: "custom", message: "Add an option (like Shade or Size) to have more than one variant" });
    }
    const seen = new Set<string>();
    for (const v of p.variants) {
      const key = p.optionNames.map((n) => v.options[n] ?? "").join("\u0000");
      if (p.optionNames.length && seen.has(key)) {
        ctx.addIssue({ code: "custom", message: `Two variants have the same options (${p.optionNames.map((n) => v.options[n]).join(" / ")})` });
      }
      seen.add(key);
      for (const n of p.optionNames) {
        if (!v.options[n]) ctx.addIssue({ code: "custom", message: `Every variant needs a value for “${n}”` });
      }
      if (v.compareAtPriceCents != null && v.compareAtPriceCents > 0 && v.compareAtPriceCents <= v.priceCents) {
        ctx.addIssue({ code: "custom", message: "A “compare-at” price must be higher than the price" });
      }
    }
  });

export type ProductInput = z.infer<typeof productInput>;
