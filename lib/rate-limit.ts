import { prisma } from "@/lib/db/prisma";

export interface RateLimit {
  name: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Counts `cost` against a fixed window shared by all app instances. Returns
 * false, without counting, when it would exceed the limit. Database errors are
 * thrown, so callers fail closed.
 */
export async function consumeRateLimit(
  { name, limit, windowSeconds }: RateLimit,
  subject: string,
  cost = 1,
) {
  if (cost > limit) return false;

  const key = `${name}:${subject}`;

  // One statement, so concurrent requests can't both take the last slot.
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" AS b ("key", "count", "expiresAt")
    VALUES (
      ${key},
      ${cost}::int,
      now() + make_interval(secs => ${windowSeconds}::int)
    )
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN b."expiresAt" <= now() THEN excluded."count"
        ELSE b."count" + excluded."count"
      END,
      "expiresAt" = CASE
        WHEN b."expiresAt" <= now() THEN excluded."expiresAt"
        ELSE b."expiresAt"
      END
    WHERE b."expiresAt" <= now()
      OR b."count" + excluded."count" <= ${limit}::int
    RETURNING "count"
  `;

  return rows.length > 0;
}
