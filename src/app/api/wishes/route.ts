import { NextResponse } from "next/server";
import { z } from "zod";
import { getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  const inv = await prisma.invitation.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!inv || inv.status !== "PUBLISHED") return NextResponse.json({ wishes: [] });
  const wishes = await prisma.wish.findMany({
    where: { invitationId: inv.id, message: { not: "" } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, message: true, attending: true, createdAt: true },
  });
  return NextResponse.json({ wishes });
}

const body = z.object({
  slug: z.string().max(40),
  guestToken: z.string().max(60).optional(),
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().max(500).default(""),
  attending: z.boolean().nullable().optional(),
  partySize: z.number().int().min(1).max(20).nullable().optional(),
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { slug, guestToken, name, message, attending, partySize } = parsed.data;

  const inv = await prisma.invitation.findUnique({ where: { slug } });
  if (!inv || inv.status !== "PUBLISHED") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const features = getPlan(inv.plan)?.features;
  if (!features?.wishes && !features?.rsvp) return NextResponse.json({ error: "Not available on this plan" }, { status: 403 });

  // Simple flood protection: max 200 wishes per invitation per day.
  const recent = await prisma.wish.count({ where: { invitationId: inv.id, createdAt: { gt: new Date(Date.now() - 86400000) } } });
  if (recent > 200) return NextResponse.json({ error: "Too many messages, try later" }, { status: 429 });

  // One RSVP per named guest: update instead of duplicating.
  const existing = guestToken ? await prisma.wish.findFirst({ where: { invitationId: inv.id, guestToken } }) : null;
  const data = {
    name,
    message: features.wishes ? message : "",
    attending: features.rsvp ? (attending ?? null) : null,
    partySize: features.rsvp && attending ? (partySize ?? 1) : null,
  };
  const wish = existing
    ? await prisma.wish.update({ where: { id: existing.id }, data })
    : await prisma.wish.create({ data: { ...data, invitationId: inv.id, guestToken: guestToken ?? null } });

  return NextResponse.json({ wish: { id: wish.id, name: wish.name, message: wish.message, attending: wish.attending, createdAt: wish.createdAt } });
}
