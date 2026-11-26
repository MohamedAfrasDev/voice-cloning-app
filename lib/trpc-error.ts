import type { TRPCError } from "@trpc/server";

export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please retry";

/**
 * tRPC copies the message of any unexpected exception into the response, which
 * would expose database, storage and billing internals. Messages we wrote
 * ourselves (a TRPCError without a cause) are meant for the user and stay.
 */
export function maskInternalError<T extends { message: string }>(
  shape: T,
  error: Pick<TRPCError, "code" | "cause">,
): T {
  if (error.code !== "INTERNAL_SERVER_ERROR" || !error.cause) return shape;

  return { ...shape, message: GENERIC_ERROR_MESSAGE };
}
