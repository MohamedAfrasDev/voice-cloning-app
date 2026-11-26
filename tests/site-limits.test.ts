import assert from "node:assert/strict";
import { test } from "node:test";
import { parseLimit, siteDailyLimits } from "@/lib/site-limits";

test("has caps when nothing is configured", () => {
  const { generations, characters } = siteDailyLimits({});

  assert.equal(generations.limit, 100);
  assert.equal(characters.limit, 50_000);
});

test("reads configured caps, including 0 to switch generation off", () => {
  const { generations, characters } = siteDailyLimits({
    SITE_DAILY_GENERATION_LIMIT: "0",
    SITE_DAILY_CHARACTER_LIMIT: " 1234 ",
  });

  assert.equal(generations.limit, 0);
  assert.equal(characters.limit, 1234);
});

test("keeps the default for malformed values", () => {
  for (const value of ["", "-1", "1.5", "50k", "50_000", "Infinity", "1e9"]) {
    assert.equal(parseLimit(value, 7), 7, value);
  }
});

test("stays within what the database column holds", () => {
  assert.equal(parseLimit("99999999999999999999", 7), 2_147_483_647);
});
