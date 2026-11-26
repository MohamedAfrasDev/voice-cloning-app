import { SUBSCRIPTION_REQUIRED } from "@/app/(dashboard)/features/billing/lib/error-codes";
import { VOICE_CATEGORIES } from "@/app/(dashboard)/features/data/voice-categories";
import { VoiceCategory } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import z from "zod";
import { parseBuffer } from "music-metadata";
import { prisma } from "@/lib/db/prisma";
import { deleteAudio, uploadAudio } from "@/lib/r2";
import * as Sentry from "@sentry/nextjs";
import { polar } from "@/lib/polar";
import { errors } from "@polar-sh/sdk/2026-10";
const createVoiceSchema = z.object({
  name: z.string().min(1, "Voice name is required"),
  category: z.enum(VOICE_CATEGORIES as [VoiceCategory, ...VoiceCategory[]]),
  language: z.string().min(1, "Language is required"),
  description: z.string().nullish(),
});

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

const MIN_AUDIO_DURATION_SECONDS = 10;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  const userId = session?.session.id;

  const orgId = session?.session.activeOrganizationId;

  if (!userId || !orgId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customerState = await polar.customers.getStateExternal(orgId);

    const hasActiveSubscription =
      (customerState.active_subscriptions ?? []).length > 0;

    if (!hasActiveSubscription) {
      return Response.json({ error: SUBSCRIPTION_REQUIRED }, { status: 403 });
    }
  } catch (err) {
    // An org that never checked out has no Polar customer yet.
    if (err instanceof errors.ResourceNotFound) {
      return Response.json({ error: SUBSCRIPTION_REQUIRED }, { status: 403 });
    }

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

  const contentType = request.headers.get("content-type");

  if (!contentType) {
    return Response.json(
      { error: "Missing Content-Type header" },
      { status: 400 },
    );
  }

  const normalizedContentType =
    contentType.split(";")[0]?.trim() || "audio/wav";

  let duration: number;

  try {
    const metadata = await parseBuffer(
      new Uint8Array(fileBuffer),
      { mimeType: normalizedContentType },
      { duration: true },
    );

    duration = metadata.format.duration ?? 0;
  } catch {
    return Response.json(
      { error: "File is not a valid audio file" },
      { status: 422 },
    );
  }

  if (duration < MIN_AUDIO_DURATION_SECONDS) {
    return Response.json(
      {
        error: `Audio too short (${duration.toFixed(1)}s). Minimum duration is ${MIN_AUDIO_DURATION_SECONDS} seconds.`,
      },
      { status: 422 },
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
      contentType: normalizedContentType,
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
