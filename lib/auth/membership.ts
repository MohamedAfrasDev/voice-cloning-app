import { prisma } from "@/lib/db/prisma";
import { parseRoles } from "./roles";

/**
 * The user's roles in the organization, or null when they aren't a member.
 *
 * A session's activeOrganizationId is not proof of membership: it survives the
 * user being removed by someone else. Check this before touching org data.
 */
export async function getMemberRoles(userId: string, organizationId: string) {
  const member = await prisma.member.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  });

  return member ? parseRoles(member.role) : null;
}
