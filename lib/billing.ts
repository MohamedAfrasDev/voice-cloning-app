import { errors } from "@polar-sh/sdk/2026-10";
import { polar } from "./polar";

/**
 * Throws when Polar can't be reached, so callers fail closed: never run paid
 * work on an unverified subscription.
 */
export async function hasActiveSubscription(orgId: string) {
  try {
    const state = await polar.customers.getStateExternal(orgId);
    return (state.active_subscriptions ?? []).length > 0;
  } catch (err) {
    // An org that never checked out has no Polar customer yet.
    if (err instanceof errors.ResourceNotFound) return false;
    throw err;
  }
}
