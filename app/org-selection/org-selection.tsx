"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";

function toSlug(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "org"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function OrgSelection() {
  const router = useRouter();
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function select(organizationId: string) {
    setBusy(true);
    const { error } = await authClient.organization.setActive({
      organizationId,
    });
    if (error) {
      setError(error.message ?? "Could not switch organization");
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setBusy(true);
    const { data, error } = await authClient.organization.create({
      name: name.trim(),
      slug: toSlug(name),
    });
    if (error || !data) {
      setError(error?.message ?? "Could not create organization");
      setBusy(false);
      return;
    }
    // create() does not reliably activate the new organization in the session.
    await select(data.id);
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Choose an organization</h1>

        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : organizations && organizations.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {organizations.map((org) => (
              <li key={org.id}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={busy}
                  onClick={() => select(org.id)}
                >
                  {org.name}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            You don&apos;t belong to any organization yet.
          </p>
        )}

        <form onSubmit={create} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Create a new organization</h2>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Organization name"
            required
            maxLength={60}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={busy || !name.trim()}>
            Create organization
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
