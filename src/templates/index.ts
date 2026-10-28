import type { EventType } from "@/lib/plans";

export type SectionId = (typeof SECTION_IDS)[number];

export const COVER_ARTS = ["garden-gate", "royal-frame", "minimal-line", "balloons", "home", "castle"] as const;
/** Built-in SVG art, or "image" for an uploaded cover image (admin-made templates). */
export type CoverArt = (typeof COVER_ARTS)[number] | "image";
export const OPENINGS = ["curtain", "envelope", "fade"] as const;
export const PARTICLES = ["petals", "sparkles", "confetti", "hearts", "none"] as const;
export const SECTION_IDS = ["details", "calendar", "hero", "parents", "countdown", "story", "gallery", "map", "schedule", "dresscode", "gift", "wishes", "thanks", "footer"] as const;
export type Opening = (typeof OPENINGS)[number];
export type Particles = (typeof PARTICLES)[number];

export type Template = {
  id: string;
  name: string;
  description: string;
  eventTypes: EventType[];
  theme: {
    /** Page background (any CSS background). */
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accentSoft: string;
    border: string;
    /** Latin display font: serif (Cormorant) / script (Great Vibes) / sans (Poppins). */
    display: "serif" | "script" | "sans";
    /** Khmer display font. */
    kmDisplay: "moul" | "kantumruy";
  };
  cover: CoverArt;
  /** Used when cover is "image". */
  coverImage?: string;
  opening: Opening;
  particles: Particles;
  sections: SectionId[];
  /** Thumbnail background for the gallery card. */
  swatch: string;
};

export const WEDDING_SECTIONS: SectionId[] = [
  "details",
  "calendar",
  "hero",
  "parents",
  "countdown",
  "story",
  "gallery",
  "map",
  "schedule",
  "dresscode",
  "gift",
  "wishes",
  "thanks",
  "footer",
];

export const PARTY_SECTIONS: SectionId[] = [
  "details",
  "hero",
  "countdown",
  "calendar",
  "gallery",
  "map",
  "schedule",
  "dresscode",
  "gift",
  "wishes",
  "thanks",
  "footer",
];

