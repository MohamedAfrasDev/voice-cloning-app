import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { MAX_CUSTOM_VOICES_PER_ORG } from "./limits";

/**
 * Inserts a custom voice unless the organization is at its cap, in which case
 * it returns null.
 */
export function createVoiceWithinCap(
  data: Prisma.VoiceUncheckedCreateInput & { orgId: string },
) {
  return prisma.$transaction(async (tx) => {
    // Held until commit, so concurrent requests for the same organization wait
    // here and then count this insert.
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(
        hashtextextended(${`voice-create:${data.orgId}`}, 0)
      )
    `;

    const count = await tx.voice.count({
      where: { variant: "CUSTOM", orgId: data.orgId },
    });

    if (count >= MAX_CUSTOM_VOICES_PER_ORG) return null;

    return tx.voice.create({ data, select: { id: true } });
  });
}
