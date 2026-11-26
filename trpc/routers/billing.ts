import { errors } from "@polar-sh/sdk/2026-10";
import { createTRPCRouter, orgAdminProcedure, orgProcedure } from "../init";
import { isOrgAdmin } from "@/lib/auth/roles";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { TRPCError } from "@trpc/server";

export const billingRouter = createTRPCRouter({
  createCheckout: orgAdminProcedure.mutation(async ({ ctx }) => {
    const result = await polar.checkouts.create({
      products: [env.POLAR_PRODUCT_ID],
      external_customer_id: ctx.orgId,
      success_url: env.APP_URL,
    });

    if (!result.url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create checkout session",
      });
    }

    return { checkoutUrl: result.url };
  }),
  createPortalSession: orgAdminProcedure.mutation(async ({ ctx }) => {
    const result = await polar.customerSessions.create({
      external_customer_id: ctx.orgId,
    });

    if (!result.customer_portal_url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create customer portal session",
      });
    }

    return { checkoutUrl: result.customer_portal_url };
  }),

  getStatus: orgProcedure.query(async ({ ctx }) => {
    const canManageBilling = isOrgAdmin(ctx.roles);

    try {
      const customerState = await polar.customers.getStateExternal(ctx.orgId);

      const hasActiveSubscription =
        (customerState.active_subscriptions ?? []).length > 0;

      let estimatedCostCents = 0;

      for (const sub of customerState.active_subscriptions ?? []) {
        for (const meter of sub.meters ?? []) {
          estimatedCostCents += meter.amount ?? 0;
        }
      }

      return {
        hasActiveSubscription,
        customerId: customerState.id,
        estimatedCostCents,
        canManageBilling,
      };
    } catch (err) {
      // An org that never checked out has no Polar customer yet.
      if (!(err instanceof errors.ResourceNotFound)) throw err;

      return {
        hasActiveSubscription: false,
        customerId: null,
        estimatedCostCents: 0,
        canManageBilling,
      };
    }
  }),
});
