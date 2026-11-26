import * as Sentry from "@sentry/nextjs";
import { SUBSCRIPTION_REQUIRED } from "@/app/(dashboard)/features/billing/lib/error-codes";
import { getOrgAccess } from "@/lib/auth/org-access";
import { hasActiveSubscription } from "@/lib/billing";

/**
 * Who may upload a voice: a current member of a subscribed organization.
 * Returns the error response otherwise.
 */
export async function getUploadAccess() {
  const access = await getOrgAccess();

  if (access.error) return access;

  try {
    if (!(await hasActiveSubscription(access.orgId))) {
      return {
        error: Response.json({ error: SUBSCRIPTION_REQUIRED }, { status: 403 }),
      };
    }
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "voice-create-subscription-check" },
    });

    return {
      error: Response.json(
        { error: "Could not verify your subscription. Please retry" },
        { status: 503 },
      ),
    };
  }

  return access;
}
