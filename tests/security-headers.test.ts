import assert from "node:assert/strict";
import { test } from "node:test";
import { securityHeaders } from "@/lib/security-headers";

function header(name: string, options = { isDev: false }) {
  return securityHeaders(options).find(({ key }) => key === name)?.value ?? "";
}

test("blocks framing", () => {
  assert.equal(header("X-Frame-Options"), "DENY");
  assert.match(header("Content-Security-Policy"), /frame-ancestors 'none'/);
});

test("allows eval only in development", () => {
  const name = "Content-Security-Policy-Report-Only";

  assert.doesNotMatch(header(name), /unsafe-eval/);
  assert.match(header(name, { isDev: true }), /unsafe-eval/);
});

test("allows the Sentry origin and ignores a malformed one", () => {
  const policy = (sentryDsn: string) =>
    securityHeaders({ isDev: false, sentryDsn })[1].value;

  assert.match(
    policy("https://key@o1.ingest.sentry.io/2"),
    /connect-src 'self' blob: https:\/\/o1\.ingest\.sentry\.io;/,
  );
  assert.match(policy("not a url"), /connect-src 'self' blob:;/);
});
