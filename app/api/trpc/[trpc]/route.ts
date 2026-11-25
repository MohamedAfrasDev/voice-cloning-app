import * as Sentry from "@sentry/nextjs";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "../../../../trpc/init";
import { appRouter } from "@/trpc/routers/_apps";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    // Only report server faults; UNAUTHORIZED/NOT_FOUND/BAD_REQUEST etc. are expected.
    onError({ error, path, type }) {
      if (error.code !== "INTERNAL_SERVER_ERROR") return;
      Sentry.captureException(error.cause ?? error, {
        tags: { trpc_path: path ?? "unknown", trpc_type: type },
      });
    },
  });

export { handler as GET, handler as POST };
