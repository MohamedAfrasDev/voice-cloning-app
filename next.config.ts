import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    const headers = securityHeaders({
      isDev: process.env.NODE_ENV === "development",
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      uploadOrigin: `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    });

    // The audio routes send their own, stricter Content-Security-Policy, which
    // a policy set here would replace.
    return [
      {
        source: "/((?!api/audio/|api/voices/).*)",
        headers,
      },
      {
        source: "/api/:route(audio|voices)/:path*",
        headers: headers.filter(
          ({ key }) => !key.startsWith("Content-Security-Policy"),
        ),
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: "connectflow-bg",
  project: "voice-cloning-app",
  // Needs SENTRY_AUTH_TOKEN at build time to upload source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // Proxy browser events through our own origin to dodge ad-blockers
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
