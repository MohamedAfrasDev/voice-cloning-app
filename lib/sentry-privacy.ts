import type { init } from "@sentry/nextjs";
import { stripQueryStrings } from "./sentry-scrub";

type InitOptions = NonNullable<Parameters<typeof init>[0]>;

/**
 * Privacy settings shared by every Sentry runtime. The SDK's defaults send
 * request bodies and query strings, which here carry passwords, email
 * addresses and the text people turn into speech.
 */
export const sentryPrivacy = {
  dataCollection: {
    // Errors are tied to a user id set explicitly in trpc/init.ts.
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: { allow: ["user-agent", "content-type"] },
      response: false,
    },
    httpBodies: [],
    urlQueryParams: false,
    databaseQueryData: false,
    stackFrameVariables: false,
    genAI: { inputs: false, outputs: false },
  },
  beforeSend: (event) => stripQueryStrings(event),
  beforeSendSpan: (span) => stripQueryStrings(span),
  beforeBreadcrumb: (breadcrumb) => stripQueryStrings(breadcrumb),
} satisfies InitOptions;
