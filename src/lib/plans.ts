export type EventType = "wedding" | "engagement" | "birthday" | "housewarming";

export type PlanId = "wedding-premium" | "wedding-standard" | "birthday-premium" | "housewarming";

export type Plan = {
  id: PlanId;
  emoji: string;
  name: string;
  subtitle: string;
  price: number;
  /** Shown crossed out next to the price. */
  compareAt?: number;
  badges?: string[];
  eventTypes: EventType[];
  limits: {
    photos: number;
    namedGuests: number;
  };
  /** Feature flags the editor and renderer check. */
  features: {
    loveStory: boolean;
    wishes: boolean;
    rsvp: boolean;
    openingChoice: boolean;
    dressCode: boolean;
    gift: boolean;
    music: boolean;
  };
  highlights: { icon: string; text: string; premium?: boolean }[];
  cta: string;
  featured?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  "wedding-premium": {
    id: "wedding-premium",
    emoji: "💍",
    name: "Wedding Premium",
    subtitle: "Best for wedding or engagement",
    price: 49.99,
    badges: ["★ Most popular"],
    featured: true,
    eventTypes: ["wedding", "engagement"],
    limits: { photos: 10, namedGuests: 100 },
    features: { loveStory: true, wishes: true, rsvp: true, openingChoice: true, dressCode: true, gift: true, music: true },
    highlights: [
      { icon: "✨", text: "Choose your opening animation", premium: true },
      { icon: "💞", text: "Love story timeline", premium: true },
      { icon: "💌", text: "Guest wishes & RSVP", premium: true },
      { icon: "📸", text: "Up to 10 photos" },
      { icon: "👥", text: "Invite up to 100 guests by name — each gets their own link" },
      { icon: "📲", text: "1 shared link for everyone — no limit" },
      { icon: "📅", text: "Add to Calendar" },
      { icon: "🇰🇭", text: "Bilingual (Khmer & English)" },
      { icon: "🎵", text: "Background music" },
      { icon: "📍", text: "Google Maps" },
      { icon: "⏳", text: "Countdown timer" },
      { icon: "🎁", text: "Digital gift (KHQR)" },
    ],
    cta: "Create My Invitation",
  },
  "wedding-standard": {
    id: "wedding-standard",
    emoji: "💍",
    name: "Standard",
    subtitle: "Best for wedding or engagement",
    price: 29.99,
    eventTypes: ["wedding", "engagement"],
    limits: { photos: 5, namedGuests: 20 },
    features: { loveStory: false, wishes: false, rsvp: false, openingChoice: false, dressCode: true, gift: true, music: true },
    highlights: [
      { icon: "🎨", text: "All wedding templates" },
      { icon: "🇰🇭", text: "Bilingual (Khmer & English)" },
      { icon: "📸", text: "Up to 5 photos" },
      { icon: "🎵", text: "Background music" },
      { icon: "📍", text: "Google Maps" },
      { icon: "⏳", text: "Countdown timer" },
      { icon: "🎁", text: "Digital gift (KHQR)" },
      { icon: "👥", text: "Invite up to 20 guests by name" },
      { icon: "📲", text: "1 shared link for everyone — no limit" },
    ],
    cta: "Create Standard Invitation",
  },
  "birthday-premium": {
    id: "birthday-premium",
    emoji: "🎂",
    name: "Birthday Premium",
    subtitle: "Birthdays of every age",
    price: 19.99,
    compareAt: 29.99,
    badges: ["New", "Launch special"],
    eventTypes: ["birthday"],
    limits: { photos: 10, namedGuests: 100 },
    features: { loveStory: false, wishes: true, rsvp: true, openingChoice: true, dressCode: true, gift: true, music: true },
    highlights: [
      { icon: "🎂", text: "Birthday templates" },
      { icon: "💌", text: "Guest RSVP — see who's coming" },
      { icon: "👥", text: "Personalized guest name links" },
      { icon: "📍", text: "Google Maps + Add to Calendar" },
      { icon: "🇰🇭", text: "Bilingual (Khmer & English)" },
      { icon: "📸", text: "Up to 10 photos" },
      { icon: "👗", text: "Dress code" },
      { icon: "🎵", text: "Music, countdown & easy sharing" },
    ],
    cta: "Create Birthday Invitation",
  },
  housewarming: {
    id: "housewarming",
    emoji: "🏡",
    name: "House Warming",
    subtitle: "Celebrate your new home",
    price: 29.99,
    compareAt: 49.99,
    badges: ["New", "Launch special"],
    eventTypes: ["housewarming"],
    limits: { photos: 10, namedGuests: 100 },
    features: { loveStory: false, wishes: true, rsvp: true, openingChoice: true, dressCode: true, gift: true, music: true },
    highlights: [
      { icon: "🏡", text: "House warming templates" },
      { icon: "💌", text: "Guest RSVP — see who's coming" },
      { icon: "👥", text: "Up to 100 guest names" },
      { icon: "📍", text: "Google Maps + Add to Calendar" },
      { icon: "🇰🇭", text: "Bilingual (Khmer & English)" },
      { icon: "📸", text: "Up to 10 photos" },
      { icon: "👗", text: "Dress code" },
      { icon: "🎵", text: "Music, countdown & easy sharing" },
    ],
    cta: "Create House Warming Invitation",
  },
};

export const PLAN_LIST = Object.values(PLANS);

export function getPlan(id: string | null | undefined): Plan | undefined {
  return id && id in PLANS ? PLANS[id as PlanId] : undefined;
}

export const EVENT_LABELS: Record<EventType, { en: string; km: string; emoji: string }> = {
  wedding: { en: "Wedding", km: "អាពាហ៍ពិពាហ៍", emoji: "💍" },
  engagement: { en: "Engagement", km: "ភ្ជាប់ពាក្យ", emoji: "💐" },
  birthday: { en: "Birthday", km: "ខួបកំណើត", emoji: "🎂" },
  housewarming: { en: "House Warming", km: "ឡើងផ្ទះថ្មី", emoji: "🏡" },
};

/** Orders must be placed at least this many days before the event. */
export const MIN_DAYS_BEFORE_EVENT = 5;
