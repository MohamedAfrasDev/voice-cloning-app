import * as Sentry from "@sentry/nextjs";
import { sentryPrivacy } from "./lib/sentry-privacy";
import { stripQueryStrings } from "./lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  ...sentryPrivacy,
  // No-op when the DSN is missing (e.g. local dev without Sentry)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  // VERCEL_ENV isn't exposed to the browser; the NEXT_PUBLIC_ variant is
  // (needs "Automatically expose System Environment Variables" on Vercel).
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  // 100% of traces in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  // Replays record the page: keep text, inputs and media (voice audio) out.
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
      // Covers navigation and request entries, not the page address recorded
      // with each full snapshot, which the SDK has no hook for.
      beforeAddRecordingEvent: (event) => stripQueryStrings(event),
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Replay events don't pass through beforeSend.
Sentry.addEventProcessor((event) => stripQueryStrings(event));

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
