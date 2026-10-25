"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { SmartImage } from "@/components/smart-image";
import { centsToDollars, dollarsToCents, formatMoney } from "@/lib/money";
import { effectiveMarkup, priceFromCost } from "@/lib/pricing";
import { slugify } from "@/lib/slug";
import type { ProductInput } from "@/lib/validation/product";
import { saveProductAction, type SaveState } from "./actions";

type VariantState = {
  key: string;
  id?: string;
  options: Record<string, string>;
  sku: string;
  cost: string;
  price: string;
  override: boolean;
  compareAt: string;
  stock: string;
  imageUrl: string;
  isActive: boolean;
};

let keyCounter = 0;
const newKey = () => `v${++keyCounter}`;

function toVariantState(v: ProductInput["variants"][number]): VariantState {
  return {
    key: newKey(),
    id: v.id,
    options: v.options,
    sku: v.sku ?? "",
    cost: centsToDollars(v.cjCostCents),
    price: centsToDollars(v.priceCents),
    // Without a CJ cost the price is always typed by hand; once a cost is
    // added, follow the markup unless the admin ticks "Manual price".
    override: v.cjCostCents == null ? false : v.priceOverride,
    compareAt: centsToDollars(v.compareAtPriceCents),
    stock: String(v.stock),
    imageUrl: v.imageUrl ?? "",
    isActive: v.isActive,
  };
}

export const EMPTY_PRODUCT: ProductInput = {
  title: "", slug: "", description: "", ingredients: null, howToUse: null, safetyInfo: null,
  status: "DRAFT", categoryId: null, tags: [], markup: null, seoTitle: null, seoDescription: null,
  optionNames: [], images: [],
  variants: [{ options: {}, sku: null, cjCostCents: null, priceCents: 0, priceOverride: false, compareAtPriceCents: null, stock: 0, imageUrl: null, isActive: true }],
};

