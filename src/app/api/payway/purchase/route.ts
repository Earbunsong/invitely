import { NextResponse } from "next/server";
import { z } from "zod";
import { hasOrderClaim } from "@/lib/auth";
import { buildPurchase, isMockPayments, isPaywayConfigured } from "@/lib/payway";
import { getPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const body = z.object({
  orderId: z.string(),
  paymentOption: z.enum(["abapay_khqr", "cards", "abapay_khqr_deeplink"]).default("abapay_khqr"),
});

/** Returns the signed form fields; the browser POSTs them to PayWay's hosted checkout. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { orderId, paymentOption } = parsed.data;

  if (!(await hasOrderClaim(orderId))) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status === "PAID") return NextResponse.json({ alreadyPaid: true });
  if (order.status !== "PENDING") return NextResponse.json({ error: "This order has expired. Please start again." }, { status: 409 });

  if (!isPaywayConfigured()) {
    if (isMockPayments()) return NextResponse.json({ mock: true });
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  const appUrl = (process.env.APP_URL || new URL(req.url).origin).replace(/\/$/, "");
  const form = buildPurchase({
    tranId: order.tranId,
    amount: Number(order.amount).toFixed(2),
    itemName: getPlan(order.plan)?.name ?? "E-invitation",
    phone: order.phone.replace(/^\+/, ""),
    paymentOption,
    appUrl,
    orderId: order.id,
  });
  return NextResponse.json(form);
}
