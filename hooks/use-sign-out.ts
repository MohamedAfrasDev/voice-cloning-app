"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message ?? "Couldn't sign you out. Try again.");
        return;
      }
      // The next person to sign in must not see this account's cached data.
      queryClient.clear();
      router.push("/sign-in");
      router.refresh();
    } catch {
      toast.error("Couldn't sign you out. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return { signOut, isPending };
}
