type Options = {
  isDev: boolean;
  sentryDsn?: string;
};

function originOf(url: string | undefined) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// Enforced now: none of these affect how pages load their own resources.
const ENFORCED_POLICY = [
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

/**
 * The full policy, report-only until the pages have been checked in production:
 * violations show only in the browser console. Zod's guarded probe for eval is
 * an expected one. Pages are prerendered, so there are no per-request nonces;
 * see "Without Nonces" in the Next.js Content Security Policy guide.
 */
function reportOnlyPolicy({ isDev, sentryDsn }: Options) {
  // Sentry normally goes through the /monitoring tunnel on our own origin.
  const sentryOrigin = originOf(sentryDsn);

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // Profile images can point anywhere over HTTPS.
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "media-src 'self' blob:",
    // Session Replay and the audio recorder start workers from blobs.
    "worker-src 'self' blob:",
    ["connect-src 'self' blob:", sentryOrigin].filter(Boolean).join(" "),
    ENFORCED_POLICY,
  ].join("; ");
}

export function securityHeaders(options: Options) {
  return [
    { key: "Content-Security-Policy", value: ENFORCED_POLICY },
    {
      key: "Content-Security-Policy-Report-Only",
      value: reportOnlyPolicy(options),
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), geolocation=(), microphone=(self)",
    },
  ];
}
