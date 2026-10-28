import { PrismaClient, Prisma } from "@prisma/client";
import { DEMOS } from "../src/lib/demo-invitations";
import { invitationDataSchema } from "../src/lib/invitation";

const prisma = new PrismaClient();

async function main() {
  for (const d of DEMOS) {
    const data = invitationDataSchema.parse(d.data) as unknown as Prisma.InputJsonValue;
    await prisma.invitation.upsert({
      where: { slug: d.slug },
      // Create missing demos only — demos edited in /admin (Edit button) are never overwritten.
      update: {},
      create: { slug: d.slug, templateId: d.templateId, plan: d.plan, data, status: "PUBLISHED", publishedAt: new Date() },
    });
  }
  const demo = await prisma.invitation.findUniqueOrThrow({ where: { slug: "demo" } });
  await prisma.guest.upsert({ where: { token: "demo-guest" }, update: {}, create: { invitationId: demo.id, name: "Mr. Bunsong", token: "demo-guest" } });
  await prisma.promoCode.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", percentOff: 10, maxUses: 100 } });
  console.log(`Seeded ${DEMOS.length} demo invitations, 1 guest, promo WELCOME10`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
