import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isUploadKind, UPLOAD_LIMITS, uploadFolder } from "@/lib/uploads";

/** Tells the browser whether direct-to-Blob uploads are available (false in local dev without a Blob token). */
export async function GET() {
  return NextResponse.json({ direct: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

/**
 * Issues a short-lived token so the browser uploads straight to Vercel Blob (no 4.5 MB function body limit).
 * The same permission rules as /api/upload apply: the target folder, file type and size are checked here.
 */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Direct upload is not available" }, { status: 503 });
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: { kind?: unknown; scope?: string; invitationId?: string } = {};
        try {
          payload = JSON.parse(clientPayload ?? "{}");
        } catch {
          throw new Error("Invalid upload request");
        }
        if (!isUploadKind(payload.kind)) throw new Error("Invalid file kind");
        const folder = await uploadFolder({ scope: payload.scope, invitationId: payload.invitationId });
        if (!folder) throw new Error("Please sign in.");
        if (!pathname.startsWith(`${folder}/`) || pathname.includes("..")) throw new Error("Not allowed to upload here");
        const rule = UPLOAD_LIMITS[payload.kind];
        return { allowedContentTypes: rule.types, maximumSizeInBytes: rule.maxBytes, addRandomSuffix: true };
      },
      // Nothing to record: the editor saves the returned URL itself.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = (e as Error).message;
    return NextResponse.json({ error: message }, { status: message === "Please sign in." ? 401 : 400 });
  }
}
