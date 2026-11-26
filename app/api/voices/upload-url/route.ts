import * as Sentry from "@sentry/nextjs";
import { RATE_LIMITS } from "@/lib/limits";
import { getSignedUploadUrl } from "@/lib/r2";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getUploadAccess } from "@/lib/voice-upload-access";
import { pendingUploadKey, uploadRequestSchema } from "@/lib/voice-upload";

// Files go from the browser to storage: hosting limits request bodies to far
// less than the largest audio sample.
export async function POST(request: Request) {
  const access = await getUploadAccess();

  if (access.error) return access.error;

  const validation = uploadRequestSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!validation.success) {
    return Response.json(
      { error: "Choose an audio file of up to 20 MB" },
      { status: 400 },
    );
  }

  try {
    if (!(await consumeRateLimit(RATE_LIMITS.voiceUploads, access.orgId))) {
      return Response.json(
        { error: "Too many uploads. Please try again later" },
        { status: 429 },
      );
    }

    const uploadId = crypto.randomUUID();
    const uploadUrl = await getSignedUploadUrl(
      pendingUploadKey(access.orgId, uploadId),
      validation.data.size,
    );

    return Response.json({ uploadId, uploadUrl });
  } catch (err) {
    Sentry.captureException(err, { tags: { area: "voice-upload-url" } });

    return Response.json(
      { error: "Failed to start the upload. Please retry" },
      { status: 500 },
    );
  }
}
