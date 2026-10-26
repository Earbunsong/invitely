"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { eventDate, t } from "@/lib/invitation";
import { dayNames, digits, formatLongDate, formatTime, monthName, ui } from "@/lib/i18n";
import { site } from "@/config/site";
import type { SectionId } from "@/templates";
import { displayClass, useInvitation } from "./context";

const SCHEDULE_EMOJI: Record<string, string> = {
  ring: "💍",
  music: "🎶",
  food: "🍽️",
  camera: "📸",
  monk: "🙏",
  cake: "🎂",
  toast: "🥂",
  home: "🏡",
  gift: "🎁",
  heart: "💞",
  car: "🚗",
  star: "✨",
};

export function Section({ id }: { id: SectionId }) {
  const map: Record<SectionId, () => ReactNode> = {
    details: Details,
    calendar: CalendarCard,
    hero: HeroPhoto,
    parents: Parents,
    countdown: Countdown,
    story: LoveStory,
    gallery: Gallery,
    map: MapCard,
    schedule: Schedule,
    dresscode: DressCode,
    gift: Gift,
    wishes: Wishes,
    thanks: Thanks,
    footer: Footer,
  };
  const Comp = map[id];
  return <Comp />;
}

function Ornament() {
  return (
    <div className="my-3 flex items-center justify-center gap-2 iv-accent" aria-hidden>
      <span className="h-px w-14" style={{ background: "currentColor", opacity: 0.4 }} />
      <span className="text-xs">❦</span>
      <span className="h-px w-14" style={{ background: "currentColor", opacity: 0.4 }} />
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  const { template, locale } = useInvitation();
  return (
    <h2 className={`${displayClass(template, locale)} iv-accent text-center ${locale === "km" ? "text-2xl" : template.theme.display === "script" ? "text-4xl" : "text-3xl"}`}>{children}</h2>
  );
}

function Wrap({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id ? `iv-${id}` : undefined} className={`relative z-10 mx-auto w-full max-w-md px-5 py-8 ${className}`}>
      <Reveal>{children}</Reveal>
    </section>
  );
}

export function Names({ size = "lg" }: { size?: "lg" | "md" }) {
  const { data, template, locale } = useInvitation();
  const sizeFor = (l: typeof locale) =>
    size === "lg" ? (l === "km" ? "text-4xl" : template.theme.display === "script" ? "text-6xl" : "text-5xl") : l === "km" ? "text-2xl" : "text-4xl";
  return (
    <div className="text-center">
      {data.hosts.map((h, i) => {
        // A name with no Khmer version falls back to English — render it in the Latin display font.
        const shown = locale === "km" && !h.km ? "en" : locale;
        return (
          <div key={i}>
            {i > 0 && <div className={`${locale === "km" ? "km text-lg" : "font-serif text-2xl italic"} my-1 opacity-80`}>{ui("and", locale)}</div>}
            <div className={`${displayClass(template, shown)} ${sizeFor(shown)} leading-tight iv-accent`}>{t(h, locale)}</div>
          </div>
        );
      })}
    </div>
  );
}

function Details() {
  const { data, locale, template } = useInvitation();
  return (
    <Wrap id="details" className="pt-16 text-center">
      <p className={`${locale === "km" ? `${displayClass(template, "km")} text-xl` : "font-serif text-lg uppercase tracking-[0.3em]"}`} style={{ color: "var(--iv-muted)" }}>
        {t(data.title, locale)}
      </p>
      <div className="mt-4">
        <Names />
      </div>
      {data.eventType === "birthday" && data.age != null && (
        <p className="mt-3 font-serif text-2xl">
          {ui("age", locale)} <span className="iv-accent text-4xl font-semibold">{digits(data.age, locale)}</span>
        </p>
      )}
      <Ornament />
      <p className="text-lg">{formatLongDate(data.date, locale)}</p>
      <p className="opacity-80">{formatTime(data.time, locale)}</p>
      <p className="mt-3 text-lg font-semibold">{t(data.venue.name, locale)}</p>
      {t(data.venue.address, locale) && <p className="text-sm opacity-80">{t(data.venue.address, locale)}</p>}
    </Wrap>
  );
}

