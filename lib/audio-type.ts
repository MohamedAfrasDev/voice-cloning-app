import { parseBuffer } from "music-metadata";

// Containers as music-metadata names them, mapped to the type we store.
const CONTAINER_TYPES: [RegExp, string][] = [
  [/^WAVE$/, "audio/wav"],
  [/^MPEG$/, "audio/mpeg"],
  [/^ADTS\//, "audio/aac"],
  [/^Ogg$/, "audio/ogg"],
  [/^FLAC$/, "audio/flac"],
  [/^AIFF/, "audio/aiff"],
  [/^EBML\/webm$/, "audio/webm"],
  // MP4 reports its brands, e.g. "M4A/mp42/isom".
  [/(^|\/)(M4A|M4B|mp41|mp42|isom|iso2|iso5|iso6|dash)(\/|$)/, "audio/mp4"],
];

/**
 * Identifies an upload from its bytes. The client's Content-Type and file name
 * are never consulted. Returns null for anything that isn't supported audio.
 */
export async function inspectAudio(bytes: Uint8Array) {
  try {
    const { format } = await parseBuffer(bytes, undefined, { duration: true });
    const container = format.container?.replaceAll(" ", "") ?? "";
    const contentType = CONTAINER_TYPES.find(([re]) => re.test(container))?.[1];

    if (!contentType) return null;

    return { contentType, duration: format.duration ?? 0 };
  } catch {
    return null;
  }
}

/**
 * Headers for serving stored audio from our own origin. Objects uploaded before
 * type detection may carry any Content-Type, so only audio types pass through.
 */
export function audioResponseHeaders(
  storedContentType: string | null,
  cacheControl: string,
) {
  const type = storedContentType?.split(";")[0].trim().toLowerCase() ?? "";

  return {
    "Content-Type": /^audio\/[a-z0-9.+-]+$/.test(type)
      ? type
      : "application/octet-stream",
    "Cache-Control": cacheControl,
    "Content-Disposition": "inline",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "X-Content-Type-Options": "nosniff",
  };
}
