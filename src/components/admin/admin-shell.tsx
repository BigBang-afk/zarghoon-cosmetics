"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity, Boxes, Home, Megaphone, Menu, PackageSearch, Percent, Search,
  Settings, ShoppingBag, Star, UserCog, Users, X,
} from "lucide-react";
import type { CurrentAdmin } from "@/lib/admin-auth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  stage?: number; // not built yet: shown greyed out with the stage it arrives in
  ownerOnly?: boolean;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/admin", icon: Home },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, stage: 3 },
  { label: "Products", href: "/admin/products", icon: Boxes },
  { label: "CJ Import", href: "/admin/cj", icon: PackageSearch, stage: 4 },
  { label: "Customers", href: "/admin/customers", icon: Users, stage: 6 },
  { label: "Discounts", href: "/admin/discounts", icon: Percent, stage: 6 },
  { label: "Content", href: "/admin/content", icon: Megaphone, stage: 6 },
  { label: "Reviews", href: "/admin/reviews", icon: Star, stage: 6 },
];

const NAV_BOTTOM: NavItem[] = [
  { label: "Staff", href: "/admin/staff", icon: UserCog, ownerOnly: true },
  { label: "Activity log", href: "/admin/activity", icon: Activity },
  { label: "Settings", href: "/admin/settings", icon: Settings, ownerOnly: true },
];

export function AdminShell({
  admin,
  logoutAction,
  children,
}: {
  admin: CurrentAdmin;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const renderItem = (item: NavItem) => {
    if (item.ownerOnly && admin.role !== "OWNER") return null;
    const Icon = item.icon;
    if (item.stage) {
      return (
        <li key={item.href}>
          <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-400" title={`Arrives in Stage ${item.stage}`}>
            <Icon className="size-4" />
            {item.label}
            <span className="ml-auto rounded bg-stone-100 px-1.5 text-[10px] text-stone-500">Stage {item.stage}</span>
          </span>
        </li>
      );
    }
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
            isActive(item.href) ? "bg-juniper-light text-juniper" : "text-ink hover:bg-stone-100"
          }`}
        >
          <Icon className="size-4" />
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Sidebar: always visible on large screens, a slide-in drawer on phones */}
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-stone-200 px-4">
          <Link href="/admin" className="font-heading text-xl text-juniper">Zarghoon</Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
          <ul className="space-y-0.5">{NAV.map(renderItem)}</ul>
          <ul className="mt-6 space-y-0.5 border-t border-stone-200 pt-3">{NAV_BOTTOM.map(renderItem)}</ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-stone-200 bg-white px-4">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <form action="/admin/products" className="relative max-w-md flex-1" role="search">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
            <input type="search" name="q" placeholder="Search products" aria-label="Search products" className="input bg-stone-50 pl-9" />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/admin/account" className="hidden text-right sm:block">
              <span className="block text-sm font-medium">{admin.name}</span>
              <span className="block text-xs text-stone-500">{admin.role === "OWNER" ? "Owner" : "Staff"}</span>
            </Link>
            <form action={logoutAction}>
              <button className="btn-secondary px-3 py-1.5">Log out</button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
