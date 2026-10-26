import { getSessionInvitationId } from "./auth";
import { prisma } from "./prisma";

/** The invitation the signed-in customer owns, or null. */
export async function ownedInvitation(id: string) {
  const sessionId = await getSessionInvitationId();
  if (!sessionId || sessionId !== id) return null;
  return prisma.invitation.findUnique({ where: { id } });
}
