"use client";

import { useRef, useState } from "react";
import type { LText } from "@/lib/invitation";

export const inputCls = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sage/40";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

/** English + Khmer inputs for one bilingual text. */
export function LInput({ label, value, onChange, multiline = false, hint }: { label: string; value: LText | undefined; onChange: (v: LText) => void; multiline?: boolean; hint?: string }) {
  const v = value ?? { en: "", km: "" };
  const Comp = multiline ? "textarea" : "input";
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-ink/80">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        <Comp aria-label={`${label} (English)`} className={inputCls} rows={multiline ? 4 : undefined} placeholder="English" value={v.en} onChange={(e) => onChange({ ...v, en: e.target.value })} />
        <Comp aria-label={`${label} (Khmer)`} className={`${inputCls} km`} rows={multiline ? 4 : undefined} placeholder="ខ្មែរ" value={v.km} onChange={(e) => onChange({ ...v, km: e.target.value })} lang="km" />
      </div>
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </div>
  );
}

/** Downscale photos in the browser so uploads stay small (and under Vercel's body limit). */
async function resizeImage(file: File, max = 1600): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

const MAX_BYTES: Record<"image" | "audio", number> = { image: 8 * 1024 * 1024, audio: 12 * 1024 * 1024 };

/** Whether the server can hand out direct-to-Blob upload tokens (production). Cached per page load. */
let directUploadCheck: Promise<boolean> | null = null;
function canUploadDirect(): Promise<boolean> {
  directUploadCheck ??= fetch("/api/upload/token")
    .then((r) => (r.ok ? r.json() : { direct: false }))
    .then((j) => Boolean(j.direct))
    .catch(() => false);
  return directUploadCheck;
}

/**
 * Uploads a photo or song. In production the file goes straight from the browser to Vercel Blob
 * (the server only issues a checked, short-lived token), avoiding Vercel's 4.5 MB request limit.
 * In local dev it is posted to /api/upload and saved under public/uploads.
 * `fields` are extra values, e.g. { invitationId } for editor uploads or { scope: "template" } for admin.
 */
export function useUploader(fields: Record<string, string> = {}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const upload = async (original: File, kind: "image" | "audio"): Promise<string | null> => {
    setBusy(true);
    setError("");
    try {
      const file = kind === "image" ? new File([await resizeImage(original)], original.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : original;
      if (file.size > MAX_BYTES[kind]) throw new Error(`File too large (max ${MAX_BYTES[kind] / 1024 / 1024} MB)`);

      if (await canUploadDirect()) {
        const { upload: uploadToBlob } = await import("@vercel/blob/client");
        const folder = fields.scope === "template" ? "templates" : `inv/${fields.invitationId ?? "unknown"}`;
        const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
        const blob = await uploadToBlob(`${folder}/${kind}.${ext}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload/token",
          contentType: file.type,
          clientPayload: JSON.stringify({ kind, ...fields }),
        });
        return blob.url;
      }

      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      for (const [k, v] of Object.entries(fields)) body.append(k, v);
      const res = await fetch("/api/upload", { method: "POST", body });
      const j = await res.json().catch(() => ({ error: res.status === 413 ? "File too large for the server" : `Upload failed (${res.status})` }));
      if (!res.ok) throw new Error(j.error ?? "Upload failed");
      return j.url as string;
    } catch (e) {
      setError((e as Error).message || "Upload failed");
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { upload, busy, error };
}

export function UploadButton({
  label,
  accept,
  kind,
  onUploaded,
  multiple = false,
  fields,
}: {
  label: string;
  accept: string;
  kind: "image" | "audio";
  onUploaded: (url: string) => void;
  multiple?: boolean;
  fields?: Record<string, string>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useUploader(fields);
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          for (const f of files) {
            const url = await upload(f, kind);
            if (url) onUploaded(url);
          }
          e.target.value = "";
        }}
      />
      <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="rounded-xl border-2 border-dashed border-sage/50 px-4 py-2.5 text-sm font-semibold text-sage hover:bg-sage-soft disabled:opacity-50">
        {busy ? "Uploading…" : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
