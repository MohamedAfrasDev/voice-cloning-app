import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import DashboardView from "@/components/layout/dashboard-view";

export default function Home() {
  return (
    <Suspense>
      <RequireOrganization />
    </Suspense>
  );
}

// Signed-in users must pick an organization before using the app.
async function RequireOrganization() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session.activeOrganizationId) redirect("/org-selection");
  return <DashboardView name={session.user.name || session.user.email} />;
}
