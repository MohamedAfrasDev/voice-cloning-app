import { SUBSCRIPTION_REQUIRED } from "@/app/(dashboard)/features/billing/lib/error-codes";
import { VOICE_CATEGORIES } from "@/app/(dashboard)/features/data/voice-categories";
import { VoiceCategory } from "@/generated/prisma/enums";
import { getOrgAccess } from "@/lib/auth/org-access";
import z from "zod";
import { inspectAudio } from "@/lib/audio-type";
import { prisma } from "@/lib/db/prisma";
import { deleteAudio, uploadAudio } from "@/lib/r2";
import * as Sentry from "@sentry/nextjs";
import { hasActiveSubscription } from "@/lib/billing";
import { consumeRateLimit } from "@/lib/rate-limit";
import { MAX_CUSTOM_VOICES_PER_ORG, RATE_LIMITS } from "@/lib/limits";
const createVoiceSchema = z.object({
  name: z.string().min(1, "Voice name is required"),
  category: z.enum(VOICE_CATEGORIES as [VoiceCategory, ...VoiceCategory[]]),
  language: z.string().min(1, "Language is required"),
  description: z.string().nullish(),
});

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

const MIN_AUDIO_DURATION_SECONDS = 10;

export async function POST(request: Request) {
  const access = await getOrgAccess();

  if (access.error) return access.error;

  const { orgId } = access;

  try {
    if (!(await hasActiveSubscription(orgId))) {
      return Response.json({ error: SUBSCRIPTION_REQUIRED }, { status: 403 });
    }
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "voice-create-subscription-check" },
    });

    return Response.json(
      { error: "Could not verify your subscription. Please retry" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);

  const validation = createVoiceSchema.safeParse({
    name: url.searchParams.get("name"),
    category: url.searchParams.get("category"),
    language: url.searchParams.get("language"),

    description: url.searchParams.get("description"),
  });

  if (!validation.success) {
    return Response.json(
      {
        error: "Invalid input",
        issues: validation.error.issues,
      },
      { status: 400 },
    );
  }

  const { name, category, language, description } = validation.data;

  const fileBuffer = await request.arrayBuffer();

  if (!fileBuffer.byteLength) {
    return Response.json(
      { error: "Please upload an audio file" },
      { status: 400 },
    );
  }

  if (fileBuffer.byteLength > MAX_UPLOAD_SIZE_BYTES) {
    return Response.json(
      { error: "Audio file exceeds the 20 MB size limit" },
      { status: 413 },
    );
  }

  const audio = await inspectAudio(new Uint8Array(fileBuffer));

  if (!audio) {
    return Response.json(
      { error: "File is not a supported audio file" },
      { status: 422 },
    );
  }

  const { contentType, duration } = audio;

  if (duration < MIN_AUDIO_DURATION_SECONDS) {
    return Response.json(
      {
        error: `Audio too short (${duration.toFixed(1)}s). Minimum duration is ${MIN_AUDIO_DURATION_SECONDS} seconds.`,
      },
      { status: 422 },
    );
  }

  try {
    const voiceCount = await prisma.voice.count({
      where: { variant: "CUSTOM", orgId },
    });

    if (voiceCount >= MAX_CUSTOM_VOICES_PER_ORG) {
      return Response.json(
        {
          error: `Voice limit reached (${MAX_CUSTOM_VOICES_PER_ORG}). Delete a voice to add another`,
        },
        { status: 403 },
      );
    }

    if (!(await consumeRateLimit(RATE_LIMITS.voiceCreations, orgId))) {
      return Response.json(
        { error: "Too many new voices. Please try again later" },
        { status: 429 },
      );
    }
  } catch (err) {
    Sentry.captureException(err, { tags: { area: "voice-create-limits" } });

    return Response.json(
      { error: "Failed to create voice. Please retry" },
      { status: 500 },
    );
  }

  let createdVoiceId: string | null = null;
  // Set just before the upload so the rollback can remove the object even if
  // a later step (the DB update) fails.
  let uploadedObjectKey: string | null = null;

  try {
    const voice = await prisma.voice.create({
      data: {
        name,
        variant: "CUSTOM",
        orgId,
        description,
        category,
        language,
      },
      select: {
        id: true,
      },
    });

    createdVoiceId = voice.id;

    const r2ObjectKey = `voices/orgs/${orgId}/${voice.id}`;
    uploadedObjectKey = r2ObjectKey;

    await uploadAudio({
      buffer: Buffer.from(fileBuffer),
      key: r2ObjectKey,
      contentType,
    });

    await prisma.voice.update({
      where: {
        id: voice.id,
      },
      data: {
        r2ObjectKey,
      },
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "voice-create" },
      extra: { createdVoiceId },
    });

    if (uploadedObjectKey) {
      await deleteAudio(uploadedObjectKey).catch((cleanupErr) =>
        Sentry.captureException(cleanupErr, {
          tags: { area: "voice-create-rollback-r2" },
        }),
      );
    }

    if (createdVoiceId) {
      await prisma.voice
        .delete({
          where: {
            id: createdVoiceId,
          },
        })
        .catch(() => {});
    }

    return Response.json(
      { error: "Failed to create voice. Please retry" },
      { status: 500 },
    );
  }

  return Response.json(
    { name, message: "Voice created successfully" },
    { status: 201 },
  );
}
