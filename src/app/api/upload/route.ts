import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { getSessionInvitationId, isAdmin } from "@/lib/auth";

const LIMITS: Record<string, { types: string[]; maxBytes: number }> = {
  image: { types: ["image/jpeg", "image/png", "image/webp"], maxBytes: 8 * 1024 * 1024 },
  audio: { types: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac"], maxBytes: 12 * 1024 * 1024 },
};

/**
 * Uploads a photo or music file for the signed-in customer's invitation.
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise public/uploads (local dev only).
 * Note: Vercel limits request bodies to ~4.5 MB, so the editor resizes photos before upload.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  // Customers upload into their own invitation; the admin may upload for any invitation or a template cover.
  const admin = await isAdmin();
  const requested = String(form.get("invitationId") ?? "");
  const scope = String(form.get("scope") ?? "");
  let folder: string | null = null;
  if (admin && scope === "template") folder = "templates";
  else if (admin && /^[a-z0-9]{10,40}$/.test(requested)) folder = `inv/${requested}`;
  else {
    const invitationId = await getSessionInvitationId();
    if (invitationId) folder = `inv/${invitationId}`;
  }
  if (!folder) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const file = form.get("file");
  const kind = String(form.get("kind") ?? "image");
  const rule = LIMITS[kind];
  if (!(file instanceof File) || !rule) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!rule.types.includes(file.type)) return NextResponse.json({ error: `Unsupported file type ${file.type}` }, { status: 400 });
  if (file.size > rule.maxBytes) return NextResponse.json({ error: `File too large (max ${rule.maxBytes / 1024 / 1024} MB)` }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const name = `${folder}/${nanoid(10)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url });
  }
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
