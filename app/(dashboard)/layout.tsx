import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { OrgSwitcher } from "@/app/auth/org-switcher";
import { SignOutButton } from "@/app/auth/sign-out-button";
import { SidebarUser } from "@/components/layout/sidebar-user";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

async function UserMenu() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <OrgSwitcher />
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {user.email}
      </span>
      <SignOutButton />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar
        footer={
          <Suspense>
            <SidebarUser />
          </Suspense>
        }
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
