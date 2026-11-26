import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { SignOutButton } from "@/app/auth/sign-out-button";
import { ThemePicker } from "@/components/theme/theme-picker";
import PageHeader from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 lg:p-6">
        <section
          aria-labelledby="account-heading"
          className="rounded-xl border bg-card"
        >
          <h2 id="account-heading" className="border-b p-4 font-semibold">
            Account
          </h2>
          <Suspense
            fallback={
              <div className="p-4">
                <Skeleton className="h-28 w-full" />
              </div>
            }
          >
            <AccountDetails />
          </Suspense>
        </section>

        <section
          aria-labelledby="appearance-heading"
          className="rounded-xl border bg-card"
        >
          <h2 id="appearance-heading" className="border-b p-4 font-semibold">
            Appearance
          </h2>
          <ThemePicker />
        </section>
      </div>
    </>
  );
}

// The dashboard layout guarantees a signed-in user with an active workspace.
async function AccountDetails() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return null;

  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });
  const workspace = organizations.find(
    (o) => o.id === session.session.activeOrganizationId,
  );

  const rows = [
    { label: "Name", value: session.user.name },
    { label: "Email", value: session.user.email },
    { label: "Current workspace", value: workspace?.name },
  ];

  return (
    <>
      <dl className="divide-y">
        {rows.map(({ label, value }) => (
          <div key={label} className="grid gap-1 p-4 sm:grid-cols-3">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium break-words sm:col-span-2">
              {value || "Not set"}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-end border-t p-4">
        <SignOutButton />
      </div>
    </>
  );
}
