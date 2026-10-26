import { NextResponse } from "next/server";
import { decryptCode, hasOrderClaim, setSession } from "@/lib/auth";
import { markOrderPaid } from "@/lib/orders";
import { checkTransaction, isPaywayConfigured } from "@/lib/payway";
import { prisma } from "@/lib/prisma";

/**
 * Polled by the checkout page. If PayWay's callback hasn't arrived yet, we ask PayWay directly,
 * so a closed payment sheet or a missed callback still completes the order.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await hasOrderClaim(id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let order = await prisma.order.findUnique({ where: { id }, include: { invitation: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.status === "PENDING" && isPaywayConfigured()) {
    const check = await checkTransaction(order.tranId).catch(() => null);
    if (check?.approved && (check.amount == null || Math.abs(check.amount - Number(order.amount)) < 0.01)) {
      await markOrderPaid(order.id, check.apv);
      order = await prisma.order.findUniqueOrThrow({ where: { id }, include: { invitation: true } });
    }
  }

  if (order.status === "PAID" && order.invitation) {
    // The buyer's browser is signed straight into the editor.
    await setSession(order.invitation.id);
    return NextResponse.json({
      status: order.status,
      accessCode: decryptCode(order.invitation.accessCode),
      invitationId: order.invitation.id,
      slug: order.invitation.slug,
      phone: order.phone,
    });
  }
  return NextResponse.json({ status: order.status });
}