export function ProductForm({
  initial,
  categories,
  defaultMarkup,
  cjProductId,
}: {
  initial: ProductInput;
  categories: { id: string; name: string }[];
  defaultMarkup: number;
  cjProductId?: string | null;
}) {
  const isNew = !initial.id;
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [description, setDescription] = useState(initial.description);
  const [ingredients, setIngredients] = useState(initial.ingredients ?? "");
  const [howToUse, setHowToUse] = useState(initial.howToUse ?? "");
  const [safetyInfo, setSafetyInfo] = useState(initial.safetyInfo ?? "");
  const [status, setStatus] = useState(initial.status);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [markup, setMarkup] = useState(initial.markup ? String(initial.markup) : "");
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription ?? "");
  const [optionNames, setOptionNames] = useState(initial.optionNames);
  const [images, setImages] = useState(initial.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })));
  const [newImage, setNewImage] = useState("");
  const [variants, setVariants] = useState(initial.variants.map(toVariantState));
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveProductAction, {});

  const markupNumber = markup.trim() ? Number(markup) : null;
  const activeMarkup = effectiveMarkup(markupNumber && markupNumber >= 1 ? markupNumber : null, defaultMarkup);

  const updateVariant = (key: string, changes: Partial<VariantState>) =>
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...changes } : v)));

  function computedPrice(v: VariantState) {
    const cost = dollarsToCents(v.cost);
    if (v.override || cost == null) return null;
    return priceFromCost(cost, activeMarkup);
  }

  function addOption() {
    if (optionNames.length >= 3) return;
    const name = ["Shade", "Size", "Style"].find((n) => !optionNames.includes(n)) ?? `Option ${optionNames.length + 1}`;
    setOptionNames([...optionNames, name]);
    setVariants((vs) => vs.map((v) => ({ ...v, options: { ...v.options, [name]: v.options[name] ?? "" } })));
  }

  function renameOption(index: number, next: string) {
    const old = optionNames[index];
    setOptionNames(optionNames.map((n, i) => (i === index ? next : n)));
    setVariants((vs) =>
      vs.map((v) => {
        const options = { ...v.options, [next]: v.options[old] ?? "" };
        if (next !== old) delete options[old];
        return { ...v, options };
      }),
    );
  }

  function removeOption(index: number) {
    const name = optionNames[index];
    setOptionNames(optionNames.filter((_, i) => i !== index));
    setVariants((vs) => vs.map((v) => {
      const options = { ...v.options };
      delete options[name];
      return { ...v, options };
    }));
  }

  function addVariant() {
    const last = variants[variants.length - 1];
    setVariants([
      ...variants,
      {
        ...(last ?? toVariantState(EMPTY_PRODUCT.variants[0])),
        key: newKey(),
        id: undefined,
        override: false,
        options: Object.fromEntries(optionNames.map((n) => [n, ""])),
        sku: "",
        imageUrl: "",
      },
    ]);
  }

  function moveImage(i: number, dir: -1 | 1) {
    const next = [...images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setImages(next);
  }

  // Turns the form into the data the server expects, checking amounts first.
  function buildPayload(): ProductInput | string {
    const out: ProductInput["variants"] = [];
    for (const [i, v] of variants.entries()) {
      const label = optionNames.length ? optionNames.map((n) => v.options[n] || "?").join(" / ") : `Variant ${i + 1}`;
      const cost = v.cost.trim() ? dollarsToCents(v.cost) : null;
      if (v.cost.trim() && cost == null) return `${label}: the CJ cost isn't a valid amount`;
      const auto = computedPrice(v);
      const price = auto ?? dollarsToCents(v.price);
      if (price == null || price <= 0) return `${label}: enter a price`;
      const compareAt = v.compareAt.trim() ? dollarsToCents(v.compareAt) : null;
      if (v.compareAt.trim() && compareAt == null) return `${label}: the compare-at price isn't a valid amount`;
      const stock = Number(v.stock);
      if (!Number.isInteger(stock) || stock < 0) return `${label}: stock must be a whole number`;
      out.push({
        id: v.id, options: v.options, sku: v.sku || null, cjCostCents: cost, priceCents: price,
        priceOverride: auto == null, compareAtPriceCents: compareAt, stock, imageUrl: v.imageUrl.trim() || null, isActive: v.isActive,
      });
    }
    if (markup.trim() && (!markupNumber || markupNumber < 1 || markupNumber > 20)) return "Markup must be between 1 and 20";
    return {
      id: initial.id, title, slug: slug || slugify(title), description,
      ingredients: ingredients || null, howToUse: howToUse || null, safetyInfo: safetyInfo || null,
      status, categoryId: categoryId || null,
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      markup: markupNumber, seoTitle: seoTitle || null, seoDescription: seoDescription || null,
      optionNames, images: images.map((i) => ({ url: i.url, alt: i.alt || null })), variants: out,
    };
  }

  const error = clientError ?? state.error;

  return (
    <form
      action={(fd) => {
        const payload = buildPayload();
        if (typeof payload === "string") {
          setClientError(payload);
          return;
        }
        setClientError(null);
        fd.set("payload", JSON.stringify(payload));
        return formAction(fd);
      }}
      className="space-y-5"
    >
      <div className="sticky top-14 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Link href="/admin/products" className="text-sm text-stone-500 hover:underline">← Products</Link>
        <h1 className="truncate text-xl">{title || "New product"}</h1>
        <div className="ml-auto flex items-center gap-3">
          {state.saved && !pending && !error && <span className="text-sm text-juniper">Saved</span>}
          {!isNew && status === "ACTIVE" && (
            <Link href={`/products/${initial.slug}`} target="_blank" className="btn-secondary">View in shop</Link>
          )}
          <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save"}</button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card space-y-4 p-5">
            <div>
              <label className="label" htmlFor="title">Title</label>
              <input id="title" className="input" value={title} maxLength={200} required
                onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
            </div>
            <div>
              <label className="label" htmlFor="description">Description</label>
              <textarea id="description" className="input min-h-36" value={description} onChange={(e) => setDescription(e.target.value)} />
              <p className="mt-1 text-xs text-stone-500">Leave an empty line between paragraphs.</p>
            </div>
            <div>
              <label className="label" htmlFor="ingredients">Ingredients</label>
              <textarea id="ingredients" className="input min-h-20" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="howToUse">How to use</label>
              <textarea id="howToUse" className="input min-h-20" value={howToUse} onChange={(e) => setHowToUse(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="safety">Safety information</label>
              <textarea id="safety" className="input min-h-20" value={safetyInfo} onChange={(e) => setSafetyInfo(e.target.value)} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-1 text-lg">Images</h2>
            <p className="mb-4 text-xs text-stone-500">The first image is the main one. Paste image links (https://…).</p>
            {images.length > 0 && (
              <ul className="mb-4 space-y-2">
                {images.map((img, i) => (
                  <li key={`${img.url}-${i}`} className="flex items-center gap-3 rounded-lg border border-stone-200 p-2">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded bg-stone-50">
                      <SmartImage src={img.url} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-stone-500">{img.url}</p>
                      <input className="input mt-1 py-1 text-xs" placeholder="Describe the image (for accessibility)" value={img.alt}
                        onChange={(e) => setImages(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
                    </div>
                    <div className="flex flex-col">
                      <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)} className="p-1 disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
                      <button type="button" disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} className="p-1 disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
                    </div>
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="p-1 text-stone-400 hover:text-red-700" aria-label="Remove image">
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input className="input" placeholder="https://… image link" value={newImage} onChange={(e) => setNewImage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newImage.trim()) { setImages([...images, { url: newImage.trim(), alt: "" }]); setNewImage(""); } } }} />
              <button type="button" className="btn-secondary shrink-0" disabled={!newImage.trim()}
                onClick={() => { setImages([...images, { url: newImage.trim(), alt: "" }]); setNewImage(""); }}>
                <ImagePlus className="size-4" /> Add
              </button>
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-lg">Variants &amp; pricing</h2>
              <span className="text-xs text-stone-500">
                Markup in use: <b>{activeMarkup}×</b> {markupNumber ? "(this product)" : "(store default)"}
              </span>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-stone-600">Options:</span>
              {optionNames.map((name, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full border border-stone-300 bg-white py-0.5 pr-1 pl-3">
                  <input className="w-20 bg-transparent text-sm outline-none" value={name} aria-label="Option name"
                    onChange={(e) => renameOption(i, e.target.value)} />
                  <button type="button" onClick={() => removeOption(i)} className="p-0.5 text-stone-400 hover:text-red-700" aria-label={`Remove option ${name}`}>
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
              {optionNames.length < 3 && (
                <button type="button" onClick={addOption} className="text-sm text-juniper hover:underline">+ Add option (e.g. Shade, Size)</button>
              )}
            </div>

            <div className="-mx-5 overflow-x-auto px-5">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs text-stone-500">
                  <tr>
                    {optionNames.map((n) => <th key={n} className="py-2 pr-2 font-medium">{n || "?"}</th>)}
                    <th className="py-2 pr-2 font-medium">CJ cost ($)</th>
                    <th className="py-2 pr-2 font-medium">Price ($)</th>
                    <th className="py-2 pr-2 font-medium">Manual price</th>
                    <th className="py-2 pr-2 font-medium">Compare-at ($)</th>
                    <th className="py-2 pr-2 font-medium">Stock</th>
                    <th className="py-2 pr-2 font-medium">SKU</th>
                    <th className="py-2 pr-2 font-medium">Profit/unit</th>
                    <th className="py-2 pr-2 font-medium">Shown</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 align-top">
                  {variants.map((v) => {
                    const auto = computedPrice(v);
                    const cost = dollarsToCents(v.cost);
                    const price = auto ?? dollarsToCents(v.price);
                    const profit = price != null && cost != null ? price - cost : null;
                    return (
                      <tr key={v.key}>
                        {optionNames.map((n) => (
                          <td key={n} className="py-2 pr-2">
                            <input className="input w-28 py-1" value={v.options[n] ?? ""} aria-label={n}
                              onChange={(e) => updateVariant(v.key, { options: { ...v.options, [n]: e.target.value } })} />
                          </td>
                        ))}
                        <td className="py-2 pr-2">
                          <input className="input w-24 py-1" inputMode="decimal" value={v.cost} placeholder="—" aria-label="CJ cost"
                            onChange={(e) => updateVariant(v.key, { cost: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <input className="input w-24 py-1 read-only:bg-stone-50 read-only:text-stone-500" inputMode="decimal" aria-label="Price"
                            value={auto != null ? centsToDollars(auto) : v.price} readOnly={auto != null}
                            onChange={(e) => updateVariant(v.key, { price: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <label className="flex items-center gap-1.5 py-1.5 text-xs">
                            <input type="checkbox" checked={v.override || cost == null} disabled={cost == null}
                              onChange={(e) => updateVariant(v.key, {
                                override: e.target.checked,
                                price: e.target.checked && auto != null ? centsToDollars(auto) : v.price,
                              })} />
                            {cost == null ? "(no cost)" : v.override ? "Yes" : "No"}
                          </label>
                        </td>
                        <td className="py-2 pr-2">
                          <input className="input w-24 py-1" inputMode="decimal" value={v.compareAt} placeholder="—" aria-label="Compare-at price"
                            onChange={(e) => updateVariant(v.key, { compareAt: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <input className="input w-20 py-1" inputMode="numeric" value={v.stock} aria-label="Stock"
                            onChange={(e) => updateVariant(v.key, { stock: e.target.value })} />
                        </td>
                        <td className="py-2 pr-2">
                          <input className="input w-28 py-1" value={v.sku} aria-label="SKU" onChange={(e) => updateVariant(v.key, { sku: e.target.value })} />
                        </td>
                        <td className={`py-3 pr-2 whitespace-nowrap ${profit != null && profit < 0 ? "text-red-700" : "text-stone-600"}`}>
                          {profit == null ? "—" : formatMoney(profit)}
                        </td>
                        <td className="py-3 pr-2">
                          <input type="checkbox" checked={v.isActive} aria-label="Shown in shop" onChange={(e) => updateVariant(v.key, { isActive: e.target.checked })} />
                        </td>
                        <td className="py-2">
                          <button type="button" disabled={variants.length === 1} onClick={() => setVariants(variants.filter((x) => x.key !== v.key))}
                            className="p-1.5 text-stone-400 hover:text-red-700 disabled:opacity-30" aria-label="Remove variant">
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addVariant} disabled={optionNames.length === 0}
              className="mt-3 inline-flex items-center gap-1 text-sm text-juniper hover:underline disabled:text-stone-400 disabled:no-underline">
              <Plus className="size-4" /> Add variant
            </button>
            {optionNames.length === 0 && <span className="ml-2 text-xs text-stone-500">(add an option first)</span>}
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              When a CJ cost is entered, the price is worked out automatically: <b>CJ cost × markup</b>, rounded up to .99.
              Tick “Manual price” to type your own price instead. Profit/unit doesn’t include shipping or payment fees.
            </p>
          </section>
        </div>

        <div className="space-y-5">
          <section className="card space-y-3 p-5">
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value as ProductInput["status"])}>
              <option value="ACTIVE">Active — visible in the shop</option>
              <option value="DRAFT">Draft — hidden</option>
              <option value="ARCHIVED">Archived — hidden</option>
            </select>
            {cjProductId && <p className="text-xs text-stone-500">CJ product ID: {cjProductId}</p>}
          </section>

          <section className="card space-y-4 p-5">
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="tags">Tags</label>
              <input id="tags" className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="serum, glow" />
              <p className="mt-1 text-xs text-stone-500">Separate with commas. Shoppers can search by tag.</p>
            </div>
            <div>
              <label className="label" htmlFor="markup">Markup (×)</label>
              <input id="markup" className="input" inputMode="decimal" value={markup} onChange={(e) => setMarkup(e.target.value)} placeholder={`Store default: ${defaultMarkup}×`} />
              <p className="mt-1 text-xs text-stone-500">Leave empty to use the store default.</p>
            </div>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="text-lg">Search engine listing</h2>
            <div>
              <label className="label" htmlFor="slug">URL handle</label>
              <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 pl-3 text-sm text-stone-500 focus-within:border-juniper">
                /products/
                <input id="slug" className="w-full rounded-r-lg bg-white px-2 py-2 text-ink outline-none" value={slug}
                  onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
              </div>
              {!isNew && slug !== initial.slug && (
                <p className="mt-1 text-xs text-amber-700">Changing the handle breaks old links to this product.</p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="seoTitle">Page title <span className="font-normal text-stone-400">({seoTitle.length}/70)</span></label>
              <input id="seoTitle" className="input" maxLength={70} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title} />
            </div>
            <div>
              <label className="label" htmlFor="seoDescription">Meta description <span className="font-normal text-stone-400">({seoDescription.length}/160)</span></label>
              <textarea id="seoDescription" className="input min-h-20" maxLength={160} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={description.slice(0, 160)} />
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
