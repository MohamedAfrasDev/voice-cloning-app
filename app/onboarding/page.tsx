import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { getMemberRoles } from "@/lib/auth/membership";
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
  // The active workspace may be one the user has since been removed from.
  const orgId = session.session.activeOrganizationId;
  const hasWorkspace =
    !!orgId && !!(await getMemberRoles(session.user.id, orgId));
  // Already have a workspace and not explicitly adding another: skip onboarding.
  if (hasWorkspace && !isNew) redirect("/");

  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });

  return (
    <OnboardingForm
      userName={session.user.name || session.user.email}
      canCancel={hasWorkspace}
      organizations={organizations.map((o) => ({ id: o.id, name: o.name }))}
    />
  );
}
