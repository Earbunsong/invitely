"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { Logo } from "@/components/site/Logo";
import { SCHEDULE_ICONS, type InvitationData } from "@/lib/invitation";
import type { Plan } from "@/lib/plans";
import { getTemplate } from "@/templates";
import { Field, inputCls, LInput, UploadButton } from "./fields";
import { GuestsPanel } from "./GuestsPanel";

type Tab = "design" | "details" | "message" | "program" | "photos" | "extras" | "guests" | "share";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "design", label: "Design", icon: "🎨" },
  { id: "details", label: "Details", icon: "📝" },
  { id: "message", label: "Message", icon: "💌" },
  { id: "program", label: "Program", icon: "🕒" },
  { id: "photos", label: "Photos", icon: "📸" },
  { id: "extras", label: "Extras", icon: "✨" },
  { id: "guests", label: "Guests", icon: "👥" },
  { id: "share", label: "Publish", icon: "🚀" },
];

const ICON_EMOJI: Record<string, string> = { ring: "💍", music: "🎶", food: "🍽️", camera: "📸", monk: "🙏", cake: "🎂", toast: "🥂", home: "🏡", gift: "🎁", heart: "💞", car: "🚗", star: "✨" };

export function Editor(props: {
  invitationId: string;
  slug: string;
  initialStatus: "DRAFT" | "PUBLISHED";
  initialData: InvitationData;
  initialTemplateId: string;
  plan: Plan;
  templateIds: string[];
  appUrl: string;
}) {
  const { invitationId, slug, plan } = props;
  const [data, setData] = useState<InvitationData>(props.initialData);
  const [templateId, setTemplateId] = useState(props.initialTemplateId);
  const [status, setStatus] = useState(props.initialStatus);
  const [tab, setTab] = useState<Tab>("design");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const savedSnapshot = useRef(JSON.stringify([props.initialData, props.initialTemplateId]));
  const dirty = JSON.stringify([data, templateId]) !== savedSnapshot.current;

  const set = <K extends keyof InvitationData>(k: K, v: InvitationData[K]) => setData((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (publish = false) => {
    setSaving("saving");
    setError("");
    const res = await fetch(`/api/invitations/${invitationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, templateId, publish }),
    });
    const j = await res.json();
    if (!res.ok) {
      setSaving("error");
      setError(j.error ?? "Could not save");
      return false;
    }
    setStatus(j.status);
    savedSnapshot.current = JSON.stringify([data, templateId]);
    setSaving("saved");
    setTimeout(() => setSaving("idle"), 1500);
    return true;
  };

  const template = getTemplate(templateId);
  const origin = props.appUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const publicUrl = `${origin}/i/${slug}`;
  const couple = data.eventType === "wedding" || data.eventType === "engagement";

  return (
    <div className="flex h-dvh flex-col bg-[#f7f5f2]">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-white px-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo />
          </Link>
          <span className={`hidden rounded-full px-2 py-0.5 text-[11px] font-bold sm:inline ${status === "PUBLISHED" ? "bg-sage-soft text-sage-dark" : "bg-amber-100 text-amber-800"}`}>{status === "PUBLISHED" ? "Published" : "Draft"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobilePreview((m) => !m)} className="rounded-full border px-3 py-1.5 text-sm lg:hidden">
            {mobilePreview ? "✏️ Edit" : "👁 Preview"}
          </button>
          <span className="hidden text-xs text-muted sm:inline">{saving === "saving" ? "Saving…" : saving === "saved" ? "Saved ✓" : dirty ? "Unsaved changes" : ""}</span>
          <button onClick={() => save(false)} disabled={saving === "saving"} className="btn-sage rounded-full px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
            Save
          </button>
        </div>
      </header>
      {error && <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex min-h-0 flex-1">
        {/* Form panel */}
        <div className={`min-h-0 w-full flex-col lg:flex lg:w-[520px] lg:border-r ${mobilePreview ? "hidden" : "flex"}`}>
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b bg-white px-2 py-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${tab === t.id ? "bg-sage text-white" : "text-ink/70 hover:bg-sage-soft"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            {tab === "design" && (
              <>
                <Field label="Template">
                  <div className="grid grid-cols-2 gap-3">
                    {props.templateIds.map((id) => {
                      const t = getTemplate(id);
                      return (
                        <button key={id} onClick={() => setTemplateId(id)} className={`overflow-hidden rounded-2xl border-2 text-left ${templateId === id ? "border-sage ring-2 ring-sage/30" : "border-transparent"}`}>
                          <div className="h-24" style={{ background: t.swatch }} />
                          <div className="bg-white p-2">
                            <p className="text-sm font-semibold">{t.name}</p>
                            <p className="text-[11px] text-muted">{t.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Field>
                {plan.features.openingChoice && (
                  <Field label="Opening animation" hint="Premium: override the template's default opening.">
                    <select className={inputCls} value={data.opening ?? ""} onChange={(e) => set("opening", (e.target.value || undefined) as InvitationData["opening"])}>
                      <option value="">Template default ({template.opening})</option>
                      <option value="curtain">Curtain + photo stack</option>
                      <option value="envelope">Envelope</option>
                      <option value="fade">Simple fade</option>
                    </select>
                  </Field>
                )}
                <Field label="Default language for guests">
                  <select className={inputCls} value={data.defaultLocale} onChange={(e) => set("defaultLocale", e.target.value as "en" | "km")}>
                    <option value="km">ខ្មែរ (Khmer)</option>
                    <option value="en">English</option>
                  </select>
                </Field>
                <button onClick={() => setPreviewKey((k) => k + 1)} className="text-sm font-semibold text-sage underline">
                  ▶ Replay cover & opening animation in preview
                </button>
              </>
            )}

            {tab === "details" && (
              <>
                <LInput label="Cover heading" value={data.title} onChange={(v) => set("title", v)} />
                {data.hosts.map((h, i) => (
                  <LInput
                    key={i}
                    label={couple ? (i === 0 ? "Groom name" : "Bride name") : data.eventType === "birthday" ? "Celebrant name" : "Host / family name"}
                    value={h}
                    onChange={(v) => set("hosts", data.hosts.map((x, k) => (k === i ? v : x)))}
                  />
                ))}
                {data.eventType === "birthday" && (
                  <Field label="Age (optional)">
                    <input type="number" min={0} max={150} className={inputCls} value={data.age ?? ""} onChange={(e) => set("age", e.target.value === "" ? undefined : Number(e.target.value))} />
                  </Field>
                )}
                {couple && data.parents && (
                  <div className="space-y-3 rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-sage">Parents</p>
                    <LInput label="Groom's father" value={data.parents.left.father} onChange={(v) => set("parents", { ...data.parents!, left: { ...data.parents!.left, father: v } })} />
                    <LInput label="Groom's mother" value={data.parents.left.mother} onChange={(v) => set("parents", { ...data.parents!, left: { ...data.parents!.left, mother: v } })} />
                    <LInput label="Bride's father" value={data.parents.right.father} onChange={(v) => set("parents", { ...data.parents!, right: { ...data.parents!.right, father: v } })} />
                    <LInput label="Bride's mother" value={data.parents.right.mother} onChange={(v) => set("parents", { ...data.parents!, right: { ...data.parents!.right, mother: v } })} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date">
                    <input type="date" className={inputCls} value={data.date} onChange={(e) => e.target.value && set("date", e.target.value)} />
                  </Field>
                  <Field label="Time">
                    <input type="time" className={inputCls} value={data.time} onChange={(e) => e.target.value && set("time", e.target.value)} />
                  </Field>
                </div>
                <LInput label="Venue name" value={data.venue.name} onChange={(v) => set("venue", { ...data.venue, name: v })} />
                <LInput label="Venue address" value={data.venue.address} onChange={(v) => set("venue", { ...data.venue, address: v })} />
                <Field label="Google Maps search or coordinates" hint='Paste a place name (e.g. "Sokha Phnom Penh Hotel") or "11.5564,104.9282".'>
                  <input className={inputCls} value={data.venue.mapQuery} onChange={(e) => set("venue", { ...data.venue, mapQuery: e.target.value })} />
                </Field>
              </>
            )}

            {tab === "message" && (
              <>
                <LInput label="Invitation message" multiline value={data.message} onChange={(v) => set("message", v)} />
                <LInput label="Thank-you note (optional)" multiline value={data.thanks} onChange={(v) => set("thanks", v)} />
                {plan.features.loveStory && (
                  <div className="space-y-3 rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-sage">Love story (Premium)</p>
                    {data.loveStory.map((s, i) => (
                      <div key={i} className="space-y-2 border-b pb-3">
                        <div className="flex gap-2">
                          <input className={`${inputCls} w-24`} placeholder="Year" value={s.year} onChange={(e) => set("loveStory", data.loveStory.map((x, k) => (k === i ? { ...x, year: e.target.value } : x)))} />
                          <button onClick={() => set("loveStory", data.loveStory.filter((_, k) => k !== i))} className="ml-auto text-xs text-red-600">
                            Remove
                          </button>
                        </div>
                        <LInput label="Title" value={s.title} onChange={(v) => set("loveStory", data.loveStory.map((x, k) => (k === i ? { ...x, title: v } : x)))} />
                        <LInput label="Text" value={s.text} onChange={(v) => set("loveStory", data.loveStory.map((x, k) => (k === i ? { ...x, text: v } : x)))} />
                      </div>
                    ))}
                    {data.loveStory.length < 8 && (
                      <button onClick={() => set("loveStory", [...data.loveStory, { year: "", title: { en: "", km: "" }, text: { en: "", km: "" } }])} className="text-sm font-semibold text-sage">
                        + Add moment
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {tab === "program" && (
              <div className="space-y-3">
                {data.schedule.map((s, i) => (
                  <div key={i} className="space-y-2 rounded-2xl bg-white p-3">
                    <div className="flex items-center gap-2">
                      <input type="time" className={`${inputCls} w-32`} value={s.time} onChange={(e) => set("schedule", data.schedule.map((x, k) => (k === i ? { ...x, time: e.target.value } : x)))} />
                      <select className={`${inputCls} w-32`} value={s.icon} onChange={(e) => set("schedule", data.schedule.map((x, k) => (k === i ? { ...x, icon: e.target.value as (typeof SCHEDULE_ICONS)[number] } : x)))}>
                        {SCHEDULE_ICONS.map((ic) => (
                          <option key={ic} value={ic}>
                            {ICON_EMOJI[ic]} {ic}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => set("schedule", data.schedule.filter((_, k) => k !== i))} className="ml-auto text-xs text-red-600">
                        Remove
                      </button>
                    </div>
                    <LInput label="Activity" value={s.title} onChange={(v) => set("schedule", data.schedule.map((x, k) => (k === i ? { ...x, title: v } : x)))} />
                  </div>
                ))}
                <button onClick={() => set("schedule", [...data.schedule, { time: "08:00", icon: "star", title: { en: "", km: "" } }])} className="rounded-xl border-2 border-dashed border-sage/50 px-4 py-2 text-sm font-semibold text-sage">
                  + Add program item
                </button>
              </div>
            )}

            {tab === "photos" && (
              <>
                <p className="text-sm text-muted">
                  {data.photos.length} / {plan.limits.photos} photos. Tap ★ to choose the cover photo.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {data.photos.map((p, i) => (
                    <div key={p + i} className="group relative overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt="" className="aspect-square w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 p-1 text-xs text-white">
                        <button onClick={() => set("coverPhoto", p)} title="Use as cover" className={data.coverPhoto === p ? "text-amber-300" : ""}>
                          ★
                        </button>
                        <button onClick={() => i > 0 && set("photos", data.photos.map((x, k) => (k === i - 1 ? p : k === i ? data.photos[i - 1] : x)))} title="Move left">
                          ◀
                        </button>
                        <button
                          onClick={() => {
                            set("photos", data.photos.filter((_, k) => k !== i));
                            if (data.coverPhoto === p) set("coverPhoto", "");
                          }}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {data.photos.length < plan.limits.photos && (
                  <UploadButton
                    label="+ Upload photos"
                    accept="image/jpeg,image/png,image/webp"
                    kind="image"
                    multiple
                    onUploaded={(url) =>
                      setData((d) => (d.photos.length >= plan.limits.photos ? d : { ...d, photos: [...d.photos, url], coverPhoto: d.coverPhoto || url }))
                    }
                  />
                )}
              </>
            )}

            {tab === "extras" && (
              <>
                <Field label="Theme / dress-code colors">
                  <div className="flex flex-wrap items-center gap-2">
                    {data.colors.map((c, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full border bg-white p-1 pr-2">
                        <input type="color" value={c} onChange={(e) => set("colors", data.colors.map((x, k) => (k === i ? e.target.value : x)))} className="h-7 w-7 cursor-pointer rounded-full" />
                        <button onClick={() => set("colors", data.colors.filter((_, k) => k !== i))} className="text-xs text-muted">
                          ✕
                        </button>
                      </span>
                    ))}
                    {data.colors.length < 8 && (
                      <button onClick={() => set("colors", [...data.colors, "#c8a26b"])} className="rounded-full border-2 border-dashed px-3 py-1 text-sm text-sage">
                        + color
                      </button>
                    )}
                  </div>
                </Field>
                {plan.features.dressCode && <LInput label="Dress code (optional)" value={data.dressCode} onChange={(v) => set("dressCode", v)} />}
                {plan.features.music && (
                  <Field label="Background music" hint="MP3 / M4A up to 12 MB. Plays after the guest taps Open.">
                    {data.musicUrl ? (
                      <div className="flex items-center gap-2">
                        <audio src={data.musicUrl} controls className="h-9 flex-1" />
                        <button onClick={() => set("musicUrl", "")} className="text-xs text-red-600">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <UploadButton label="+ Upload music" accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac" kind="audio" onUploaded={(url) => set("musicUrl", url)} />
                    )}
                  </Field>
                )}
                {plan.features.gift && (
                  <div className="space-y-3 rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-sage">Digital gift (KHQR)</p>
                    {data.gift?.qrUrl ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.gift.qrUrl} alt="KHQR" className="h-24 w-24 rounded-lg object-contain" />
                        <button onClick={() => set("gift", undefined)} className="text-xs text-red-600">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <UploadButton label="+ Upload your KHQR image" accept="image/jpeg,image/png,image/webp" kind="image" onUploaded={(url) => set("gift", { qrUrl: url, note: data.gift?.note ?? { en: "", km: "" } })} />
                    )}
                    {data.gift?.qrUrl && <LInput label="Note under the QR" value={data.gift.note} onChange={(v) => set("gift", { ...data.gift!, note: v })} />}
                  </div>
                )}
              </>
            )}

            {tab === "guests" && <GuestsPanel invitationId={invitationId} publicUrl={publicUrl} limit={plan.limits.namedGuests} />}

            {tab === "share" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-5">
                  <p className="font-heading font-semibold">{status === "PUBLISHED" ? "Your invitation is live 🎉" : "Ready to share?"}</p>
                  <p className="mt-1 text-sm text-muted">
                    {status === "PUBLISHED" ? "Changes you save appear instantly for everyone with the link." : "Publishing makes the link below work for your guests. You can keep editing afterwards."}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input readOnly value={publicUrl} className={inputCls} />
                    <button onClick={() => navigator.clipboard.writeText(publicUrl)} className="rounded-xl bg-sage-soft px-3 text-sm font-semibold text-sage-dark">
                      Copy
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {status !== "PUBLISHED" && (
                      <button onClick={() => save(true)} className="btn-coral rounded-full px-5 py-2.5 font-heading font-semibold text-white">
                        Publish invitation
                      </button>
                    )}
                    <a href={`/i/${slug}`} target="_blank" className="rounded-full border px-5 py-2.5 text-sm font-semibold">
                      Open ↗
                    </a>
                    {status === "PUBLISHED" && (
                      <>
                        <a href={`https://t.me/share/url?url=${encodeURIComponent(publicUrl)}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#229ED9] px-5 py-2.5 text-sm font-semibold text-white">
                          Share on Telegram
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#1877F2] px-5 py-2.5 text-sm font-semibold text-white">
                          Facebook
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/login", { method: "DELETE" });
                    window.location.href = "/";
                  }}
                  className="text-sm text-muted underline"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className={`min-h-0 flex-1 items-start justify-center overflow-hidden lg:flex lg:p-6 ${mobilePreview ? "flex" : "hidden"}`}>
          {/* transform on the (non-scrolling) frame makes position:fixed children — cover, top bar, dock — stay inside it */}
          <div
            className="relative h-full w-full max-w-[400px] overflow-hidden bg-white lg:h-[min(844px,100%)] lg:rounded-[2.5rem] lg:border-[10px] lg:border-neutral-900 lg:shadow-2xl"
            style={{ transform: "translateZ(0)" }}
          >
            <div className="h-full overflow-y-auto">
              <InvitationRenderer key={previewKey} data={data} template={template} features={plan.features} slug={slug} preview startOpen={previewKey === 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
