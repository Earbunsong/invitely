"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { UploadButton, inputCls, Field } from "@/components/editor/fields";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { sampleInvitation } from "@/lib/demo-invitations";
import { EVENT_TYPES } from "@/lib/invitation";
import { EVENT_LABELS, PLANS, type EventType } from "@/lib/plans";
import type { TemplateConfig, TemplateStatus } from "@/lib/templates";
import { COVER_ARTS, OPENINGS, PARTICLES, SECTION_IDS, type SectionId, type Template } from "@/templates";
import { saveTemplate } from "./actions";

type Meta = { id: string; name: string; description: string; eventTypes: EventType[] };

const THEME_TOKENS: { key: keyof TemplateConfig["theme"]; label: string; hint?: string }[] = [
  { key: "background", label: "Page background", hint: "A colour, or a gradient like linear-gradient(180deg,#fff0f6,#ffe4ef)" },
  { key: "surface", label: "Card background" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Secondary text" },
  { key: "accent", label: "Accent (names, buttons)" },
  { key: "accentSoft", label: "Soft accent (highlights)" },
  { key: "border", label: "Borders" },
];

const SECTION_LABELS: Record<SectionId, string> = {
  details: "Names, date & venue",
  calendar: "Calendar + add to calendar",
  hero: "Cover photo",
  parents: "Parents & invitation text",
  countdown: "Countdown",
  story: "Love story (premium)",
  gallery: "Photo gallery",
  map: "Map",
  schedule: "Program / schedule",
  dresscode: "Colours & dress code",
  gift: "Digital gift (KHQR)",
  wishes: "RSVP & wishes",
  thanks: "Thank-you note",
  footer: "Footer",
};

function ColorField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  const isHex = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${label} colour picker`} value={isHex ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border" />
        <input className={`${inputCls} font-mono text-xs`} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      </div>
    </Field>
  );
}

export function TemplateForm({ initial, isNew }: { initial: { meta: Meta; config: TemplateConfig; status: TemplateStatus }; isNew: boolean }) {
  const router = useRouter();
  const [meta, setMeta] = useState<Meta>(initial.meta);
  const [config, setConfig] = useState<TemplateConfig>(initial.config);
  const [status, setStatus] = useState<TemplateStatus>(initial.status);
  const [previewEvent, setPreviewEvent] = useState<EventType>(initial.meta.eventTypes[0] ?? "wedding");
  const [previewKey, setPreviewKey] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const setTheme = (key: keyof TemplateConfig["theme"], value: string) => setConfig((c) => ({ ...c, theme: { ...c.theme, [key]: value } }));
  const set = <K extends keyof TemplateConfig>(k: K, v: TemplateConfig[K]) => setConfig((c) => ({ ...c, [k]: v }));

  const eventForPreview = meta.eventTypes.includes(previewEvent) ? previewEvent : (meta.eventTypes[0] ?? "wedding");
  const sample = useMemo(() => sampleInvitation(eventForPreview), [eventForPreview]);
  const template: Template = { ...config, id: meta.id || "preview", name: meta.name, description: meta.description, eventTypes: meta.eventTypes };

  const disabledSections = SECTION_IDS.filter((s) => !config.sections.includes(s));
  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...config.sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("sections", next);
  };

  const save = (nextStatus: TemplateStatus) => {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await saveTemplate({ isNew, meta, config, status: nextStatus });
      if (!res.ok) return setError(res.error);
      setStatus(nextStatus);
      setSaved(true);
      if (isNew) router.replace(`/admin/templates/${res.id}`);
      else router.refresh();
    });
  };

  return (
    <div className="flex h-dvh flex-col bg-[#f7f5f2] text-sm">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-white px-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/templates" className="text-muted underline">
            ← Templates
          </Link>
          <span className="font-heading font-semibold">{isNew ? "New template" : meta.name}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{status === "PUBLISHED" ? "Published" : "Draft"}</span>
        </div>
        <div className="flex items-center gap-2">
          {saved && !pending && <span className="text-xs text-muted">Saved ✓</span>}
          <button onClick={() => save("DRAFT")} disabled={pending} className="rounded-full border px-4 py-1.5 font-semibold disabled:opacity-60">
            {status === "PUBLISHED" ? "Save & unpublish" : "Save draft"}
          </button>
          <button onClick={() => save("PUBLISHED")} disabled={pending} className="btn-coral rounded-full px-4 py-1.5 font-semibold text-white disabled:opacity-60">
            {status === "PUBLISHED" ? "Save" : "Save & publish"}
          </button>
        </div>
      </header>
      {error && <p className="bg-red-50 px-4 py-2 text-red-700">{error}</p>}

      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 w-full space-y-5 overflow-y-auto p-5 lg:w-[520px] lg:border-r">
          <section className="space-y-3 rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sage">Details</p>
            <Field label="Name">
              <input className={inputCls} value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} placeholder="Princess Party" />
            </Field>
            <Field label="ID (used in links and the database)" hint={isNew ? "Lowercase letters, numbers and dashes. Can't be changed later." : "Can't be changed."}>
              <input
                className={`${inputCls} font-mono`}
                value={meta.id}
                disabled={!isNew}
                onChange={(e) => setMeta({ ...meta, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder="princess-party-2"
              />
            </Field>
            <Field label="Short description (shown to customers)">
              <input className={inputCls} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
            </Field>
            <div>
              <span className="mb-1 block text-xs font-semibold text-ink/80">Event types</span>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((et) => (
                  <label key={et} className={`cursor-pointer rounded-full border px-3 py-1.5 ${meta.eventTypes.includes(et) ? "border-sage bg-sage-soft text-sage-dark" : ""}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={meta.eventTypes.includes(et)}
                      onChange={(e) => setMeta({ ...meta, eventTypes: e.target.checked ? [...meta.eventTypes, et] : meta.eventTypes.filter((x) => x !== et) })}
                    />
                    {EVENT_LABELS[et].emoji} {EVENT_LABELS[et].en}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sage">Cover</p>
            <Field label="Cover artwork">
              <select className={inputCls} value={config.cover} onChange={(e) => set("cover", e.target.value as TemplateConfig["cover"])}>
                <option value="image">🖼️ Uploaded image</option>
                {COVER_ARTS.map((a) => (
                  <option key={a} value={a}>
                    Built-in art: {a}
                  </option>
                ))}
              </select>
            </Field>
            {config.cover === "image" && (
              <div className="space-y-2">
                {config.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={config.coverImage} alt="Cover" className="h-40 w-full rounded-xl object-cover" />
                )}
                <UploadButton
                  label={config.coverImage ? "Replace cover image" : "+ Upload cover image (portrait works best)"}
                  accept="image/jpeg,image/png,image/webp"
                  kind="image"
                  fields={{ scope: "template" }}
                  onUploaded={(url) => set("coverImage", url)}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening animation">
                <select className={inputCls} value={config.opening} onChange={(e) => set("opening", e.target.value as TemplateConfig["opening"])}>
                  {OPENINGS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Falling particles">
                <select className={inputCls} value={config.particles} onChange={(e) => set("particles", e.target.value as TemplateConfig["particles"])}>
                  {PARTICLES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sage">Colours & fonts</p>
            {THEME_TOKENS.map((tok) => (
              <ColorField key={tok.key} label={tok.label} hint={tok.hint} value={config.theme[tok.key] as string} onChange={(v) => setTheme(tok.key, v)} />
            ))}
            <ColorField label="Gallery card background" hint="Shown on template cards when there's no cover image" value={config.swatch} onChange={(v) => set("swatch", v)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name font (English)">
                <select className={inputCls} value={config.theme.display} onChange={(e) => setTheme("display", e.target.value)}>
                  <option value="script">Script (Great Vibes)</option>
                  <option value="serif">Serif (Cormorant)</option>
                  <option value="sans">Sans (Poppins)</option>
                </select>
              </Field>
              <Field label="Name font (Khmer)">
                <select className={inputCls} value={config.theme.kmDisplay} onChange={(e) => setTheme("kmDisplay", e.target.value)}>
                  <option value="moul">Moul (decorative)</option>
                  <option value="kantumruy">Kantumruy (modern)</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-2 rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sage">Sections (order on the page)</p>
            {config.sections.map((s, i) => (
              <div key={s} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <span className="flex-1">{SECTION_LABELS[s]}</span>
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="px-1 disabled:opacity-30" aria-label={`Move ${SECTION_LABELS[s]} up`}>
                  ▲
                </button>
                <button onClick={() => moveSection(i, 1)} disabled={i === config.sections.length - 1} className="px-1 disabled:opacity-30" aria-label={`Move ${SECTION_LABELS[s]} down`}>
                  ▼
                </button>
                <button onClick={() => set("sections", config.sections.filter((x) => x !== s))} disabled={config.sections.length === 1} className="text-xs text-red-600 disabled:opacity-30">
                  Hide
                </button>
              </div>
            ))}
            {disabledSections.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {disabledSections.map((s) => (
                  <button key={s} onClick={() => set("sections", [...config.sections, s])} className="rounded-full border-2 border-dashed px-3 py-1 text-xs text-sage">
                    + {SECTION_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Live preview */}
        <div className="hidden min-h-0 flex-1 flex-col items-center gap-3 overflow-hidden p-6 lg:flex">
          <div className="flex flex-wrap items-center gap-2">
            <select className={`${inputCls} w-auto`} value={eventForPreview} onChange={(e) => setPreviewEvent(e.target.value as EventType)} aria-label="Preview event type">
              {(meta.eventTypes.length ? meta.eventTypes : (["wedding"] as EventType[])).map((et) => (
                <option key={et} value={et}>
                  Preview as {EVENT_LABELS[et].en}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setShowCover(true);
                setPreviewKey((k) => k + 1);
              }}
              className="rounded-full border bg-white px-3 py-2 text-xs font-semibold"
            >
              ▶ Replay cover & opening
            </button>
            <button onClick={() => setShowCover(false)} className="rounded-full border bg-white px-3 py-2 text-xs font-semibold">
              Skip to content
            </button>
          </div>
          <div className="relative h-[min(844px,100%)] w-full max-w-[400px] overflow-hidden rounded-[2.5rem] border-[10px] border-neutral-900 bg-white shadow-2xl" style={{ transform: "translateZ(0)" }}>
            <div className="h-full overflow-y-auto">
              <InvitationRenderer key={`${previewKey}-${showCover}`} data={sample} template={template} features={PLANS["wedding-premium"].features} slug="preview" preview startOpen={!showCover} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