function icsContent(title: string, start: Date, location: string, url: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + 4 * 3600 * 1000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//EN`,
    "BEGIN:VEVENT",
    `UID:${fmt(start)}-${Math.random().toString(36).slice(2)}@${site.name.toLowerCase()}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title.replace(/[,;]/g, " ")}`,
    `LOCATION:${location.replace(/[,;]/g, " ")}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function CalendarCard() {
  const { data, locale } = useInvitation();
  const [y, m, d] = data.date.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  const names = dayNames(locale).map((n) => (locale === "km" ? n.slice(0, 2) : n.slice(0, 3)));

  const addToCalendar = () => {
    const title = `${t(data.title, "en")} — ${data.hosts.map((h) => t(h, "en")).join(" & ")}`;
    const blob = new Blob([icsContent(title, eventDate(data), t(data.venue.name, "en"), window.location.href)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "invitation.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Wrap id="calendar">
      <div className="iv-card p-5">
        <p className="mb-3 text-center text-lg font-semibold iv-accent">
          {monthName(m - 1, locale)} {digits(y, locale)}
        </p>
        <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
          {names.map((n) => (
            <div key={n} className="text-xs opacity-60">
              {n}
            </div>
          ))}
          {cells.map((c, i) => (
            <div key={i} className="flex h-8 items-center justify-center">
              {c && (
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${c === d ? "font-bold text-white" : ""}`}
                  style={c === d ? { background: "var(--iv-accent)", boxShadow: "0 0 0 4px var(--iv-accent-soft)" } : undefined}
                >
                  {c === d ? "♥" : digits(c, locale)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-center">
        <button onClick={addToCalendar} className="iv-btn-soft px-5 py-2 text-sm font-semibold">
          📅 {ui("addToCalendar", locale)}
        </button>
      </div>
    </Wrap>
  );
}

