import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import DashboardView from "@/components/layout/dashboard-view";

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

// The dashboard layout guarantees a signed-in user with an active workspace.
async function HomeContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <DashboardView name={session?.user.name || session?.user.email || ""} />
  );
}
