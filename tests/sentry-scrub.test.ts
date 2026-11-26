import assert from "node:assert/strict";
import { test } from "node:test";
import { stripQueryStrings } from "@/lib/sentry-scrub";

test("removes query strings from URLs and paths, wherever they are", () => {
  const event = {
    transaction: "GET /text-to-speech?text=private%20words",
    request: {
      url: "https://app.test/voices?query=secret",
      query_string: "query=secret",
    },
    breadcrumbs: [{ data: { to: "/text-to-speech?text=hello&voiceId=1" } }],
    attributes: {
      "http.target": "/api/trpc/voices.getAll?input=abc",
      "url.query": "input=abc",
    },
  };

  assert.deepEqual(stripQueryStrings(event), {
    transaction: "GET /text-to-speech",
    request: { url: "https://app.test/voices" },
    breadcrumbs: [{ data: { to: "/text-to-speech" } }],
    attributes: { "http.target": "/api/trpc/voices.getAll" },
  });
});

test("leaves other values alone", () => {
  const value = {
    message: "Why did this fail? Unknown",
    sql: "SELECT 1 WHERE a = $1",
    count: 3,
    missing: null,
  };

  assert.deepEqual(stripQueryStrings({ ...value }), value);
});

test("handles circular structures", () => {
  const value: Record<string, unknown> = { url: "/a?b=c" };
  value.self = value;

  assert.equal(stripQueryStrings(value).url, "/a");
});
