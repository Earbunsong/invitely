import { NextResponse } from "next/server";
import { z } from "zod";
import { clearSession, codesMatch, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const body = z.object({ phone: z.string().max(20), code: z.string().max(20) });

// Naive in-memory throttle per phone (per server instance); good enough to slow guessing.
const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const digits = parsed.data.phone.replace(/\D/g, "").replace(/^0+/, "");
  const key = digits.slice(-8);

  const a = attempts.get(key);
  if (a && a.n >= 8 && a.until > Date.now()) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  // Match on the last 8 digits so "+855 12 345 678" and "012345678" both work.
  const candidates = await prisma.invitation.findMany({
    where: { phone: { endsWith: key }, accessCode: { not: null } },
    select: { id: true, accessCode: true },
    take: 20,
  });
  const match = candidates.find((c) => codesMatch(c.accessCode, parsed.data.code));
  if (!match) {
    attempts.set(key, { n: (a?.n ?? 0) + 1, until: Date.now() + 15 * 60 * 1000 });
    return NextResponse.json({ error: "Phone number or access code is incorrect." }, { status: 401 });
  }
  attempts.delete(key);
  await setSession(match.id);
  return NextResponse.json({ invitationId: match.id });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
