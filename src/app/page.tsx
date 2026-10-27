import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { PricingCards } from "@/components/site/PricingCards";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { site } from "@/config/site";
import { EVENT_LABELS } from "@/lib/plans";
import { TEMPLATES } from "@/templates";

const DEMO_BY_TEMPLATE: Record<string, string> = {
  "garden-gate": "demo",
  "royal-gold": "demo-royal",
  "birthday-pop": "demo-birthday",
  "princess-party": "demo-princess",
  "home-sweet": "demo-house",
};

const STEPS = [
  { n: 1, title: "Pick your style", text: "Choose a template for your wedding, engagement, birthday or house warming.", bg: "bg-blush", icon: "🎨" },
  { n: 2, title: "Make it yours", text: "Add names, date, venue, photos, music and program — in Khmer and English. No design skills needed.", bg: "bg-sage-soft", icon: "✍️" },
  { n: 3, title: "Share instantly", text: "Send one link on Telegram, Messenger or WhatsApp — or a personal link for every guest.", bg: "bg-[#efeafb]", icon: "📲" },
];

const FAQ = [
  { q: "Do I only pay once?", a: "Yes. One payment per invitation. Unlimited sharing and edits until your event day. No monthly fees." },
  { q: "How do I pay?", a: "We use ABA PayWay: pay with ABA Mobile, any KHQR banking app, or Visa/Mastercard." },
  { q: "Can I edit after sharing?", a: "Yes. Change the venue or time any time — everyone with the link sees the latest version." },
  { q: "Does it work on every phone?", a: "Every invitation is mobile-first and works on iPhone, Android, tablets and desktops. Guests don't need to install anything." },
  { q: "How do I sign in later?", a: "After payment you get an access code. Sign in with your phone number and that code to keep editing." },
];

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-blush via-[#fdf3ef] to-white px-4 pb-20 pt-10">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {["left-[8%] top-24", "right-[10%] top-40", "left-[15%] bottom-40", "right-[6%] bottom-24"].map((pos, i) => (
              <span key={pos} className={`animate-float absolute text-2xl text-coral/40 ${pos}`} style={{ animationDelay: `${i * 1.3}s` }}>
                ♥
              </span>
            ))}
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-sage shadow-sm">
                  <span className="text-amber-400">★★★★★</span> Trusted by couples across Cambodia
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 font-hand text-2xl text-sage">Create your e-invitation in minutes!</p>
                <h1 className="mt-2 font-heading text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
                  Beautiful E‑Invitations, <span className="text-coral">Made Simple</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mx-auto mt-5 max-w-xl text-lg text-muted lg:mx-0">
                  One link that works on every phone. Animated, bilingual Khmer & English invitations for weddings, engagements, birthdays and house warmings.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href={`/i/${site.demoSlug}`} target="_blank" className="rounded-full border-2 border-sage px-8 py-3.5 font-heading font-semibold text-sage transition hover:bg-sage-soft">
                    Open Live Demo ↗
                  </Link>
                  <a href="#pricing" className="btn-coral rounded-full px-8 py-3.5 font-heading font-bold text-white">
                    Create Invitation Now 👉
                  </a>
                </div>
                <Link href="/login" className="mt-5 inline-block rounded-full bg-white px-4 py-2 text-sm text-muted shadow-sm">
                  🔒 Already have an invitation? <span className="font-semibold text-sage">Sign in to keep editing →</span>
                </Link>
              </Reveal>
            </div>
            <PhoneMockup src={`/i/${site.demoSlug}`} />
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="scroll-mt-20 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <p className="font-hand text-2xl text-coral">Pick your favourite</p>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">Templates for Every Celebration</h2>
              <p className="mt-3 text-muted">Tap a template to open a live demo — exactly what your guests will see.</p>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {TEMPLATES.map((t, i) => {
                const demo = DEMO_BY_TEMPLATE[t.id];
                return (
                  <Reveal key={t.id} delay={i * 0.08}>
                    <a href={demo ? `/i/${demo}` : undefined} target="_blank" className="group block overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex aspect-[3/4] items-center justify-center text-5xl transition group-hover:scale-105" style={{ background: t.swatch }}>
                        {EVENT_LABELS[t.eventTypes[0]].emoji}
                      </div>
                      <div className="p-4">
                        <p className="font-heading font-semibold">{t.name}</p>
                        <p className="mt-1 text-xs text-muted">{t.eventTypes.map((e) => EVENT_LABELS[e].en).join(" · ")}</p>
                        {demo && <p className="mt-2 text-xs font-semibold text-sage">Open demo ↗</p>}
                      </div>
                    </a>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 bg-white px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <p className="font-hand text-2xl text-coral">Simple by design</p>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">Pick. Fill In. Share.</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.12}>
                  <div className={`h-full rounded-3xl p-8 text-center ${s.bg}`}>
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white font-heading font-bold text-coral shadow">{s.n}</span>
                    <p className="mt-5 text-4xl">{s.icon}</p>
                    <h3 className="mt-4 font-heading text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 bg-blush px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-12 text-center">
              <p className="font-hand text-2xl text-coral">Simple pricing</p>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">Pay Once. Everything Included.</h2>
            </Reveal>
            <PricingCards />
          </div>
        </section>

        {/* Help */}
        <section className="px-4 py-16">
          <Reveal className="mx-auto max-w-2xl rounded-3xl bg-sage-soft p-10 text-center">
            <p className="font-hand text-2xl text-coral">We&apos;re here for you</p>
            <h2 className="font-heading text-2xl font-bold">Need Help?</h2>
            <p className="mt-2 text-muted">Questions about your invitation? Message us on Telegram.</p>
            <a href={site.telegram} target="_blank" rel="noreferrer" className="btn-sage mt-6 inline-block rounded-full px-7 py-3 font-heading font-semibold text-white">
              Chat on Telegram
            </a>
            <p className="mt-2 text-xs text-muted">{site.telegramHandle}</p>
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 bg-blush px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal className="mb-10 text-center">
              <p className="font-hand text-2xl text-coral">Before you ask</p>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">Got Questions?</h2>
            </Reveal>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-heading font-semibold">
                    {f.q}
                    <span className="text-xl text-sage transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
