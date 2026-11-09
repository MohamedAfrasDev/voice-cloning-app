import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

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
  return <HomeContent />;
}

function HomeContent() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black"></div>
  );
}