export const TEMPLATES: Template[] = [
  {
    id: "garden-gate",
    name: "Garden Gate",
    description: "Soft blush garden with a floral arch and an opening curtain.",
    eventTypes: ["wedding", "engagement"],
    theme: {
      background: "linear-gradient(180deg,#fbf3ea 0%,#f8ece4 45%,#fbf5ee 100%)",
      surface: "rgba(255,251,246,0.86)",
      text: "#6b4a2b",
      muted: "#9a7b5c",
      accent: "#b0823f",
      accentSoft: "#f1e2c9",
      border: "#e9d7bd",
      display: "script",
      kmDisplay: "moul",
    },
    cover: "garden-gate",
    opening: "curtain",
    particles: "petals",
    sections: WEDDING_SECTIONS,
    swatch: "linear-gradient(160deg,#fbeee6,#f3dcc8 60%,#e9c9a6)",
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    description: "Deep maroon and gold, inspired by traditional Khmer ceremonies.",
    eventTypes: ["wedding", "engagement"],
    theme: {
      background: "radial-gradient(ellipse at top,#5a1626 0%,#3a0d18 55%,#2a0811 100%)",
      surface: "rgba(74,18,32,0.78)",
      text: "#f6e3b4",
      muted: "#d8bd85",
      accent: "#e3b65c",
      accentSoft: "rgba(227,182,92,0.15)",
      border: "rgba(227,182,92,0.45)",
      display: "serif",
      kmDisplay: "moul",
    },
    cover: "royal-frame",
    opening: "envelope",
    particles: "sparkles",
    sections: WEDDING_SECTIONS,
    swatch: "radial-gradient(circle at 50% 30%,#7a2236,#3a0d18 70%)",
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean sage and ivory with elegant serif type. Works for any event.",
    eventTypes: ["wedding", "engagement", "birthday", "housewarming"],
    theme: {
      background: "#f6f5f0",
      surface: "#ffffff",
      text: "#2f3a32",
      muted: "#6f7d72",
      accent: "#6b8f71",
      accentSoft: "#e5ede6",
      border: "#dfe5dc",
      display: "serif",
      kmDisplay: "kantumruy",
    },
    cover: "minimal-line",
    opening: "fade",
    particles: "none",
    sections: WEDDING_SECTIONS,
    swatch: "linear-gradient(160deg,#f6f5f0,#e5ede6)",
  },
  {
    id: "birthday-pop",
    name: "Birthday Pop",
    description: "Bright balloons and confetti for birthdays of every age.",
    eventTypes: ["birthday"],
    theme: {
      background: "linear-gradient(180deg,#fff4f7 0%,#fdf2ff 50%,#f1f6ff 100%)",
      surface: "rgba(255,255,255,0.9)",
      text: "#3b2a5a",
      muted: "#7a6a96",
      accent: "#ff5c8a",
      accentSoft: "#ffe1ea",
      border: "#f4d6e3",
      display: "sans",
      kmDisplay: "kantumruy",
    },
    cover: "balloons",
    opening: "envelope",
    particles: "confetti",
    sections: PARTY_SECTIONS,
    swatch: "linear-gradient(160deg,#ffe1ea,#e9ddff 55%,#d9ecff)",
  },
  {
    id: "princess-party",
    name: "Princess Party",
    description: "Pink and gold fairy-tale castle with twinkling sparkles.",
    eventTypes: ["birthday"],
    theme: {
      background: "linear-gradient(180deg,#fff0f6 0%,#ffe4ef 55%,#fff6ea 100%)",
      surface: "rgba(255,255,255,0.9)",
      text: "#5a2340",
      muted: "#a0567d",
      accent: "#d4477f",
      accentSoft: "#ffe0ec",
      border: "#f6c6da",
      display: "script",
      kmDisplay: "moul",
    },
    cover: "castle",
    opening: "envelope",
    particles: "sparkles",
    sections: PARTY_SECTIONS,
    swatch: "linear-gradient(160deg,#ffe0ec,#f8c8dc 55%,#f6d58e)",
  },
  {
    id: "home-sweet",
    name: "Home Sweet Home",
    description: "Warm terracotta and greenery to welcome guests to your new home.",
    eventTypes: ["housewarming"],
    theme: {
      background: "linear-gradient(180deg,#fbf6ef 0%,#f6efe4 100%)",
      surface: "rgba(255,252,247,0.92)",
      text: "#4a3426",
      muted: "#8a6f5a",
      accent: "#c8643b",
      accentSoft: "#f6e2d6",
      border: "#ead8c6",
      display: "serif",
      kmDisplay: "moul",
    },
    cover: "home",
    opening: "fade",
    particles: "hearts",
    sections: PARTY_SECTIONS,
    swatch: "linear-gradient(160deg,#fbf6ef,#f6e2d6 60%,#dfe9d6)",
  },
];

/** Card/thumbnail background: the uploaded cover image if there is one, else the swatch. */
export function templateThumb(t: Pick<Template, "swatch" | "cover" | "coverImage">): string {
  return t.cover === "image" && t.coverImage ? `center / cover no-repeat url("${t.coverImage.replace(/"/g, "")}")` : t.swatch;
}

export function getTemplate(id: string | null | undefined): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function templatesFor(eventType: EventType): Template[] {
  return TEMPLATES.filter((t) => t.eventTypes.includes(eventType));
}

/** Starting/fallback template: prefers designs made for this event type over all-purpose ones (e.g. Birthday Pop over Modern Minimal). */
export function defaultTemplateFor(eventType: EventType): Template {
  const candidates = templatesFor(eventType);
  return [...candidates].sort((a, b) => a.eventTypes.length - b.eventTypes.length)[0] ?? TEMPLATES[0];
}
