import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Create your workspace" };

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  return (
    <Suspense>
      <OnboardingGate searchParams={searchParams} />
    </Suspense>
  );
}

async function OnboardingGate({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/sign-in");

  const { new: isNew } = await searchParams;
  // Already have a workspace and not explicitly adding another: skip onboarding.
  if (session.session.activeOrganizationId && !isNew) redirect("/");

  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });

  return (
    <OnboardingForm
      userName={session.user.name || session.user.email}
      canCancel={!!session.session.activeOrganizationId}
      organizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
    />
  );
}
