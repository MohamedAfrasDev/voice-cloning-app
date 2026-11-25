import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { getSignedAudioUrl } from "@/lib/r2";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ voiceId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  const userId = session?.session.id;
  const orgId = session?.session.activeOrganizationId;

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

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

  const contentType = audioResponse.headers.get("content-type") || "audio/wav";

  return new Response(audioResponse.body, {
    headers: {
      "Content-type": contentType,
      "Cache-Control":
        voice.variant === "SYSTEM"
          ? "public, max-age=86400"
          : "private, max-age=3600",
    },
  });
}
