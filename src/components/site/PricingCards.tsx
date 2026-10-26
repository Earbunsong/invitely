import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { PLAN_LIST } from "@/lib/plans";

const HEADERS: Record<string, string> = {
  "wedding-premium": "linear-gradient(135deg,#e07a5f,#c9664b)",
  "wedding-standard": "linear-gradient(135deg,#c9a26b,#a8834f)",
  "birthday-premium": "linear-gradient(135deg,#ff7aa2,#b28dff)",
  housewarming: "linear-gradient(135deg,#7fa070,#4a7a50)",
};

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {PLAN_LIST.map((p, i) => (
        <Reveal key={p.id} delay={(i % 2) * 0.1}>
          <div className={`flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg ${p.featured ? "ring-2 ring-coral" : "ring-1 ring-black/5"}`}>
            <div className="relative p-6 text-white" style={{ background: HEADERS[p.id] }}>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
                {p.badges?.map((b) => (
                  <span key={b} className="rounded-full bg-white/25 px-2.5 py-1">
                    {b}
                  </span>
                ))}
                <span className="rounded-full bg-white/15 px-2.5 py-1">
                  {p.emoji} {p.name}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/90">{p.subtitle}</p>
              <p className="mt-3 font-heading text-5xl font-extrabold">
                ${p.price.toFixed(2)}
                {p.compareAt && <span className="ml-2 align-middle text-xl font-semibold text-white/70 line-through">${p.compareAt.toFixed(2)}</span>}
              </p>
              <p className="mt-1 text-sm text-white/90">One invitation · Pay once</p>
            </div>
            <ul className="flex-1 space-y-2 p-6">
              {p.highlights.map((h) => (
                <li key={h.text} className={`flex items-start gap-3 rounded-xl px-3 py-2 text-sm ${h.premium ? "bg-cream" : ""}`}>
                  <span className="w-5 text-center">{h.icon}</span>
                  <span className="flex-1">{h.text}</span>
                  <span className="text-sage">✓</span>
                </li>
              ))}
            </ul>
            <div className="p-6 pt-0">
              <Link href={`/create?plan=${p.id}`} className={`block rounded-full py-3.5 text-center font-heading font-bold text-white ${p.featured ? "btn-coral" : "btn-sage"}`}>
                {p.cta}
              </Link>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