function HeroPhoto() {
  const { data } = useInvitation();
  const src = data.coverPhoto || data.photos[0];
  if (!src) return null;
  return (
    <section className="relative z-10 mx-auto w-full max-w-md py-4">
      <Reveal>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="aspect-[4/5] w-full object-cover"
          style={{ maskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 85%, transparent 100%)" }}
        />
      </Reveal>
    </section>
  );
}

function Parents() {
  const { data, locale, template } = useInvitation();
  const p = data.parents;
  const hasParents = p && [p.left.father, p.left.mother, p.right.father, p.right.mother].some((x) => t(x, locale));
  return (
    <Wrap id="parents">
      <div className="iv-card p-6 text-center">
        {hasParents && (
          <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
            {[
              { label: ui("groomParents", locale), v: p!.left },
              { label: ui("brideParents", locale), v: p!.right },
            ].map((col, i) => (
              <div key={i} className={i === 1 ? "border-l pl-3" : "pr-1"} style={{ borderColor: "var(--iv-border)" }}>
                <p className="mb-1 text-xs opacity-60">{col.label}</p>
                {t(col.v.father, locale) && (
                  <p>
                    {ui("mr", locale)} {t(col.v.father, locale)}
                  </p>
                )}
                {t(col.v.mother, locale) && (
                  <p>
                    {ui("mrs", locale)} {t(col.v.mother, locale)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <h3 className={`${displayClass(template, locale)} iv-accent mb-3 ${locale === "km" ? "text-xl" : "text-3xl"}`}>{ui("invitesYou", locale)}</h3>
        <p className="whitespace-pre-line leading-relaxed opacity-90">{t(data.message, locale)}</p>
      </div>
    </Wrap>
  );
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Countdown() {
  const { data, locale } = useInvitation();
  const now = useNow();
  const target = useMemo(() => eventDate(data).getTime(), [data]);
  const diff = now == null ? 0 : Math.max(0, target - now);
  const parts = [
    { v: Math.floor(diff / 86400000), l: ui("days", locale) },
    { v: Math.floor(diff / 3600000) % 24, l: ui("hours", locale) },
    { v: Math.floor(diff / 60000) % 60, l: ui("minutes", locale) },
    { v: Math.floor(diff / 1000) % 60, l: ui("seconds", locale) },
  ];
  return (
    <Wrap id="countdown" className="text-center">
      <p className="mb-3 text-sm uppercase tracking-widest opacity-70">{ui("countdown", locale)}</p>
      {now != null && diff === 0 ? (
        <p className="iv-card p-5">{ui("eventPassed", locale)}</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {parts.map((p) => (
            <div key={p.l} className="iv-card py-4">
              <div className="font-serif text-3xl font-semibold iv-accent tabular-nums">{now == null ? "–" : digits(String(p.v).padStart(2, "0"), locale)}</div>
              <div className="text-xs opacity-70">{p.l}</div>
            </div>
          ))}
        </div>
      )}
    </Wrap>
  );
}

function LoveStory() {
  const { data, locale, features } = useInvitation();
  if (!features.loveStory || data.loveStory.length === 0) return null;
  return (
    <Wrap id="story">
      <Heading>{ui("loveStory", locale)}</Heading>
      <Ornament />
      <ol className="relative ml-4 border-l pl-6" style={{ borderColor: "var(--iv-border)" }}>
        {data.loveStory.map((s, i) => (
          <li key={i} className="mb-6">
            <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full" style={{ background: "var(--iv-accent)", boxShadow: "0 0 0 4px var(--iv-accent-soft)" }} />
            <p className="text-sm font-semibold iv-accent">{s.year}</p>
            <p className="font-semibold">{t(s.title, locale)}</p>
            <p className="text-sm opacity-80">{t(s.text, locale)}</p>
          </li>
        ))}
      </ol>
    </Wrap>
  );
}

function Gallery() {
  const { data, locale } = useInvitation();
  const [open, setOpen] = useState<string | null>(null);
  const photos = data.photos.filter((p) => p !== data.coverPhoto);
  if (photos.length === 0) return null;
  return (
    <section id="iv-gallery" className="relative z-10 mx-auto w-full max-w-md px-5 py-8">
      <Reveal>
        <Heading>{ui("gallery", locale)}</Heading>
        <Ornament />
      </Reveal>
      <div className="grid grid-cols-2 gap-3">
        {photos.map((src, i) => (
          <Reveal key={src + i} delay={(i % 2) * 0.1} className={i % 3 === 0 ? "col-span-2" : ""}>
            <button onClick={() => setOpen(src)} className="block w-full overflow-hidden rounded-2xl border-4 shadow-md" style={{ borderColor: "var(--iv-surface)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className={`w-full object-cover transition-transform duration-500 hover:scale-105 ${i % 3 === 0 ? "aspect-[4/3]" : "aspect-[3/4]"}`} />
            </button>
          </Reveal>
        ))}
      </div>
      {open && (
        <button onClick={() => setOpen(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4" aria-label="Close photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt="" className="max-h-full max-w-full rounded-lg" />
        </button>
      )}
    </section>
  );
}

function MapCard() {
  const { data, locale } = useInvitation();
  const q = data.venue.mapQuery || t(data.venue.address, "en") || t(data.venue.name, "en");
  if (!q) return null;
  return (
    <Wrap id="map" className="text-center">
      <Heading>{ui("location", locale)}</Heading>
      <Ornament />
      <div className="iv-card overflow-hidden p-0">
        <iframe title="Map" className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`} />
      </div>
      <p className="mt-3 font-semibold">{t(data.venue.name, locale)}</p>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer" className="iv-btn mt-3 inline-block px-6 py-2.5 text-sm font-semibold">
        📍 {ui("openMap", locale)}
      </a>
    </Wrap>
  );
}

function Schedule() {
  const { data, locale } = useInvitation();
  if (data.schedule.length === 0) return null;
  return (
    <Wrap id="schedule">
      <div className="iv-card p-6">
        <Heading>{ui("schedule", locale)}</Heading>
        <Ornament />
        <ol className="space-y-4">
          {data.schedule.map((s, i) => (
            <li key={i} className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl" style={{ background: "var(--iv-accent-soft)", border: "1px solid var(--iv-border)" }}>
                {SCHEDULE_EMOJI[s.icon] ?? "✨"}
              </span>
              <span className="w-16 shrink-0 font-semibold iv-accent tabular-nums">{digits(s.time, locale)}</span>
              <span className="text-sm">{t(s.title, locale)}</span>
            </li>
          ))}
        </ol>
      </div>
    </Wrap>
  );
}

function DressCode() {
  const { data, locale } = useInvitation();
  if (data.colors.length === 0 && !t(data.dressCode, locale)) return null;
  return (
    <Wrap id="dresscode" className="text-center">
      <Heading>{ui("colors", locale)}</Heading>
      <Ornament />
      <div className="flex flex-wrap justify-center gap-3">
        {data.colors.map((c) => (
          <span key={c} className="h-10 w-10 rounded-full border-4 shadow" style={{ background: c, borderColor: "var(--iv-surface)" }} title={c} />
        ))}
      </div>
      {t(data.dressCode, locale) && (
        <p className="mt-3 text-sm opacity-80">
          {ui("dressCode", locale)}: {t(data.dressCode, locale)}
        </p>
      )}
    </Wrap>
  );
}

function Gift() {
  const { data, locale, features } = useInvitation();
  if (!features.gift || !data.gift?.qrUrl) return null;
  return (
    <Wrap id="gift" className="text-center">
      <div className="iv-card p-6">
        <Heading>{ui("gift", locale)}</Heading>
        <Ornament />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.gift.qrUrl} alt="KHQR" className="mx-auto w-52 rounded-xl bg-white p-2" />
        <p className="mt-3 text-sm opacity-80">{t(data.gift.note, locale) || ui("giftHint", locale)}</p>
      </div>
    </Wrap>
  );
}

type WishRow = { id: string; name: string; message: string; attending: boolean | null; createdAt: string };

function Wishes() {
  const { locale, features, slug, guestName, guestToken, preview } = useInvitation();
  const [rows, setRows] = useState<WishRow[]>([]);
  const [name, setName] = useState(guestName ?? "");
  const [message, setMessage] = useState("");
  const [attending, setAttending] = useState<boolean | null>(features.rsvp ? true : null);
  const [partySize, setPartySize] = useState(1);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (preview || !features.wishes) return;
    fetch(`/api/wishes?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : { wishes: [] }))
      .then((j) => setRows(j.wishes ?? []))
      .catch(() => undefined);
  }, [slug, preview, features.wishes]);

  if (!features.wishes && !features.rsvp) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) return;
    setState("sending");
    const res = await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, guestToken, name, message, attending, partySize: attending ? partySize : null }),
    });
    if (!res.ok) return setState("error");
    const j = await res.json();
    if (j.wish && message.trim()) setRows((r) => [j.wish, ...r]);
    setMessage("");
    setState("sent");
  };

  return (
    <Wrap id="wishes">
      <div className="iv-card p-6">
        <Heading>{features.rsvp ? ui("rsvp", locale) : ui("wishes", locale)}</Heading>
        <Ornament />
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ui("yourName", locale)}
            className="w-full rounded-xl border bg-white/70 px-4 py-2.5 text-[15px] text-neutral-800 outline-none"
            style={{ borderColor: "var(--iv-border)" }}
          />
          {features.rsvp && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[true, false].map((v) => (
                <button
                  type="button"
                  key={String(v)}
                  onClick={() => setAttending(v)}
                  className={`rounded-xl border px-3 py-2 font-semibold ${attending === v ? "text-white" : ""}`}
                  style={{ borderColor: "var(--iv-border)", background: attending === v ? "var(--iv-accent)" : "transparent" }}
                >
                  {v ? ui("yes", locale) : ui("no", locale)}
                </button>
              ))}
            </div>
          )}
          {features.rsvp && attending && (
            <label className="flex items-center justify-between text-sm">
              {ui("partySize", locale)}
              <input type="number" min={1} max={20} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="w-20 rounded-lg border bg-white/70 px-2 py-1 text-neutral-800" style={{ borderColor: "var(--iv-border)" }} />
            </label>
          )}
          {features.wishes && (
            <textarea
              maxLength={500}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={ui("yourWish", locale)}
              className="w-full rounded-xl border bg-white/70 px-4 py-2.5 text-[15px] text-neutral-800 outline-none"
              style={{ borderColor: "var(--iv-border)" }}
            />
          )}
          <button disabled={state === "sending" || preview} className="iv-btn w-full py-2.5 font-semibold disabled:opacity-60">
            {ui("send", locale)}
          </button>
          {state === "sent" && <p className="text-center text-sm">{ui("sent", locale)}</p>}
          {state === "error" && <p className="text-center text-sm text-red-600">Something went wrong. Please try again.</p>}
        </form>
        {rows.length > 0 && (
          <ul className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
            {rows.map((w) => (
              <li key={w.id} className="rounded-xl p-3 text-sm" style={{ background: "var(--iv-accent-soft)" }}>
                <p className="font-semibold">{w.name}</p>
                <p className="opacity-90">{w.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Wrap>
  );
}

function Thanks() {
  const { data, locale } = useInvitation();
  if (!t(data.thanks, locale)) return null;
  return (
    <Wrap id="thanks">
      <div className="iv-card p-6 text-center">
        <Heading>{ui("thanks", locale)}</Heading>
        <Ornament />
        <p className="whitespace-pre-line leading-relaxed opacity-90">{t(data.thanks, locale)}</p>
      </div>
    </Wrap>
  );
}

function Footer() {
  const { data, locale } = useInvitation();
  return (
    <Wrap className="pb-28 text-center">
      <Ornament />
      <Names size="md" />
      <p className="mt-2 text-sm opacity-80">{formatLongDate(data.date, locale)}</p>
      <Ornament />
      <p className="font-serif text-sm italic opacity-70">
        {ui("madeWith", locale)} ♥ by{" "}
        <Link href="/" className="font-semibold not-italic">
          {site.name}
        </Link>
      </p>
    </Wrap>
  );
}
