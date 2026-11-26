import type { z } from "zod";
import { MAX_CUSTOM_VOICES_PER_ORG, RATE_LIMITS } from "@/lib/limits";
import { inspectAudio } from "@/lib/audio-type";
import { prisma } from "@/lib/db/prisma";
import { deleteAudio, readUpload, uploadAudio } from "@/lib/r2";
import * as Sentry from "@sentry/nextjs";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createVoiceWithinCap } from "@/lib/voices";
import { getUploadAccess } from "@/lib/voice-upload-access";
import {
  createVoiceSchema,
  MAX_UPLOAD_SIZE_BYTES,
  MIN_AUDIO_DURATION_SECONDS,
  pendingUploadKey,
} from "@/lib/voice-upload";

type CreateVoiceInput = z.infer<typeof createVoiceSchema>;

export async function POST(request: Request) {
  const access = await getUploadAccess();

  if (access.error) return access.error;

  const { orgId } = access;

  const validation = createVoiceSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!validation.success) {
    return Response.json(
      {
        error: "Invalid input",
        issues: validation.error.issues,
      },
      { status: 400 },
    );
  }

  const pendingKey = pendingUploadKey(orgId, validation.data.uploadId);

  try {
    return await createFromUpload(orgId, pendingKey, validation.data);
  } finally {
    // Whatever the outcome, the next attempt uploads again.
    await deleteAudio(pendingKey).catch((err) =>
      Sentry.captureException(err, {
        tags: { area: "voice-create-pending-cleanup" },
      }),
    );
  }
}

async function createFromUpload(
  orgId: string,
  pendingKey: string,
  { name, category, language, description }: CreateVoiceInput,
) {
  let upload: Awaited<ReturnType<typeof readUpload>>;

  try {
    upload = await readUpload(pendingKey, MAX_UPLOAD_SIZE_BYTES);
  } catch (err) {
    Sentry.captureException(err, { tags: { area: "voice-create-read" } });

    return Response.json(
      { error: "Failed to create voice. Please retry" },
      { status: 500 },
    );
  }

  if (upload === "missing" || upload === "too-large") {
    return upload === "missing"
      ? Response.json(
          { error: "Upload not found. Please upload the file again" },
          { status: 400 },
        )
      : Response.json(
          { error: "Audio file exceeds the 20 MB size limit" },
          { status: 413 },
        );
  }

  // These exact bytes are checked and then stored, so what is served can't
  // differ from what passed validation.
  const audio = await inspectAudio(upload);

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
    const voice = await createVoiceWithinCap({
      name,
      variant: "CUSTOM",
      orgId,
      description,
      category,
      language,
    });

    if (!voice) {
      return Response.json(
        {
          error: `Voice limit reached (${MAX_CUSTOM_VOICES_PER_ORG}). Delete a voice to add another`,
        },
        { status: 403 },
      );
    }

    createdVoiceId = voice.id;

    const r2ObjectKey = `voices/orgs/${orgId}/${voice.id}`;
    uploadedObjectKey = r2ObjectKey;

    await uploadAudio({
      buffer: Buffer.from(upload),
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
