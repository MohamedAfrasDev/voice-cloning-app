import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // No-op when the DSN is missing (e.g. local dev without Sentry)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  // VERCEL_ENV isn't exposed to the browser; the NEXT_PUBLIC_ variant is
  // (needs "Automatically expose System Environment Variables" on Vercel).
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  // 100% of traces in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
