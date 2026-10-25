import { getCurrencies } from "@/lib/catalog";
import { CurrencyProvider } from "@/components/shop/currency";
import { ShopHeader } from "@/components/shop/header";
import { ShopFooter } from "@/components/shop/footer";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const currencies = await getCurrencies();
  return (
    <CurrencyProvider currencies={currencies}>
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <ShopFooter />
    </CurrencyProvider>
  );
}
