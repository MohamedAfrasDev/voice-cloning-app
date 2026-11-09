"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { data: organizations } = authClient.useListOrganizations();
  const { data: active } = authClient.useActiveOrganization();

  async function switchTo(organizationId: string) {
    await authClient.organization.setActive({ organizationId });
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
        <DropdownMenuItem render={<Link href="/org-selection" />}>
          + Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
