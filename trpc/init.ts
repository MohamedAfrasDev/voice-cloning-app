import { auth } from "@/lib/auth/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return {};
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const authProcedure = t.procedure.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: session.session,
      user: session.user,
      userId: session.user.id,
      orgId: session.session.activeOrganizationId ?? null,
    },
  });
});

export const orgProcedure = authProcedure.use(async ({ ctx, next }) => {
  if (!ctx.orgId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "An active organization is required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      orgId: ctx.orgId,
    },
  });
});
