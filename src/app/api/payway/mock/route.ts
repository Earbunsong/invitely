import { NextResponse } from "next/server";
import { z } from "zod";
import { hasOrderClaim } from "@/lib/auth";
import { markOrderPaid } from "@/lib/orders";
import { isMockPayments } from "@/lib/payway";

/** DEVELOPMENT ONLY: simulates a successful PayWay payment when no merchant keys are set. */
export async function POST(req: Request) {
  if (!isMockPayments()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const parsed = z.object({ orderId: z.string() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success || !(await hasOrderClaim(parsed.data.orderId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await markOrderPaid(parsed.data.orderId, "MOCK");
  return NextResponse.json({ ok: true });
}
