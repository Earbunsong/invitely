import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { checkTransaction } from "@/lib/payway";
import { prisma } from "@/lib/prisma";

/**
 * PayWay "return_url" pushback. The payload ({ tran_id, apv, status }) is NOT trusted:
 * we re-check the transaction server-to-server and compare the amount before marking paid.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = Object.fromEntries(new URLSearchParams(raw));
  }
  const tranId = String(payload.tran_id ?? "");
  if (!tranId) return NextResponse.json({ ok: false }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { tranId } });
  if (!order) return NextResponse.json({ ok: false }, { status: 404 });
  if (order.status === "PAID") return NextResponse.json({ ok: true });

  const check = await checkTransaction(tranId).catch(() => null);
  const amountOk = check?.amount == null || Math.abs(check.amount - Number(order.amount)) < 0.01;
  if (check?.approved && amountOk) {
    await markOrderPaid(order.id, check.apv ?? (payload.apv ? String(payload.apv) : undefined));
    return NextResponse.json({ ok: true });
  }
  console.warn("[payway] callback not approved", tranId, check?.status);
  return NextResponse.json({ ok: false });
}
