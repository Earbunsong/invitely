"use client";

import { useState, useTransition } from "react";
import { UploadButton } from "@/components/editor/fields";
import { setTemplateMusic } from "./actions";

/** Default song for a template: upload, preview, replace or remove. Saved immediately. */
export function TemplateMusicControl({ templateId, initialUrl, onChange }: { templateId: string; initialUrl?: string; onChange?: (url: string | undefined) => void }) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const save = (next: string | null) => {
    setError("");
    startTransition(async () => {
      const res = await setTemplateMusic(templateId, next);
      if (!res.ok) return setError(res.error ?? "Could not save music");
      setUrl(next ?? undefined);
      onChange?.(next ?? undefined);
    });
  };

  return (
    <div className="space-y-2">
      {url ? (
        <div className="flex items-center gap-2">
          <audio src={url} controls className="h-8 min-w-0 flex-1" />
          <button onClick={() => save(null)} disabled={pending} className="shrink-0 text-xs text-red-600">
            Remove
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted">No default song — invitations stay silent unless the client uploads one.</p>
      )}
      <UploadButton
        label={pending ? "Saving…" : url ? "Replace song" : "🎵 Upload default song"}
        accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac"
        kind="audio"
        fields={{ scope: "template" }}
        onUploaded={(u) => save(u)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
