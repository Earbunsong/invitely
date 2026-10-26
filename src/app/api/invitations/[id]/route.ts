import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { invitationDataSchema } from "@/lib/invitation";
import { ownedInvitation } from "@/lib/owner";
import { getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/templates";

const body = z.object({
  data: invitationDataSchema.optional(),
  templateId: z.string().optional(),
  publish: z.boolean().optional(),
});

/** Save draft changes and/or publish. Plan limits are enforced here, not just in the editor. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await ownedInvitation(id);
  if (!inv) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join(".")}: ${issue?.message}` }, { status: 400 });
  }
  const plan = getPlan(inv.plan);
  if (!plan) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  const update: Prisma.InvitationUpdateInput = {};
  if (parsed.data.data) {
    const data = parsed.data.data;
    if (!plan.eventTypes.includes(data.eventType)) return NextResponse.json({ error: "Event type not included in your plan" }, { status: 400 });
    if (data.photos.length > plan.limits.photos) return NextResponse.json({ error: `Your plan allows up to ${plan.limits.photos} photos.` }, { status: 400 });
    if (!plan.features.loveStory) data.loveStory = [];
    if (!plan.features.openingChoice) delete data.opening;
    update.data = data as unknown as Prisma.InputJsonValue;
  }
  if (parsed.data.templateId) {
    const tpl = getTemplate(parsed.data.templateId);
    const eventType = parsed.data.data?.eventType ?? (inv.data as { eventType: string }).eventType;
    if (tpl.id !== parsed.data.templateId || !tpl.eventTypes.includes(eventType as never)) {
      return NextResponse.json({ error: "That template is not available for this event." }, { status: 400 });
    }
    update.templateId = tpl.id;
  }
  if (parsed.data.publish) {
    update.status = "PUBLISHED";
    update.publishedAt = inv.publishedAt ?? new Date();
  }
  const saved = await prisma.invitation.update({ where: { id }, data: update });
  return NextResponse.json({ ok: true, status: saved.status, slug: saved.slug });
}
