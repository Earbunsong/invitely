import { describe, expect, it } from "vitest";
import { defaultTemplateFor, getTemplate, PARTY_SECTIONS, TEMPLATES } from "@/templates";
import { sampleInvitation } from "./demo-invitations";
import { invitationDataSchema } from "./invitation";
import { mergeTemplates, pickTemplate, templateConfigSchema, templateMetaSchema } from "./templates";

const base = getTemplate("modern-minimal");
const validConfig = {
  theme: base.theme,
  cover: "image",
  coverImage: "https://abc.public.blob.vercel-storage.com/templates/x.jpg",
  opening: "envelope",
  particles: "confetti",
  sections: PARTY_SECTIONS,
  swatch: "linear-gradient(160deg,#ffe0ec,#f6d58e)",
};
const row = (id: string, status: "DRAFT" | "PUBLISHED", extra: Partial<{ sortOrder: number; eventTypes: string[]; name: string }> = {}) => ({
  id,
  name: extra.name ?? id,
  description: "",
  eventTypes: extra.eventTypes ?? ["birthday"],
  config: validConfig,
  status,
  sortOrder: extra.sortOrder ?? 0,
});

describe("templateConfigSchema", () => {
  it("accepts a valid config", () => {
    expect(templateConfigSchema.safeParse(validConfig).success).toBe(true);
  });
  it("requires an uploaded image for image covers", () => {
    expect(templateConfigSchema.safeParse({ ...validConfig, coverImage: undefined }).success).toBe(false);
    expect(templateConfigSchema.safeParse({ ...validConfig, coverImage: "http://insecure.example/x.jpg" }).success).toBe(false);
  });
  it("blocks CSS that could load resources or break out of the style", () => {
    for (const bad of ["url(https://evil.example/x.png)", "red; position: fixed", "#fff}", "expression(alert(1))".replace("(", ":(")]) {
      expect(templateConfigSchema.safeParse({ ...validConfig, theme: { ...validConfig.theme, accent: bad } }).success).toBe(false);
    }
  });
  it("rejects unknown or duplicate sections", () => {
    expect(templateConfigSchema.safeParse({ ...validConfig, sections: ["details", "details"] }).success).toBe(false);
    expect(templateConfigSchema.safeParse({ ...validConfig, sections: ["details", "nope"] }).success).toBe(false);
  });
});

describe("templateMetaSchema", () => {
  it("validates ids", () => {
    expect(templateMetaSchema.safeParse({ id: "princess-2", name: "Princess 2", eventTypes: ["birthday"] }).success).toBe(true);
    expect(templateMetaSchema.safeParse({ id: "Bad Id!", name: "x x", eventTypes: ["birthday"] }).success).toBe(false);
    expect(templateMetaSchema.safeParse({ id: "ok-id", name: "Ok", eventTypes: [] }).success).toBe(false);
  });
});

describe("mergeTemplates", () => {
  it("puts built-ins first, hides drafts unless asked, and sorts custom templates", () => {
    const rows = [row("zeta", "PUBLISHED", { sortOrder: 2 }), row("alpha", "PUBLISHED", { sortOrder: 1 }), row("draft-one", "DRAFT")];
    const ids = mergeTemplates(TEMPLATES, rows).map((t) => t.id);
    expect(ids.slice(0, TEMPLATES.length)).toEqual(TEMPLATES.map((t) => t.id));
    expect(ids.slice(TEMPLATES.length)).toEqual(["alpha", "zeta"]);
    expect(mergeTemplates(TEMPLATES, rows, { includeDrafts: true }).some((t) => t.id === "draft-one")).toBe(true);
  });
  it("never lets a custom row shadow a built-in id, and skips invalid rows", () => {
    const merged = mergeTemplates(TEMPLATES, [row("garden-gate", "PUBLISHED"), { ...row("broken", "PUBLISHED"), config: { nope: true } }]);
    expect(merged.filter((t) => t.id === "garden-gate")).toHaveLength(1);
    expect(merged.find((t) => t.id === "garden-gate")?.source).toBe("builtin");
    expect(merged.some((t) => t.id === "broken")).toBe(false);
  });
  it("filters by event type", () => {
    const merged = mergeTemplates(TEMPLATES, [row("party", "PUBLISHED")], { eventType: "birthday" });
    expect(merged.every((t) => t.eventTypes.includes("birthday"))).toBe(true);
    expect(merged.some((t) => t.id === "party")).toBe(true);
  });
});

describe("pickTemplate", () => {
  it("falls back to the default when the template is gone or doesn't fit the event", () => {
    const custom = mergeTemplates(TEMPLATES, [row("party", "PUBLISHED")]);
    expect(pickTemplate("party", "birthday", custom).id).toBe("party");
    expect(pickTemplate("deleted-template", "birthday", custom).id).toBe(defaultTemplateFor("birthday").id);
    expect(pickTemplate("party", "wedding", custom).id).toBe(defaultTemplateFor("wedding").id);
  });
});

describe("sampleInvitation", () => {
  it("returns valid preview data for every event type", () => {
    for (const et of ["wedding", "engagement", "birthday", "housewarming"] as const) {
      const d = sampleInvitation(et);
      expect(d.eventType).toBe(et);
      expect(invitationDataSchema.safeParse(d).success).toBe(true);
    }
  });
});
