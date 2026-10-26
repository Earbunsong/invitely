import type { Locale } from "./invitation";

/** UI labels used inside invitations. Marketing pages are English for now. */
const dict = {
  tapToOpen: { en: "Open Invitation", km: "ចុចដើម្បីបើកធៀប" },
  dear: { en: "Dear", km: "សូមគោរពជូន" },
  and: { en: "&", km: "និង" },
  invitesYou: { en: "We joyfully invite you", km: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ" },
  groomParents: { en: "Groom's parents", km: "មាតាបិតាកូនប្រុស" },
  brideParents: { en: "Bride's parents", km: "មាតាបិតាកូនស្រី" },
  mr: { en: "Mr.", km: "លោក" },
  mrs: { en: "Mrs.", km: "លោកស្រី" },
  countdown: { en: "Counting down", km: "រាប់ថយក្រោយ" },
  days: { en: "Days", km: "ថ្ងៃ" },
  hours: { en: "Hours", km: "ម៉ោង" },
  minutes: { en: "Minutes", km: "នាទី" },
  seconds: { en: "Seconds", km: "វិនាទី" },
  addToCalendar: { en: "Add to calendar", km: "រក្សាទុកក្នុងប្រតិទិន" },
  location: { en: "Location", km: "ទីតាំងកម្មវិធី" },
  openMap: { en: "Open in Google Maps", km: "ចុចមើលទីតាំង" },
  schedule: { en: "Program", km: "កម្មវិធីសិរីមង្គល" },
  gallery: { en: "Our Moments", km: "កម្រងរូបភាព" },
  loveStory: { en: "Our Love Story", km: "ដំណើររឿងស្នេហា" },
  colors: { en: "Theme Colors", km: "ពណ៌នៃកម្មវិធី" },
  dressCode: { en: "Dress code", km: "សម្លៀកបំពាក់" },
  thanks: { en: "Thank You", km: "សេចក្តីថ្លែងអំណរគុណ" },
  gift: { en: "Digital Gift", km: "ចំណងដៃ" },
  giftHint: { en: "Scan the KHQR with any banking app", km: "ស្កេន KHQR តាមកម្មវិធីធនាគារណាមួយ" },
  wishes: { en: "Wishes", km: "ពាក្យជូនពរ" },
  rsvp: { en: "Will you attend?", km: "តើលោកអ្នកនឹងចូលរួមដែរឬទេ?" },
  yes: { en: "Joyfully accept", km: "ចូលរួម" },
  no: { en: "Regretfully decline", km: "មិនអាចចូលរួម" },
  yourName: { en: "Your name", km: "ឈ្មោះរបស់អ្នក" },
  yourWish: { en: "Write a wish…", km: "សរសេរពាក្យជូនពរ…" },
  partySize: { en: "Number of guests", km: "ចំនួនភ្ញៀវ" },
  send: { en: "Send", km: "ផ្ញើ" },
  sent: { en: "Thank you! Your message was sent.", km: "សូមអរគុណ! សាររបស់អ្នកត្រូវបានផ្ញើ។" },
  age: { en: "Turning", km: "អាយុ" },
  eventPassed: { en: "The celebration has taken place. Thank you!", km: "កម្មវិធីបានប្រព្រឹត្តទៅរួចហើយ។ សូមអរគុណ!" },
  madeWith: { en: "Made with", km: "បង្កើតដោយ" },
} as const;

export type DictKey = keyof typeof dict;

export function ui(key: DictKey, locale: Locale): string {
  return dict[key][locale];
}

const KM_DIGITS = "០១២៣៤៥៦៧៨៩";
export function digits(value: string | number, locale: Locale): string {
  const s = String(value);
  return locale === "km" ? s.replace(/\d/g, (d) => KM_DIGITS[Number(d)]) : s;
}

const KM_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const KM_DAYS = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function monthName(month0: number, locale: Locale) {
  return locale === "km" ? KM_MONTHS[month0] : EN_MONTHS[month0];
}
export function dayNames(locale: Locale) {
  return locale === "km" ? KM_DAYS : EN_DAYS;
}

/** "Saturday, December 26, 2026" / "ថ្ងៃសៅរ៍ ទី២៦ ខែធ្នូ ឆ្នាំ២០២៦" from a YYYY-MM-DD string. */
export function formatLongDate(isoDate: string, locale: Locale): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (locale === "km") {
    return `ថ្ងៃ${KM_DAYS[weekday]} ទី${digits(d, "km")} ខែ${KM_MONTHS[m - 1]} ឆ្នាំ${digits(y, "km")}`;
  }
  return `${EN_DAYS[weekday]}, ${EN_MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatTime(hhmm: string, locale: Locale): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (locale === "km") {
    const part = h < 12 ? "ព្រឹក" : h < 13 ? "ថ្ងៃត្រង់" : h < 17 ? "រសៀល" : "ល្ងាច";
    return `ម៉ោង ${digits(String(h).padStart(2, "0"), "km")}:${digits(String(m).padStart(2, "0"), "km")} ${part}`;
  }
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
