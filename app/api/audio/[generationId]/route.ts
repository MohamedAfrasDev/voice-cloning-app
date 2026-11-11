import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { getSignedAudioUrl } from "@/lib/r2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ generationId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.session.activeOrganizationId;

  if (!orgId) {
    return Response.json(
      { error: "An active organization is required" },
      { status: 403 },
    );
  }

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
    return new Response("Failed to fetch audio", { status: 502 });
  }

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
