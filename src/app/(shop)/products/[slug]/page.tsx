import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPrebuiltProductSlugs, getProductBySlug, getShippingCountries, type ProductDetail } from "@/lib/catalog";
import { Stars } from "@/components/shop/stars";
import { siteUrl } from "@/lib/site";
import { ProductView } from "./product-view";

export async function generateStaticParams() {
  return getPrebuiltProductSlugs();
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  const description = (product.seoDescription || product.description).slice(0, 160);
  return {
    title: product.seoTitle || product.title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.seoTitle || product.title,
      description,
      type: "website",
      images: product.images.slice(0, 1).map((i) => ({ url: i.url, alt: i.alt })),
    },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}

async function ProductContent({ params }: { params: PageProps<"/products/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, countries] = await Promise.all([getProductBySlug(slug), getShippingCountries()]);
  if (!product) notFound();

  const rating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : null;

  return (
    <>
      <nav className="mb-6 text-sm text-stone-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        {product.category ? (
          <Link href={`/category/${product.category.slug}`} className="hover:underline">{product.category.name}</Link>
        ) : (
          <Link href="/shop" className="hover:underline">Shop</Link>
        )}
      </nav>

      <ProductView product={product} countries={countries.map((c) => ({ code: c.code, name: c.name }))} />

      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-2">
          <Section title="Description" open>
            <Paragraphs text={product.description} />
          </Section>
          {product.ingredients && <Section title="Ingredients"><Paragraphs text={product.ingredients} /></Section>}
          {product.howToUse && <Section title="How to use"><Paragraphs text={product.howToUse} /></Section>}
          {product.safetyInfo && <Section title="Safety"><Paragraphs text={product.safetyInfo} /></Section>}
        </div>
        <Reviews reviews={product.reviews} rating={rating} />
      </div>

      <script
        type="application/ld+json"
        // Product details for Google search results (prices in USD).
        dangerouslySetInnerHTML={{ __html: jsonLd(product, rating) }}
      />
    </>
  );
}

function Section({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group rounded-xl border border-stone-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-heading text-lg">
        {title}
        <span className="text-stone-400 transition group-open:rotate-45">+</span>
      </summary>
      <div className="px-4 pb-4 text-sm leading-relaxed text-stone-700">{children}</div>
    </details>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}

function Reviews({ reviews, rating }: { reviews: ProductDetail["reviews"]; rating: number | null }) {
  return (
    <section aria-labelledby="reviews">
      <h2 id="reviews" className="text-2xl">Customer reviews</h2>
      {rating != null ? (
        <p className="mt-2 flex items-center gap-2 text-sm">
          <Stars rating={rating} /> {rating.toFixed(1)} out of 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
      ) : (
        <p className="mt-2 text-sm text-stone-500">No reviews yet.</p>
      )}
      <p className="mt-1 text-xs text-stone-500">Only customers who bought this product can leave a review.</p>
      <ul className="mt-6 space-y-6">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-stone-200 pb-6">
            <div className="flex items-center gap-2">
              <Stars rating={r.rating} size="size-3.5" />
              {r.title && <span className="font-medium">{r.title}</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{r.body}</p>
            <p className="mt-2 text-xs text-stone-500">
              {r.authorName}
              {r.orderId && " · Verified buyer"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function jsonLd(product: ProductDetail, rating: number | null) {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.slice(0, 500),
    image: product.images.map((i) => (i.url.startsWith("http") ? i.url : base + i.url)),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      name: v.title,
      price: (v.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
    ...(rating != null && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: product.reviews.length },
    }),
  };
  // Escape "<" so text from the database can never close the <script> tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-stone-200" />
      <div className="space-y-4">
        <div className="h-10 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="h-6 w-1/4 animate-pulse rounded bg-stone-200" />
        <div className="h-32 animate-pulse rounded bg-stone-200" />
      </div>
    </div>
  );
}
