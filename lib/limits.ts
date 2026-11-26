const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Per-organization limits. The caps for the whole site are in site-limits.ts.
 */
export const RATE_LIMITS = {
  generationRequests: { name: "generation", limit: 10, windowSeconds: MINUTE },
  generationCharacters: {
    name: "generation-characters",
    // Below the site-wide cap, so one organization can't use all of it.
    limit: 20_000,
    windowSeconds: DAY,
  },
  voiceCreations: { name: "voice-create", limit: 10, windowSeconds: HOUR },
  // Higher than creations, so rejected files can be fixed and sent again.
  voiceUploads: { name: "voice-upload", limit: 20, windowSeconds: HOUR },
} as const;

export const MAX_CUSTOM_VOICES_PER_ORG = 50;

export const MAX_ORGANIZATIONS_PER_USER = 3;

export const MAX_TRPC_BATCH_SIZE = 10;
