"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InvitationData, Locale } from "@/lib/invitation";
import { t } from "@/lib/invitation";
import { formatLongDate, ui } from "@/lib/i18n";
import type { Plan } from "@/lib/plans";
import type { Template } from "@/templates";
import { CoverBackdrop } from "./art";
import { Ctx, displayClass, useInvitation, type InvitationCtx } from "./context";
import { Opening } from "./Opening";
import { Particles } from "./Particles";
import { Names, Section } from "./sections";

type Props = {
  data: InvitationData;
  template: Template;
  features: Plan["features"];
  slug: string;
  guestName?: string;
  guestToken?: string;
  preview?: boolean;
  /** Skip the cover + opening (editor live preview). */
  startOpen?: boolean;
};

type Stage = "cover" | "opening" | "open";

export function InvitationRenderer({ data, template, features, slug, guestName, guestToken, preview = false, startOpen = false }: Props) {
  const [locale, setLocale] = useState<Locale>(data.defaultLocale);
  const [stage, setStage] = useState<Stage>(startOpen ? "open" : "cover");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => setLocale(data.defaultLocale), [data.defaultLocale]);
  useEffect(() => setStage(startOpen ? "open" : "cover"), [startOpen]);

  const opening = features.openingChoice && data.opening ? data.opening : template.opening;
  const photos = [data.coverPhoto, ...data.photos].filter(Boolean);

  const open = () => {
    const a = audioRef.current;
    if (a && data.musicUrl) {
      a.volume = 0.6;
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    setStage("opening");
  };
  const finishOpening = useCallback(() => setStage("open"), []);

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => undefined);
    else {
      a.pause();
      setPlaying(false);
    }
  };

  const ctx: InvitationCtx = { data, template, locale, setLocale, features, slug, guestName, guestToken, preview };
  const th = template.theme;
  const style = {
    "--iv-bg": th.background,
    "--iv-surface": th.surface,
    "--iv-text": th.text,
    "--iv-muted": th.muted,
    "--iv-accent": th.accent,
    "--iv-accent-soft": th.accentSoft,
    "--iv-border": th.border,
  } as React.CSSProperties;

  return (
    <Ctx.Provider value={ctx}>
      <div className={`iv-root relative overflow-x-hidden ${locale === "km" ? "km" : ""}`} style={style} lang={locale}>
        {data.musicUrl && <audio ref={audioRef} src={data.musicUrl} loop preload="none" />}
        <Particles kind={template.particles} count={template.particles === "sparkles" ? 26 : 14} />

        <TopBar locale={locale} setLocale={setLocale} hasMusic={Boolean(data.musicUrl)} playing={playing} onToggleMusic={toggleMusic} />

        <AnimatePresence>{stage === "cover" && <Cover key="cover" onOpen={open} />}</AnimatePresence>
        <Opening kind={opening} playing={stage === "opening"} photos={photos} onDone={finishOpening} />

        {stage !== "cover" && (
          <main className="relative">
            {template.sections.map((id) => (
              <Section key={id} id={id} />
            ))}
          </main>
        )}
        {stage === "open" && <SideDock />}
      </div>
    </Ctx.Provider>
  );
}

