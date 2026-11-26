"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";

export function OrgSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: organizations } = authClient.useListOrganizations();
  const { data: active } = authClient.useActiveOrganization();

  async function switchTo(organizationId: string) {
    if (organizationId === active?.id) return;
    const { error } = await authClient.organization.setActive({
      organizationId,
    });
    if (!error) {
      // A generation belongs to one organization, so leave its page with a
      // full load, which also discards the query cache.
      if (pathname.startsWith("/text-to-speech/")) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/text-to-speech");
        return;
      }
      // Reset rather than invalidate so the previous organization's data
      // isn't shown while refetching.
      queryClient.resetQueries();
    }
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        {active?.name ?? "Select organization"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {organizations?.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchTo(org.id)}
          >
            {org.name}
            {org.id === active?.id ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem render={<Link href="/onboarding?new=1" />}>
          + Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
