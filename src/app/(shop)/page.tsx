import Link from "next/link";
import { PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
import { getActiveBanners, getAllProductCards, getCategories } from "@/lib/catalog";
import { SmartImage } from "@/components/smart-image";
import { ProductGrid } from "@/components/shop/product-card";

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([getActiveBanners(), getCategories(), getAllProductCards()]);
  const banner = banners[0] ?? {
    title: "Skincare with a quiet glow",
    subtitle: "Thoughtfully chosen serums, creams and colour, shipped to your door worldwide.",
    imageUrl: "/samples/hero.svg",
    linkUrl: "/shop",
    buttonText: "Shop now",
  };

  return (
    <>
      <section className="relative overflow-hidden bg-juniper-light">
        <div className="absolute inset-0">
          <SmartImage src={banner.imageUrl} alt="" fill priority sizes="100vw" className="object-cover object-right" />
        </div>
        <div className="relative mx-auto flex min-h-[460px] max-w-7xl items-center px-4 py-16 sm:min-h-[560px] sm:px-6">
          <div className="max-w-md rounded-2xl bg-ground/85 p-6 backdrop-blur-sm sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <p className="text-xs tracking-[0.3em] text-saffron uppercase">New season</p>
            <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-6xl">{banner.title}</h1>
            {banner.subtitle && <p className="mt-4 text-stone-600 sm:text-lg">{banner.subtitle}</p>}
            {banner.linkUrl && (
              <Link href={banner.linkUrl} className="btn-primary mt-8 px-6 py-3 text-base">
                {banner.buttonText || "Shop now"}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-sm sm:px-6 lg:grid-cols-4">
          {[
            { icon: Truck, text: "Worldwide shipping" },
            { icon: PackageCheck, text: "Tracked delivery" },
            { icon: ShieldCheck, text: "Secure checkout" },
            { icon: Star, text: "Real customer reviews only" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <Icon className="size-5 shrink-0 text-juniper" /> {text}
            </li>
          ))}
        </ul>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
          <h2 className="text-3xl">Shop by category</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-white">
                {c.imageUrl && (
                  <SmartImage src={c.imageUrl} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                )}
                <span className="absolute inset-x-3 bottom-3 rounded-lg bg-white/90 px-3 py-2 text-center font-heading text-lg">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl">New arrivals</h2>
          <Link href="/shop" className="text-sm font-medium text-juniper hover:underline">View all</Link>
        </div>
        <div className="mt-8">
          {products.length ? (
            <ProductGrid products={products.slice(0, 8)} />
          ) : (
            <p className="text-stone-500">Products are coming soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
