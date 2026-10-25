"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Truck } from "lucide-react";
import type { ProductDetail } from "@/lib/catalog";
import { SmartImage } from "@/components/smart-image";
import { Price } from "@/components/shop/currency";

type Variant = ProductDetail["variants"][number];

function optionNames(variants: Variant[]) {
  const names: string[] = [];
  for (const v of variants) for (const k of Object.keys(v.options)) if (!names.includes(k)) names.push(k);
  return names;
}

export function ProductView({
  product,
  countries,
}: {
  product: ProductDetail;
  countries: { code: string; name: string }[];
}) {
  const names = useMemo(() => optionNames(product.variants), [product.variants]);
  const firstAvailable = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(firstAvailable.options);
  const [quantity, setQuantity] = useState(1);
  const [country, setCountry] = useState("");

  const variant =
    product.variants.find((v) => names.every((n) => v.options[n] === selected[n])) ?? null;

  const gallery = product.images.length ? product.images : [{ id: "none", url: "", alt: product.title }];
  const [imageIndex, setImageIndex] = useState(0);
  const [variantImage, setVariantImage] = useState<string | null>(firstAvailable.imageUrl);
  const mainImage = variantImage ?? gallery[imageIndex]?.url;

  function choose(name: string, value: string) {
    const next = { ...selected, [name]: value };
    setSelected(next);
    const match = product.variants.find((v) => names.every((n) => v.options[n] === next[n]));
    setVariantImage(match?.imageUrl ?? null);
    setQuantity(1);
  }

  const maxQty = variant ? Math.min(10, variant.stock) : 0;
  const shipsTo = countries.find((c) => c.code === country);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
          {mainImage ? (
            <SmartImage src={mainImage} alt={product.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400">No image</div>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {gallery.map((img, i) => (
              <button
                key={img.id}
                onClick={() => { setImageIndex(i); setVariantImage(null); }}
                className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
                  !variantImage && i === imageIndex ? "border-juniper" : "border-transparent"
                }`}
                aria-label={`Show image ${i + 1}`}
              >
                <SmartImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Buy box */}
      <div>
        {product.category && <p className="text-xs tracking-[0.2em] text-stone-500 uppercase">{product.category.name}</p>}
        <h1 className="mt-2 text-3xl sm:text-4xl">{product.title}</h1>
        <div className="mt-4 text-2xl font-semibold">
          {variant ? (
            <Price cents={variant.priceCents} compareAtCents={variant.compareAtPriceCents} />
          ) : (
            <span className="text-base text-stone-500">This combination isn’t available</span>
          )}
        </div>

        {names.map((name) => {
          const values = [...new Set(product.variants.map((v) => v.options[name]).filter(Boolean))];
          if (values.length < 2 && names.length === 1 && product.variants.length === 1) {
            return (
              <p key={name} className="mt-6 text-sm"><span className="text-stone-500">{name}:</span> {values[0]}</p>
            );
          }
          return (
            <fieldset key={name} className="mt-6">
              <legend className="mb-2 text-sm">
                <span className="text-stone-500">{name}:</span> <span className="font-medium">{selected[name]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const match = product.variants.find((v) =>
                    names.every((n) => (n === name ? v.options[n] === value : v.options[n] === selected[n])),
                  );
                  const soldOut = !match || match.stock <= 0;
                  const active = selected[name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => choose(name, value)}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active ? "border-juniper bg-juniper text-white" : "border-stone-300 bg-white hover:border-juniper"
                      } ${soldOut ? "line-through opacity-50" : ""}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <p className="mt-6 text-sm">
          {!variant || variant.stock <= 0 ? (
            <span className="text-red-700">Sold out</span>
          ) : variant.stock < 10 ? (
            <span className="text-saffron">Only {variant.stock} left</span>
          ) : (
            <span className="text-juniper">In stock</span>
          )}
        </p>

        <div className="mt-4 flex gap-3">
          <div className="flex items-center rounded-lg border border-stone-300 bg-white">
            <button type="button" className="p-3 disabled:opacity-40" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center" aria-live="polite">{quantity}</span>
            <button type="button" className="p-3 disabled:opacity-40" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} aria-label="Increase quantity">
              <Plus className="size-4" />
            </button>
          </div>
          <button type="button" disabled className="btn-primary flex-1 py-3 text-base" title="The cart arrives in Stage 3">
            Add to cart (Stage 3)
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 text-sm">
          <p className="flex items-center gap-2 font-medium"><Truck className="size-4 text-juniper" /> Delivery estimate</p>
          <select className="input mt-3" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Your country">
            <option value="">Choose your country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          {country && (
            <p className="mt-3 text-stone-600">
              {shipsTo
                ? `We ship to ${shipsTo.name}. Orders usually arrive in 7–15 business days with tracking. The exact shipping cost is shown at checkout.`
                : "Sorry, we don’t ship to this country yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
