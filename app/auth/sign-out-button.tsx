"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-sign-out";

export function SignOutButton() {
  const { signOut, isPending } = useSignOut();
  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={signOut}>
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
