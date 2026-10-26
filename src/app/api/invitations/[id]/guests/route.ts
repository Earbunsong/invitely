import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { ownedInvitation } from "@/lib/owner";
import { getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const token = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 10);

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const inv = await ownedInvitation(id);
  if (!inv) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [guests, wishes] = await Promise.all([
    prisma.guest.findMany({ where: { invitationId: id }, orderBy: { createdAt: "asc" } }),
    prisma.wish.findMany({ where: { invitationId: id }, orderBy: { createdAt: "desc" }, take: 500 }),
  ]);
  return NextResponse.json({ guests, wishes });
}

/** Add one or many guests (one name per line). */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const inv = await ownedInvitation(id);
  if (!inv) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ names: z.array(z.string().trim().min(1).max(80)).min(1).max(200) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter at least one name" }, { status: 400 });

  const limit = getPlan(inv.plan)?.limits.namedGuests ?? 0;
  const count = await prisma.guest.count({ where: { invitationId: id } });
  if (count + parsed.data.names.length > limit) {
    return NextResponse.json({ error: `Your plan allows up to ${limit} named guests (you have ${count}).` }, { status: 400 });
  }
  await prisma.guest.createMany({ data: parsed.data.names.map((name) => ({ invitationId: id, name, token: token() })) });
  const guests = await prisma.guest.findMany({ where: { invitationId: id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ guests });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const inv = await ownedInvitation(id);
  if (!inv) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const guestId = new URL(req.url).searchParams.get("guestId") ?? "";
  await prisma.guest.deleteMany({ where: { id: guestId, invitationId: id } });
  return NextResponse.json({ ok: true });
}
