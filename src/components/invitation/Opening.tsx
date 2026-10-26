"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { Opening as Kind } from "@/templates";

/**
 * Full-screen opening animation played once after the guest taps "Open".
 * Calls onDone when finished so the page underneath becomes interactive.
 */
export function Opening({ kind, playing, photos, onDone }: { kind: Kind; playing: boolean; photos: string[]; onDone: () => void }) {
  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? 50 : kind === "fade" ? 900 : kind === "envelope" ? 2600 : 3200;
    const id = setTimeout(onDone, ms);
    return () => clearTimeout(id);
  }, [playing, kind, onDone]);

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key="opening"
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          {kind === "curtain" && <Curtain photos={photos} />}
          {kind === "envelope" && <Envelope />}
          {kind === "fade" && <motion.div className="absolute inset-0" style={{ background: "var(--iv-bg)" }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Curtain({ photos }: { photos: string[] }) {
  const shown = photos.slice(0, 3);
  const panel = "repeating-linear-gradient(90deg,#7a1f2b 0px,#9b2c3a 18px,#6a1824 36px)";
  return (
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center,#3b2a3a,#1d1420)" }}>
      {/* photo stack shuffles in the middle while the curtains part */}
      <div className="absolute inset-0 flex items-center justify-center">
        {shown.map((src, i) => (
          <motion.img
            key={src + i}
            src={src}
            alt=""
            className="absolute h-[42vh] w-[70vw] max-w-sm rounded-2xl border-4 border-white/80 object-cover shadow-2xl"
            initial={{ opacity: 0, scale: 0.7, rotate: 0, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotate: (i - 1) * 7, y: 0, x: (i - 1) * 14 }}
            transition={{ delay: 0.5 + i * 0.35, duration: 0.7, ease: "backOut" }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-0 z-10 h-10" style={{ background: panel, boxShadow: "0 6px 16px rgba(0,0,0,.4)" }} />
      <motion.div
        className="absolute inset-y-0 left-0 z-10 w-1/2"
        style={{ background: panel, boxShadow: "inset -20px 0 30px rgba(0,0,0,.35)" }}
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ delay: 0.3, duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 z-10 w-1/2"
        style={{ background: panel, boxShadow: "inset 20px 0 30px rgba(0,0,0,.35)" }}
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ delay: 0.3, duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
      />
    </div>
  );
}

function Envelope() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--iv-bg)" }}>
      <div className="relative h-56 w-80" style={{ perspective: 800 }}>
        {/* card rising out */}
        <motion.div
          className="iv-card absolute inset-x-6 top-6 bottom-2 flex items-center justify-center text-3xl"
          initial={{ y: 0 }}
          animate={{ y: -120 }}
          transition={{ delay: 1.0, duration: 0.9, ease: "easeOut" }}
        >
          <span className="iv-accent">♥</span>
        </motion.div>
        {/* envelope body */}
        <div className="absolute inset-0 rounded-md" style={{ background: "var(--iv-accent)", opacity: 0.9 }} />
        <div
          className="absolute inset-0 rounded-md"
          style={{ background: "linear-gradient(to top right, transparent 49.5%, rgba(0,0,0,.08) 50%), linear-gradient(to top left, transparent 49.5%, rgba(0,0,0,.08) 50%)" }}
        />
        {/* flap */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 origin-top"
          style={{ clipPath: "polygon(0 0,100% 0,50% 100%)", background: "var(--iv-accent)", filter: "brightness(0.9)" }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: 180 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 bg-white/20"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        />
      </div>
    </div>
  );
}
