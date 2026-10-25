"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-1">
        <Menu className="size-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <nav className="relative flex w-72 max-w-[85%] flex-col bg-ground p-5 shadow-xl">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="mb-6 self-end p-1">
              <X className="size-6" />
            </button>
            <ul className="space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-lg font-heading hover:bg-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
