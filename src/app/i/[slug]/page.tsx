import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { getSessionInvitationId } from "@/lib/auth";
import { parseInvitationData, t } from "@/lib/invitation";
import { formatLongDate } from "@/lib/i18n";
import { getPlan, PLANS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/templates";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ g?: string }> };

const load = cache(async (slug: string) => {
  const inv = await prisma.invitation.findUnique({ where: { slug } });
  if (!inv) return null;
  // Drafts are visible only to their owner (to preview before publishing).
  if (inv.status !== "PUBLISHED" && (await getSessionInvitationId()) !== inv.id) return null;
  return inv;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inv = await load(slug);
  if (!inv) return { title: "Invitation" };
  const data = parseInvitationData(inv.data);
  const names = data.hosts.map((h) => t(h, data.defaultLocale)).join(` ${data.defaultLocale === "km" ? "និង" : "&"} `);
  const title = `${t(data.title, data.defaultLocale)} — ${names}`;
  const description = `${formatLongDate(data.date, data.defaultLocale)} · ${t(data.venue.name, data.defaultLocale)}`;
  const image = data.coverPhoto || data.photos[0];
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: image ? [{ url: image }] : undefined, type: "website" },
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { g } = await searchParams;
  const inv = await load(slug);
  if (!inv) notFound();

  let guest: { name: string; token: string } | undefined;
  if (g) {
    const row = await prisma.guest.findFirst({ where: { token: g, invitationId: inv.id } });
    if (row) {
      guest = { name: row.name, token: row.token };
      if (!row.openedAt) await prisma.guest.update({ where: { id: row.id }, data: { openedAt: new Date() } });
    }
  }

  const plan = getPlan(inv.plan) ?? PLANS["wedding-premium"];
  return (
    <InvitationRenderer
      data={parseInvitationData(inv.data)}
      template={getTemplate(inv.templateId)}
      features={plan.features}
      slug={inv.slug}
      guestName={guest?.name}
      guestToken={guest?.token}
    />
  );
}
