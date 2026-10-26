import Link from "next/link";
import { site } from "@/config/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-forest px-4 py-14 text-center text-white/80">
      <div className="flex justify-center">
        <Logo light />
      </div>
      <p className="mt-3 font-hand text-xl text-white/90">Made with love for your special day ♥</p>
      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        <Link href="/#pricing">Pricing</Link>
        <Link href="/#faq">FAQ</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <a href={site.telegram} target="_blank" rel="noreferrer">
          Contact
        </a>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {[
          { href: site.facebook, label: "Facebook", icon: "f" },
          { href: site.instagram, label: "Instagram", icon: "◎" },
          { href: site.telegram, label: "Telegram", icon: "➤" },
        ].map((s) => (
          <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold transition hover:bg-white/20">
            {s.icon}
          </a>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-4xl border-t border-white/10 pt-6 text-xs">
        <p className="mb-2">We accept</p>
        <span className="inline-block rounded-md bg-[#005d7a] px-3 py-1.5 font-bold tracking-wider text-white">ABA PAY · KHQR · CARDS</span>
        <p className="mt-6">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
