import { describe, expect, it } from "vitest";
import { formatLongDate } from "./i18n";
import { emptyInvitation, eventDate, invitationDataSchema, t } from "./invitation";
import { TEMPLATES, templatesFor } from "@/templates";

describe("invitation data", () => {
  it("creates valid empty data for every event type", () => {
    for (const type of ["wedding", "engagement", "birthday", "housewarming"] as const) {
      const d = emptyInvitation(type, "2027-02-14");
      expect(invitationDataSchema.safeParse(d).success).toBe(true);
      expect(d.hosts.length).toBe(type === "wedding" || type === "engagement" ? 2 : 1);
    }
  });

  it("rejects non-https media URLs", () => {
    const d = { ...emptyInvitation("wedding", "2027-02-14"), photos: ["http://insecure.example/a.jpg"] };
    expect(invitationDataSchema.safeParse(d).success).toBe(false);
  });

  it("falls back to the other language", () => {
    expect(t({ en: "Hello", km: "" }, "km")).toBe("Hello");
    expect(t({ en: "", km: "សួស្តី" }, "en")).toBe("សួស្តី");
  });

  it("uses Cambodia time (UTC+7) for the event", () => {
    expect(eventDate({ date: "2026-12-27", time: "17:00" }).toISOString()).toBe("2026-12-27T10:00:00.000Z");
  });

  it("formats Khmer dates with Khmer numerals", () => {
    expect(formatLongDate("2026-12-27", "km")).toBe("ថ្ងៃអាទិត្យ ទី២៧ ខែធ្នូ ឆ្នាំ២០២៦");
    expect(formatLongDate("2026-12-27", "en")).toBe("Sunday, December 27, 2026");
  });
});

describe("templates", () => {
  it("every event type has at least one template", () => {
    for (const type of ["wedding", "engagement", "birthday", "housewarming"] as const) expect(templatesFor(type).length).toBeGreaterThan(0);
  });
  it("template ids are unique", () => {
    expect(new Set(TEMPLATES.map((x) => x.id)).size).toBe(TEMPLATES.length);
  });
});
