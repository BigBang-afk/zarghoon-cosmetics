import type { Metadata } from "next";
import { Inter, Marcellus } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const marcellus = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Zarghoon Cosmetics", template: "%s | Zarghoon Cosmetics" },
  description: "Thoughtfully chosen skincare and beauty, shipped worldwide.",
  openGraph: { siteName: "Zarghoon Cosmetics", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${marcellus.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
