// Upload rules shared by the form and the API routes.
import { z } from "zod";
import { VOICE_CATEGORIES } from "@/app/(dashboard)/features/data/voice-categories";
import type { VoiceCategory } from "@/generated/prisma/enums";

export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;
export const MIN_AUDIO_DURATION_SECONDS = 10;
export const MAX_VOICE_NAME_LENGTH = 80;
export const MAX_VOICE_DESCRIPTION_LENGTH = 500;

export const uploadRequestSchema = z.object({
  size: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
});

export const createVoiceSchema = z.object({
  // The server builds the storage key from this, so a client can't name one.
  uploadId: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Voice name is required")
    .max(MAX_VOICE_NAME_LENGTH),
  category: z.enum(VOICE_CATEGORIES as [VoiceCategory, ...VoiceCategory[]]),
  // A locale tag such as "en-US" or "zh-Hans-CN".
  language: z
    .string()
    .max(35)
    .regex(/^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})*$/, "Invalid language"),
  description: z.string().max(MAX_VOICE_DESCRIPTION_LENGTH).nullish(),
});

/** Where an upload waits until it has been validated. Never served. */
export function pendingUploadKey(orgId: string, uploadId: string) {
  return `uploads/orgs/${orgId}/${uploadId}`;
}
