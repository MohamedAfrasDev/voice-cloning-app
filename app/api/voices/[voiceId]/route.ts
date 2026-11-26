import { getOrgAccess } from "@/lib/auth/org-access";
import { prisma } from "@/lib/db/prisma";
import { audioResponseHeaders } from "@/lib/audio-type";
import { getSignedAudioUrl } from "@/lib/r2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ voiceId: string }> },
) {
  const access = await getOrgAccess();

  if (access.error) return access.error;

  const { orgId } = access;

  const { voiceId } = await params;

  const voice = await prisma.voice.findUnique({
    where: { id: voiceId },
    select: {
      variant: true,
      orgId: true,
      r2ObjectKey: true,
    },
  });

  if (!voice) {
    return new Response("Not found", { status: 404 });
  }

  if (voice.variant === "CUSTOM" && voice.orgId !== orgId) {
    return new Response("Not found", { status: 404 });
  }

  if (!voice.r2ObjectKey) {
    return new Response("Voice audio is not available yet", { status: 409 });
  }

  const signedUrl = await getSignedAudioUrl(voice.r2ObjectKey);

  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch voice audio", { status: 502 });
  }

  return new Response(audioResponse.body, {
    headers: audioResponseHeaders(
      audioResponse.headers.get("content-type"),
      voice.variant === "SYSTEM"
        ? "public, max-age=86400"
        : "private, max-age=3600",
    ),
  });
}
