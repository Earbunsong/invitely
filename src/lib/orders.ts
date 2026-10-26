import { customAlphabet } from "nanoid";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getPlan, type Plan } from "./plans";
import { emptyInvitation, type InvitationData } from "./invitation";
import { defaultTemplateFor } from "@/templates";
import { encryptCode, generateAccessCode } from "./auth";
import { notifyAdmin } from "./telegram";

export const newSlug = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 8);

export type PriceQuote = { plan: Plan; amount: number; discount: number; promoCode?: string; promoError?: string };

/** Price is always computed on the server from the plan table and promo code. */
export async function quote(planId: string, promoCode?: string | null): Promise<PriceQuote | null> {
  const plan = getPlan(planId);
  if (!plan) return null;
  let discount = 0;
  let appliedCode: string | undefined;
  let promoError: string | undefined;
  const code = promoCode?.trim().toUpperCase();
  if (code) {
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    const valid =
      promo &&
      promo.active &&
      (!promo.expiresAt || promo.expiresAt > new Date()) &&
      (promo.maxUses == null || promo.used < promo.maxUses);
    if (valid) {
      if (promo.percentOff) discount = (plan.price * promo.percentOff) / 100;
      else if (promo.amountOff) discount = Number(promo.amountOff);
      discount = Math.min(discount, plan.price - 1); // never below $1
      appliedCode = code;
    } else {
      promoError = "This promo code is not valid.";
    }
  }
  const amount = Math.round((plan.price - discount) * 100) / 100;
  return { plan, amount, discount: Math.round(discount * 100) / 100, promoCode: appliedCode, promoError };
}

/**
 * Marks a PENDING order as PAID exactly once and creates its draft invitation.
 * Safe to call repeatedly (callback retries, polling, cron): later calls are no-ops.
 */
export async function markOrderPaid(orderId: string, apv?: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING", "EXPIRED"] } },
      data: { status: "PAID", paidAt: new Date(), paywayApv: apv ?? null },
    });
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { invitation: true } });
    if (updated.count === 0 || order.invitation) return order.invitation;

    if (order.promoCode) {
      await tx.promoCode.update({ where: { code: order.promoCode }, data: { used: { increment: 1 } } }).catch(() => undefined);
    }

    const date = order.eventDate.toISOString().slice(0, 10);
    const data: InvitationData = emptyInvitation(order.eventType as InvitationData["eventType"], date);
    const invitation = await tx.invitation.create({
      data: {
        orderId: order.id,
        slug: newSlug(),
        plan: order.plan,
        templateId: defaultTemplateFor(data.eventType).id,
        data: data as unknown as Prisma.InputJsonValue,
        accessCode: encryptCode(generateAccessCode()),
        phone: order.phone,
      },
    });
    void notifyAdmin(`💰 New paid order <b>${order.plan}</b> $${order.amount} · ${order.phone} · tran ${order.tranId}`);
    return invitation;
  });
}