function Cover({ onOpen }: { onOpen: () => void }) {
  const { data, template, locale, guestName } = useInvitation();
  // Rendered via <AnimatePresence> so it fades out when the guest taps "Open".
  const item = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  } as const;
  return (
    <motion.div className="fixed inset-0 z-40 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5 } }}>
      {/* Art stays phone-width on large screens; the theme background fills the sides. */}
      <div className="absolute inset-0" style={{ background: "var(--iv-bg)" }} />
      <div className="absolute inset-y-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 overflow-hidden">
        {template.cover === "image" && template.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={template.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <CoverBackdrop art={template.cover} />
        )}
        {/* Soft glow behind the text so it stays legible over any art or screen shape. */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 45% at 50% 32%, var(--iv-surface) 0%, transparent 100%)" }} />
      </div>
      <motion.div
        className="relative z-10 flex h-full flex-col items-center px-8 pt-[16vh] text-center"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.45, delayChildren: 0.4 } } }}
      >
        {guestName && (
          <motion.p variants={item} className="mb-2 text-sm opacity-80">
            {ui("dear", locale)} <span className="font-semibold">{guestName}</span>
          </motion.p>
        )}
        <motion.p
          variants={item}
          className={locale === "km" ? `${displayClass(template, "km")} text-xl iv-accent` : "font-serif text-sm uppercase tracking-[0.35em]"}
          style={{ color: locale === "km" ? undefined : "var(--iv-muted)" }}
        >
          {t(data.title, locale)}
        </motion.p>
        <motion.div variants={item} className="mt-5">
          <Names />
        </motion.div>
        <motion.div variants={item} className="my-4 flex items-center gap-2 iv-accent" aria-hidden>
          <span className="h-px w-10 bg-current opacity-40" />
          <span>♥</span>
          <span className="h-px w-10 bg-current opacity-40" />
        </motion.div>
        <motion.p variants={item} className="text-base">
          {formatLongDate(data.date, locale)}
        </motion.p>
        <motion.div variants={item} className="mt-8">
          <motion.button
            onClick={onOpen}
            whileTap={{ scale: 0.96 }}
            className="iv-btn px-7 py-3 text-sm font-semibold tracking-wide"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          >
            ✉ {ui("tapToOpen", locale)}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function TopBar({ locale, setLocale, hasMusic, playing, onToggleMusic }: { locale: Locale; setLocale: (l: Locale) => void; hasMusic: boolean; playing: boolean; onToggleMusic: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] mx-auto flex max-w-md items-center justify-between px-4 pt-3">
      <div className="pointer-events-auto flex rounded-full p-1 text-xs font-semibold shadow-md backdrop-blur" style={{ background: "var(--iv-surface)", border: "1px solid var(--iv-border)" }}>
        {(["en", "km"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className="rounded-full px-3 py-1 transition-colors"
            style={locale === l ? { background: "var(--iv-accent)", color: "#fff" } : undefined}
            aria-pressed={locale === l}
          >
            {l === "en" ? "EN" : "ខ្មែរ"}
          </button>
        ))}
      </div>
      {hasMusic && (
        <button
          onClick={onToggleMusic}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur"
          style={{ background: "var(--iv-surface)", border: "1px solid var(--iv-border)" }}
          aria-label={playing ? "Pause music" : "Play music"}
        >
          <motion.span animate={playing ? { rotate: 360 } : { rotate: 0 }} transition={playing ? { repeat: Infinity, duration: 4, ease: "linear" } : {}} className="iv-accent">
            {playing ? "♫" : "♪"}
          </motion.span>
        </button>
      )}
    </div>
  );
}

function SideDock() {
  const links = [
    { href: "#iv-calendar", icon: "📅", label: "Calendar" },
    { href: "#iv-gallery", icon: "🖼️", label: "Gallery" },
    { href: "#iv-map", icon: "📍", label: "Map" },
    { href: "#iv-schedule", icon: "🕒", label: "Program" },
    { href: "#iv-wishes", icon: "💌", label: "Wishes" },
    { href: "#iv-gift", icon: "🎁", label: "Gift" },
  ];
  const [present, setPresent] = useState<typeof links>([]);
  useEffect(() => setPresent(links.filter((l) => document.querySelector(l.href))), []); // eslint-disable-line react-hooks/exhaustive-deps
  if (present.length === 0) return null;
  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="fixed right-2 top-1/2 z-[55] flex -translate-y-1/2 flex-col gap-2 rounded-full p-1.5 shadow-lg backdrop-blur"
      style={{ background: "var(--iv-surface)", border: "1px solid var(--iv-border)" }}
    >
      {present.map((l) => (
        <a key={l.href} href={l.href} aria-label={l.label} className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition hover:scale-110">
          {l.icon}
        </a>
      ))}
    </motion.nav>
  );
}
