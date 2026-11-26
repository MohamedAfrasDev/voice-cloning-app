import assert from "node:assert/strict";
import { test } from "node:test";
import { TRPCError } from "@trpc/server";
import { GENERIC_ERROR_MESSAGE, maskInternalError } from "@/lib/trpc-error";

function messageFor(error: TRPCError) {
  return maskInternalError({ message: error.message }, error).message;
}

test("hides the message of unexpected exceptions", () => {
  // What tRPC builds when a procedure throws something else.
  const error = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    cause: new Error("connect ECONNREFUSED db.internal:5432"),
  });

  assert.equal(messageFor(error), GENERIC_ERROR_MESSAGE);
});

test("keeps messages written for the user", () => {
  for (const error of [
    new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate audio",
    }),
    new TRPCError({ code: "FORBIDDEN", message: "SUBSCRIPTION_REQUIRED" }),
    new TRPCError({ code: "NOT_FOUND", message: "Voice not found" }),
  ]) {
    assert.equal(messageFor(error), error.message);
  }
});
