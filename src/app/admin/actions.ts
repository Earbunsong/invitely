"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { markOrderPaid } from "@/lib/orders";
import { checkTransaction, isPaywayConfigured } from "@/lib/payway";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}

export async function adminLogin(_prev: string | null, form: FormData): Promise<string | null> {
  if (!checkAdminPassword(String(form.get("password") ?? ""))) return "Wrong password";
  await setAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin");
}

/** Re-check with PayWay; if PayWay isn't configured, the admin can confirm manually (e.g. a bank transfer). */
export async function confirmOrder(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const manual = form.get("manual") === "1";
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return;
  if (isPaywayConfigured() && !manual) {
    const check = await checkTransaction(order.tranId).catch(() => null);
    if (check?.approved) await markOrderPaid(order.id, check.apv);
  } else {
    await markOrderPaid(order.id, "MANUAL");
  }
  revalidatePath("/admin");
}

export async function createPromo(form: FormData) {
  await requireAdmin();
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  const percentOff = Number(form.get("percentOff") || 0) || null;
  const maxUses = Number(form.get("maxUses") || 0) || null;
  if (!/^[A-Z0-9]{3,30}$/.test(code) || !percentOff || percentOff > 90) return;
  await prisma.promoCode.upsert({ where: { code }, update: { percentOff, maxUses, active: true }, create: { code, percentOff, maxUses } });
  revalidatePath("/admin");
}

export async function togglePromo(form: FormData) {
  await requireAdmin();
  const code = String(form.get("code"));
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (promo) await prisma.promoCode.update({ where: { code }, data: { active: !promo.active } });
  revalidatePath("/admin");
}
