import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { getCategories, getStoreSettings } from "@/lib/catalog";
import { CurrencySwitcher } from "./currency";
import { MobileMenu } from "./mobile-menu";

export async function ShopHeader() {
  const [categories, settings] = await Promise.all([getCategories(), getStoreSettings()]);
  const links = [{ href: "/shop", label: "Shop all" }, ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name }))];

  return (
    <>
      {settings.announcementText && (
        <div className="bg-juniper px-4 py-2 text-center text-xs tracking-wide text-white sm:text-sm">
          {settings.announcementLink ? (
            <Link href={settings.announcementLink} className="underline-offset-2 hover:underline">{settings.announcementText}</Link>
          ) : (
            settings.announcementText
          )}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-ground/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <MobileMenu links={links} />
          <Link href="/" className="font-heading text-2xl tracking-wide text-juniper">Zarghoon</Link>
          <nav className="ml-6 hidden gap-6 text-sm md:flex">
            {links.slice(0, 6).map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-juniper">{l.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/shop" aria-label="Search products" className="p-1 hover:text-juniper">
              <Search className="size-5" />
            </Link>
            <CurrencySwitcher />
            <span className="p-1 text-stone-400" title="The cart arrives in Stage 3" aria-label="Cart (coming soon)">
              <ShoppingBag className="size-5" />
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
