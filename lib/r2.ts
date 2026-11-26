import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  // Otherwise presigned upload URLs demand a checksum the browser can't supply.
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

type UploadAudioOptions = {
  buffer: Buffer;
  key: string;
  contentType?: string;
};

export async function uploadAudio({
  buffer,
  key,
  contentType = "audio/wav",
}: UploadAudioOptions): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
}

export async function deleteAudio(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

export async function getSignedAudioUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}

/**
 * A short-lived URL for uploading one object straight from the browser. The
 * size is part of the signature, so storage rejects any other length.
 */
export async function getSignedUploadUrl(key: string, size: number) {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentLength: size,
  });
  return getSignedUrl(r2, command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-length"]),
  });
}

/**
 * Reads a whole object. Returns "missing" when there is none, and "too-large"
 * without reading the body when it exceeds `maxBytes`.
 */
export async function readUpload(key: string, maxBytes: number) {
  try {
    const { Body, ContentLength } = await r2.send(
      new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
    );

    if (!Body) return "missing" as const;

    if (ContentLength === undefined || ContentLength > maxBytes) {
      (Body as { destroy?: () => void }).destroy?.();
      return "too-large" as const;
    }

    return await Body.transformToByteArray();
  } catch (err) {
    if (err instanceof NoSuchKey) return "missing" as const;
    throw err;
  }
}
