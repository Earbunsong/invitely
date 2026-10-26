import { NextResponse } from "next/server";
import { z } from "zod";
import { setOrderClaim } from "@/lib/auth";
import { quote } from "@/lib/orders";
import { newTranId } from "@/lib/payway";
import { MIN_DAYS_BEFORE_EVENT } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const body = z.object({
  plan: z.string(),
  eventType: z.enum(["wedding", "engagement", "birthday", "housewarming"]),
  countryCode: z.string().regex(/^\+\d{1,4}$/),
  phone: z.string().regex(/^\d{6,12}$/, "Enter a valid phone number (digits only)"),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  promoCode: z.string().max(30).optional(),
  agree: z.literal(true, { errorMap: () => ({ message: "Please accept the terms" }) }),
});

/** Preview the price (used by the promo code field). */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = await quote(sp.get("plan") ?? "", sp.get("promo"));
  if (!q) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  return NextResponse.json({ amount: q.amount, discount: q.discount, promoCode: q.promoCode, promoError: q.promoError });
}

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const d = parsed.data;

  const q = await quote(d.plan, d.promoCode);
  if (!q) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  if (!q.plan.eventTypes.includes(d.eventType)) return NextResponse.json({ error: "This plan does not support that event type" }, { status: 400 });
  if (d.promoCode && q.promoError) return NextResponse.json({ error: q.promoError }, { status: 400 });

  // Stored as UTC midnight of the calendar date so `toISOString().slice(0, 10)` gives the same day back.
  const eventDate = new Date(`${d.eventDate}T00:00:00Z`);
  const eventStartKh = new Date(`${d.eventDate}T00:00:00+07:00`);
  const minDate = new Date(Date.now() + MIN_DAYS_BEFORE_EVENT * 86400000);
  if (Number.isNaN(eventDate.getTime()) || eventStartKh < minDate) {
    return NextResponse.json({ error: `The event date must be at least ${MIN_DAYS_BEFORE_EVENT} days from today.` }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      tranId: newTranId(),
      plan: q.plan.id,
      eventType: d.eventType,
      amount: q.amount,
      phone: `${d.countryCode}${d.phone.replace(/^0+/, "")}`,
      eventDate,
      promoCode: q.promoCode,
    },
  });
  await setOrderClaim(order.id);
  return NextResponse.json({ orderId: order.id, amount: q.amount });
}
