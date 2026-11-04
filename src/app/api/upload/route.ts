import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { isUploadKind, safeExtension, UPLOAD_LIMITS, uploadFolder } from "@/lib/uploads";

/**
 * Uploads a small file through the server (local dev, or Blob when direct upload isn't available).
 * Vercel limits request bodies to ~4.5 MB, so in production the editor uploads straight to Blob
 * via /api/upload/token instead; see src/components/editor/fields.tsx.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const folder = await uploadFolder({ scope: String(form.get("scope") ?? ""), invitationId: String(form.get("invitationId") ?? "") });
  if (!folder) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const file = form.get("file");
  const kind = form.get("kind") ?? "image";
  if (!(file instanceof File) || !isUploadKind(kind)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const rule = UPLOAD_LIMITS[kind];
  if (!rule.types.includes(file.type)) return NextResponse.json({ error: `Unsupported file type ${file.type}` }, { status: 400 });
  if (file.size > rule.maxBytes) return NextResponse.json({ error: `File too large (max ${rule.maxBytes / 1024 / 1024} MB)` }, { status: 400 });

  const name = `${folder}/${nanoid(10)}.${safeExtension(file.name)}`;

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
