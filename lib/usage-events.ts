import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db/prisma";
import { polar } from "@/lib/polar";

export interface GenerationUsage {
  generationId: string;
  orgId: string;
  characters: number;
  occurredAt: Date;
}

const RETRY_BATCH_SIZE = 100;

function ingestUsage(usage: GenerationUsage) {
  return polar.events.ingest({
    events: [
      {
        name: "tts_generation",
        // Polar skips an external_id it has already seen, so resending an
        // event whose first response was lost doesn't bill it twice.
        external_id: `tts_generation:${usage.generationId}`,
        external_customer_id: usage.orgId,
        metadata: { characters: usage.characters },
        timestamp: usage.occurredAt.toISOString(),
      },
    ],
  });
}

// Never throws: billing problems must not fail a stored generation.
export async function recordUsage(usage: GenerationUsage) {
  try {
    await ingestUsage(usage);
  } catch (ingestError) {
    Sentry.captureException(ingestError, {
      tags: { area: "usage-ingestion" },
      extra: { generationId: usage.generationId },
    });

    try {
      await prisma.pendingUsageEvent.upsert({
        where: { generationId: usage.generationId },
        create: usage,
        update: {},
      });
    } catch (persistError) {
      Sentry.captureException(persistError, {
        tags: { area: "usage-persistence" },
        extra: { ...usage },
      });
    }
  }
}

export async function retryPendingUsageEvents() {
  let sent = 0;
  let failed = 0;
  let lastError: unknown;
  let cursor = "";

  while (true) {
    // Page by id so events that keep failing don't block the ones after them.
    const batch = await prisma.pendingUsageEvent.findMany({
      where: { generationId: { gt: cursor } },
      orderBy: { generationId: "asc" },
      take: RETRY_BATCH_SIZE,
    });

    if (batch.length === 0) break;

    for (const { generationId, orgId, characters, occurredAt } of batch) {
      cursor = generationId;

      try {
        await ingestUsage({ generationId, orgId, characters, occurredAt });
        // deleteMany tolerates a concurrent run having removed the row.
        await prisma.pendingUsageEvent.deleteMany({ where: { generationId } });
        sent++;
      } catch (err) {
        lastError = err;
        failed++;
      }
    }
  }

  return { sent, failed, lastError };
}
