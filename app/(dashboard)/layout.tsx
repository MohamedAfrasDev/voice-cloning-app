import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { getMemberRoles } from "@/lib/auth/membership";
import { SidebarUser } from "@/components/layout/sidebar-user";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// Every dashboard page needs an active workspace; new users go to onboarding.
async function RequireOrganization({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const orgId = session.session.activeOrganizationId;
  if (!orgId || !(await getMemberRoles(session.user.id, orgId))) {
    redirect("/onboarding");
  }
  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center w-screen h-screen">
            <Spinner />
          </div>
        }
      >
        <AppSidebar
          footer={
            <Suspense>
              <SidebarUser />
            </Suspense>
          }
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <SidebarInset>
          <RequireOrganization>
            <div className="flex flex-1 flex-col">{children}</div>
          </RequireOrganization>
        </SidebarInset>
      </Suspense>
    </SidebarProvider>
  );
}
