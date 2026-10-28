import { z } from "zod";
import type { EventType } from "@/lib/plans";
import { COVER_ARTS, defaultTemplateFor, OPENINGS, PARTICLES, SECTION_IDS, TEMPLATES, type Template } from "@/templates";
import { EVENT_TYPES } from "./invitation";

/**
 * Templates come from two places:
 *  - built-in templates in code (src/templates/index.ts) — always available, read-only in admin;
 *  - custom templates created in /admin/templates (Template table) — visible to customers once PUBLISHED.
 */

/** A CSS colour or gradient. Blocks url(), semicolons and braces so values can't load resources or break out of the style. */
const cssValue = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(/^[#a-zA-Z0-9(),.%\s-]+$/, "Use a colour like #ffeedd, rgba(…) or linear-gradient(…)");

const imageUrl = z
  .string()
  .max(1000)
  .refine((v) => /^https:\/\//.test(v) || v.startsWith("/uploads/"), "Cover image must be an uploaded image");

export const templateConfigSchema = z
  .object({
    theme: z.object({
      background: cssValue,
      surface: cssValue,
      text: cssValue,
      muted: cssValue,
      accent: cssValue,
      accentSoft: cssValue,
      border: cssValue,
      display: z.enum(["serif", "script", "sans"]),
      kmDisplay: z.enum(["moul", "kantumruy"]),
    }),
    cover: z.enum([...COVER_ARTS, "image"] as const),
    coverImage: imageUrl.optional(),
    opening: z.enum(OPENINGS),
    particles: z.enum(PARTICLES),
    sections: z
      .array(z.enum(SECTION_IDS))
      .min(1)
      .refine((s) => new Set(s).size === s.length, "Each section can appear only once"),
    swatch: cssValue,
  })
  .refine((c) => c.cover !== "image" || Boolean(c.coverImage), { message: "Upload a cover image", path: ["coverImage"] });

export type TemplateConfig = z.infer<typeof templateConfigSchema>;

export const templateMetaSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/, "Use 3–40 lowercase letters, numbers and dashes"),
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(200).default(""),
  eventTypes: z.array(z.enum(EVENT_TYPES)).min(1, "Pick at least one event type"),
});

export type TemplateStatus = "DRAFT" | "PUBLISHED";

export type ListedTemplate = Template & { source: "builtin" | "custom"; status: TemplateStatus; sortOrder: number };

type TemplateRow = {
  id: string;
  name: string;
  description: string;
  eventTypes: string[];
  config: unknown;
  status: TemplateStatus;
  sortOrder: number;
};

const BUILTIN_IDS = new Set(TEMPLATES.map((t) => t.id));

export function isBuiltinTemplate(id: string) {
  return BUILTIN_IDS.has(id);
}

/** Turns a DB row into a Template, or null if its stored config is no longer valid. */
export function rowToTemplate(row: TemplateRow): ListedTemplate | null {
  const config = templateConfigSchema.safeParse(row.config);
  const meta = templateMetaSchema.safeParse({ id: row.id, name: row.name, description: row.description, eventTypes: row.eventTypes });
  if (!config.success || !meta.success) return null;
  return { ...config.data, ...meta.data, source: "custom", status: row.status, sortOrder: row.sortOrder };
}

/** Built-ins first (in code order), then custom templates by sortOrder/name. Custom rows can't shadow a built-in id. */
export function mergeTemplates(builtins: Template[], rows: TemplateRow[], opts: { includeDrafts?: boolean; eventType?: EventType } = {}): ListedTemplate[] {
  const custom = rows
    .filter((r) => !BUILTIN_IDS.has(r.id) && (opts.includeDrafts || r.status === "PUBLISHED"))
    .map(rowToTemplate)
    .filter((t): t is ListedTemplate => t !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const all: ListedTemplate[] = [...builtins.map((t, i) => ({ ...t, source: "builtin" as const, status: "PUBLISHED" as const, sortOrder: i })), ...custom];
  return opts.eventType ? all.filter((t) => t.eventTypes.includes(opts.eventType!)) : all;
}

/** The template an invitation should render: its own if still usable for the event type, otherwise the default. */
export function pickTemplate(id: string, eventType: EventType, candidates: Template[]): Template {
  const found = candidates.find((t) => t.id === id && t.eventTypes.includes(eventType));
  return found ?? defaultTemplateFor(eventType);
}

async function loadRows(): Promise<TemplateRow[]> {
  // Imported lazily so the pure helpers above can be unit-tested without a database.
  const { prisma } = await import("./prisma");
  return prisma.template.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function listTemplates(opts: { includeDrafts?: boolean; eventType?: EventType } = {}): Promise<ListedTemplate[]> {
  return mergeTemplates(TEMPLATES, await loadRows(), opts);
}

export async function resolveTemplate(id: string, eventType: EventType): Promise<Template> {
  if (BUILTIN_IDS.has(id)) return pickTemplate(id, eventType, TEMPLATES);
  return pickTemplate(id, eventType, await listTemplates());
}
