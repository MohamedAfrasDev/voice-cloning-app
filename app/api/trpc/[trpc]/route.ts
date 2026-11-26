import * as Sentry from "@sentry/nextjs";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "../../../../trpc/init";
import { appRouter } from "@/trpc/routers/_apps";
import { MAX_TRPC_BATCH_SIZE } from "@/lib/limits";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    // Batching would otherwise pack unlimited calls into one request.
    maxBatchSize: MAX_TRPC_BATCH_SIZE,
    // Only report server faults; UNAUTHORIZED/NOT_FOUND/BAD_REQUEST etc. are expected.
    onError({ error, path, type }) {
      if (error.code !== "INTERNAL_SERVER_ERROR") return;
      Sentry.captureException(error.cause ?? error, {
        tags: { trpc_path: path ?? "unknown", trpc_type: type },
      });
    },
  });

export { handler as GET, handler as POST };
