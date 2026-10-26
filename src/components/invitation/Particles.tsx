"use client";

import { useEffect, useState } from "react";
import type { Particles as Kind } from "@/templates";

type P = { left: number; delay: number; duration: number; size: number; drift: number; spin: number; color: string; top: number };

const COLORS: Record<Exclude<Kind, "none">, string[]> = {
  petals: ["#f4c2c2", "#f7d6d0", "#efb0a8", "#fbe3dc"],
  sparkles: ["#f6d58e", "#e3b65c", "#fff1c9"],
  confetti: ["#ff7aa2", "#ffd166", "#7cc6fe", "#b28dff", "#7ee0b5"],
  hearts: ["#e8a08a", "#c8643b", "#f2c3ae"],
};

/** Decorative falling petals / sparkles / confetti. Generated on the client to avoid hydration mismatch. */
export function Particles({ kind, count = 16 }: { kind: Kind; count?: number }) {
  const [items, setItems] = useState<P[]>([]);

  useEffect(() => {
    if (kind === "none" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = COLORS[kind];
    setItems(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * -18,
        duration: 10 + Math.random() * 10,
        size: kind === "sparkles" ? 3 + Math.random() * 4 : 8 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 160,
        spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    );
  }, [kind, count]);

  if (kind === "none" || items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden>
      {items.map((p, i) =>
        kind === "sparkles" ? (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: `iv-twinkle ${3 + (p.duration % 4)}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ) : (
          <span
            key={i}
            className="absolute top-0"
            style={
              {
                left: `${p.left}%`,
                width: p.size,
                height: kind === "confetti" ? p.size * 0.45 : p.size,
                background: kind === "hearts" ? "transparent" : p.color,
                color: p.color,
                borderRadius: kind === "petals" ? "70% 0 70% 0" : kind === "confetti" ? 2 : 0,
                fontSize: p.size + 2,
                lineHeight: 1,
                opacity: 0.85,
                animation: `iv-fall ${p.duration}s linear ${p.delay}s infinite`,
                "--drift": `${p.drift}px`,
                "--spin": `${p.spin}deg`,
              } as React.CSSProperties
            }
          >
            {kind === "hearts" ? "♥" : null}
          </span>
        ),
      )}
    </div>
  );
}
