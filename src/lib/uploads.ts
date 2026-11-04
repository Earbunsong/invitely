import { getSessionInvitationId, isAdmin } from "./auth";

export type UploadKind = "image" | "audio";

export const UPLOAD_LIMITS: Record<UploadKind, { types: string[]; maxBytes: number }> = {
  image: { types: ["image/jpeg", "image/png", "image/webp"], maxBytes: 8 * 1024 * 1024 },
  audio: { types: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac"], maxBytes: 12 * 1024 * 1024 },
};

export function isUploadKind(v: unknown): v is UploadKind {
  return v === "image" || v === "audio";
}

/**
 * The storage folder the current visitor may upload into, or null if not allowed:
 * customers → their own invitation; admin → any invitation or "templates" (covers, default music).
 */
export async function uploadFolder(opts: { scope?: string; invitationId?: string }): Promise<string | null> {
  const admin = await isAdmin();
  if (admin && opts.scope === "template") return "templates";
  if (admin && opts.invitationId && /^[a-z0-9]{10,40}$/.test(opts.invitationId)) return `inv/${opts.invitationId}`;
  const own = await getSessionInvitationId();
  return own ? `inv/${own}` : null;
}

export function safeExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
}
