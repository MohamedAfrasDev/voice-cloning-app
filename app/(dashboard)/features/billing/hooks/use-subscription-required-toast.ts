import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { useCheckout } from "./use-checkout";

/** Offers checkout to those who can pay; tells members whom to ask. */
export function useSubscriptionRequiredToast() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { checkout } = useCheckout();

  return useCallback(async () => {
    // If the role can't be loaded, don't offer an action that may be refused.
    const status = await queryClient
      .fetchQuery(trpc.billing.getStatus.queryOptions())
      .catch(() => null);

    toast.error(
      "Subscription required",
      status?.canManageBilling
        ? { action: { label: "Subscribe", onClick: () => checkout() } }
        : { description: "Ask an owner or admin to subscribe." },
    );
  }, [trpc, queryClient, checkout]);
}
