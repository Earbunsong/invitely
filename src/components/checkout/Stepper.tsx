import Link from "next/link";
import { Logo } from "@/components/site/Logo";

const STEPS = ["Your Checkout Info", "Payment", "Access Code"];

export function CheckoutShell({ step, children }: { step: 1 | 2 | 3; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-blush pb-16">
      <header className="flex h-16 items-center gap-3 border-b border-black/5 bg-white/70 px-4 backdrop-blur">
        <Link href="/#pricing" aria-label="Back" className="text-xl text-ink/70">
          ←
        </Link>
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <ol className="mx-auto mt-6 flex max-w-md items-start px-4">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <li key={label} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <span className={`h-px flex-1 ${i === 0 ? "opacity-0" : done || active ? "bg-sage" : "bg-black/10"}`} />
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-sage text-white ring-4 ring-sage/20" : done ? "bg-sage text-white" : "border-2 border-black/15 text-black/40"}`}
                >
                  {done ? "✓" : n}
                </span>
                <span className={`h-px flex-1 ${i === STEPS.length - 1 ? "opacity-0" : done ? "bg-sage" : "bg-black/10"}`} />
              </div>
              <span className={`mt-1 text-[11px] ${active ? "font-semibold text-ink" : "text-muted"}`}>{label}</span>
            </li>
          );
        })}
      </ol>
      <div className="mx-auto mt-6 max-w-md space-y-4 px-4">{children}</div>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      {title && <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sage">{title}</p>}
      {children}
    </section>
  );
}
