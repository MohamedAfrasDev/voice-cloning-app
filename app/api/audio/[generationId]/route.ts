import * as Sentry from "@sentry/nextjs";
import { getOrgAccess } from "@/lib/auth/org-access";
import { prisma } from "@/lib/db/prisma";
import { getSignedAudioUrl } from "@/lib/r2";
import { audioResponseHeaders } from "@/lib/audio-type";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ generationId: string }> },
) {
  const access = await getOrgAccess();

  if (access.error) return access.error;

  const { orgId } = access;

  const { generationId } = await params;

  // Scoped to the active org so one org can never read another's audio.
  const generation = await prisma.generation.findUnique({
    where: { id: generationId, orgId },
    select: { r2ObjectKey: true },
  });

  if (!generation?.r2ObjectKey) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const signedUrl = await getSignedAudioUrl(generation.r2ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    Sentry.captureMessage("Failed to fetch audio from R2", {
      level: "error",
      tags: { area: "audio-route" },
      extra: { status: audioResponse.status, generationId },
    });
    return new Response("Failed to fetch audio", { status: 502 });
  }

  return new Response(audioResponse.body, {
    headers: audioResponseHeaders("audio/wav", "private, max-age=3600"),
  });
}
