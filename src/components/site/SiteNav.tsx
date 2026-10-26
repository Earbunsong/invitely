"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#templates", label: "Templates" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-white/85 shadow-sm backdrop-blur" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label={site.name}>
          <Logo />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-sage-soft hover:text-sage-dark">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium text-ink/80 hover:bg-sage-soft">
            Sign in
          </Link>
          <Link href="/#pricing" className="btn-coral ml-2 rounded-full px-4 py-2 font-heading text-sm font-semibold text-white">
            Start Creating
          </Link>
        </div>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
        </button>
      </nav>
      {open && (
        <div className="border-t bg-white px-4 pb-4 md:hidden">
          {[...LINKS, { href: "/login", label: "Sign in" }].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b py-3 text-sm font-medium">
              {l.label}
            </a>
          ))}
          <Link href="/#pricing" onClick={() => setOpen(false)} className="btn-coral mt-3 block rounded-full py-3 text-center font-heading font-semibold text-white">
            Start Creating
          </Link>
        </div>
      )}
    </header>
  );
}
