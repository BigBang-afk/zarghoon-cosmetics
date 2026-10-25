import Link from "next/link";
import { getCategories } from "@/lib/catalog";

export async function ShopFooter() {
  const categories = await getCategories();
  return (
    <footer className="mt-24 bg-ink text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-heading text-2xl text-white">Zarghoon</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Thoughtfully chosen skincare and beauty, shipped worldwide with tracking.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-white">Shop all</Link></li>
            {categories.map((c) => (
              <li key={c.id}><Link href={`/category/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Help</p>
          <p className="text-sm text-stone-400">Contact, FAQ, shipping and returns pages arrive in Stage 6.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-stone-400">© Zarghoon Cosmetics</div>
    </footer>
  );
}
