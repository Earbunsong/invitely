import { getSessionInvitationId, isAdmin } from "./auth";
import { prisma } from "./prisma";

/** The invitation the signed-in customer owns (or any invitation for the admin), or null. */
export async function ownedInvitation(id: string) {
  if (!(await isAdmin())) {
    const sessionId = await getSessionInvitationId();
    if (!sessionId || sessionId !== id) return null;
  }
  return prisma.invitation.findUnique({ where: { id } });
}
