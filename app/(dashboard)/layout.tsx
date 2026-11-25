import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { SidebarUser } from "@/components/layout/sidebar-user";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

// Every dashboard page needs an active workspace; new users go to onboarding.
async function RequireOrganization({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (!session.session.activeOrganizationId) redirect("/onboarding");
  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<span>Loading...</span>}>
        <AppSidebar
          footer={
            <Suspense>
              <SidebarUser />
            </Suspense>
          }
        />
      </Suspense>
      <Suspense fallback={<span>Loading...</span>}>
        <SidebarInset>
          <RequireOrganization>
            <div className="flex flex-1 flex-col">{children}</div>
            <Toaster />
          </RequireOrganization>
        </SidebarInset>
      </Suspense>
    </SidebarProvider>
  );
}
