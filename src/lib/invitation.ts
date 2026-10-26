import { z } from "zod";

/** Bilingual text. Either language may be empty; the renderer falls back to the other one. */
export const L = z.object({ en: z.string().max(2000).default(""), km: z.string().max(2000).default("") });
export type LText = z.infer<typeof L>;

const url = z.string().max(1000).refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "Must be an https:// URL");

export const EVENT_TYPES = ["wedding", "engagement", "birthday", "housewarming"] as const;

export const SCHEDULE_ICONS = ["ring", "music", "food", "camera", "monk", "cake", "toast", "home", "gift", "heart", "car", "star"] as const;

export const invitationDataSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  /** Small heading on the cover, e.g. "The Wedding Of". */
  title: L,
  /** Couple (2) for weddings, celebrant (1) for birthdays, family/hosts (1–2) for house warmings. */
  hosts: z.array(L).min(1).max(2),
  /** Birthday only. */
  age: z.number().int().min(0).max(150).optional(),
  parents: z
    .object({
      left: z.object({ father: L, mother: L }),
      right: z.object({ father: L, mother: L }),
    })
    .optional(),
  /** Local date and time in Asia/Phnom_Penh. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  venue: z.object({
    name: L,
    address: L,
    /** Free text or "lat,lng" used for the embedded Google Map. */
    mapQuery: z.string().max(300).default(""),
  }),
  message: L,
  thanks: L.optional(),
  schedule: z
    .array(z.object({ time: z.string().max(10), title: L, icon: z.enum(SCHEDULE_ICONS).default("star") }))
    .max(20)
    .default([]),
  loveStory: z.array(z.object({ year: z.string().max(10), title: L, text: L })).max(8).default([]),
  coverPhoto: url.default(""),
  photos: z.array(url).max(20).default([]),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(8).default([]),
  dressCode: L.optional(),
  musicUrl: url.default(""),
  gift: z.object({ qrUrl: url.default(""), note: L }).optional(),
  /** Template-specific opening animation override (premium plans only). */
  opening: z.enum(["curtain", "envelope", "fade"]).optional(),
  defaultLocale: z.enum(["en", "km"]).default("km"),
});

export type InvitationData = z.infer<typeof invitationDataSchema>;

export type Locale = "en" | "km";

export function t(text: LText | undefined, locale: Locale): string {
  if (!text) return "";
  return (locale === "km" ? text.km || text.en : text.en || text.km) ?? "";
}

/** Parse stored JSON, filling defaults; throws if the data is invalid. */
export function parseInvitationData(raw: unknown): InvitationData {
  return invitationDataSchema.parse(raw);
}

/** Event start as a Date (Cambodia is UTC+7 with no daylight saving). */
export function eventDate(data: Pick<InvitationData, "date" | "time">): Date {
  return new Date(`${data.date}T${data.time}:00+07:00`);
}

export function emptyInvitation(eventType: InvitationData["eventType"], date: string): InvitationData {
  const titles: Record<InvitationData["eventType"], LText> = {
    wedding: { en: "The Wedding Of", km: "សិរីមង្គលអាពាហ៍ពិពាហ៍" },
    engagement: { en: "The Engagement Of", km: "ពិធីភ្ជាប់ពាក្យ" },
    birthday: { en: "Birthday Celebration", km: "ពិធីខួបកំណើត" },
    housewarming: { en: "House Warming", km: "ពិធីឡើងផ្ទះថ្មី" },
  };
  const couple = eventType === "wedding" || eventType === "engagement";
  return invitationDataSchema.parse({
    eventType,
    title: titles[eventType],
    hosts: couple ? [{ en: "Groom Name", km: "" }, { en: "Bride Name", km: "" }] : [{ en: eventType === "birthday" ? "Celebrant Name" : "Family Name", km: "" }],
    parents: couple
      ? { left: { father: { en: "", km: "" }, mother: { en: "", km: "" } }, right: { father: { en: "", km: "" }, mother: { en: "", km: "" } } }
      : undefined,
    date,
    time: "17:00",
    venue: { name: { en: "Venue name", km: "" }, address: { en: "", km: "" }, mapQuery: "" },
    message: {
      en: "With joyful hearts, we warmly invite you to celebrate this special day with us.",
      km: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីដ៏មានអត្ថន័យនេះ។",
    },
    defaultLocale: "km",
  });
}
