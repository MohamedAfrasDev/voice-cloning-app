import type { RateLimit } from "./rate-limit";

const DAY = 24 * 60 * 60;
// The largest value the counter column holds.
const MAX_LIMIT = 2_147_483_647;

/**
 * A whole number from the environment. Anything unset or malformed falls back
 * to the default, so a typo never removes the cap. 0 switches generation off.
 */
export function parseLimit(value: string | undefined, fallback: number) {
  if (!value || !/^\d+$/.test(value.trim())) return fallback;

  return Math.min(Number(value), MAX_LIMIT);
}

/**
 * Daily caps on speech generation across every organization together. Accounts
 * are free to create, so per-organization limits alone don't bound GPU cost.
 * Server only.
 */
export function siteDailyLimits(
  env: Record<string, string | undefined> = process.env,
) {
  return {
    generations: {
      name: "site-generations",
      limit: parseLimit(env.SITE_DAILY_GENERATION_LIMIT, 100),
      windowSeconds: DAY,
    },
    characters: {
      name: "site-characters",
      limit: parseLimit(env.SITE_DAILY_CHARACTER_LIMIT, 50_000),
      windowSeconds: DAY,
    },
  } satisfies Record<string, RateLimit>;
}
