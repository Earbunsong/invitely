import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { checkTransaction, isPaywayConfigured } from "@/lib/payway";
import { prisma } from "@/lib/prisma";

/**
 * Vercel Cron (see vercel.json). Pending orders older than 30 minutes get a final PayWay check:
 * paid ones are completed, the rest are marked EXPIRED.
 */
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stale = await prisma.order.findMany({
    where: { status: "PENDING", createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) } },
    take: 100,
  });
  let paid = 0;
  let expired = 0;
  for (const o of stale) {
    const check = isPaywayConfigured() ? await checkTransaction(o.tranId).catch(() => null) : null;
    if (check?.approved && (check.amount == null || Math.abs(check.amount - Number(o.amount)) < 0.01)) {
      await markOrderPaid(o.id, check.apv);
      paid++;
    } else {
      await prisma.order.updateMany({ where: { id: o.id, status: "PENDING" }, data: { status: "EXPIRED" } });
      expired++;
    }
  }
  return NextResponse.json({ checked: stale.length, paid, expired });
}
