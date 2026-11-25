"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { SignOutButton } from "@/app/auth/sign-out-button";
import Logo from "@/public/logo.svg";

type Org = { id: string; name: string };

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const randomSuffix = () => Math.random().toString(36).slice(2, 6);

export function OnboardingForm({
  userName,
  organizations,
  canCancel,
}: {
  userName: string;
  organizations: Org[];
  canCancel: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [joiningId, setJoiningId] = useState<string>();

  const firstName = userName.split(/[\s@]/)[0];
  const hasOrgs = organizations.length > 0;

  function enter() {
    router.replace("/");
    router.refresh();
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Workspace name must be at least 2 characters.");
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      const base = slugify(trimmed) || "workspace";
      // Try a clean slug first; fall back to a suffixed one if it's taken.
      let result = await authClient.organization.create({
        name: trimmed,
        slug: base,
      });
      if (result.error) {
        result = await authClient.organization.create({
          name: trimmed,
          slug: `${base}-${randomSuffix()}`,
        });
      }
      if (result.error) {
        setError(result.error.message ?? "Couldn't create the workspace.");
        return;
      }
      enter();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  async function onJoin(organizationId: string) {
    setError(undefined);
    setJoiningId(organizationId);
    const { error } = await authClient.organization.setActive({
      organizationId,
    });
    if (error) {
      setError(error.message ?? "Couldn't open that workspace.");
      setJoiningId(undefined);
      return;
    }
    enter();
  }

  const busy = pending || !!joiningId;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, oklch(0.63 0.2 254 / 0.25), transparent 70%)",
        }}
      />
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {canCancel && (
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
        )}
        <SignOutButton />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image src={Logo} alt="" width={40} height={40} className="size-10" />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {hasOrgs
                ? "Choose a workspace"
                : `Welcome, ${firstName}. Let's set up your workspace`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasOrgs
                ? "Pick where you want to work, or create a new one."
                : "A workspace keeps your voices and generations together. You can invite teammates later."}
            </p>
          </div>
        </div>

        {hasOrgs && (
          <ul className="space-y-2">
            {organizations.map((org) => (
              <li key={org.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onJoin(org.id)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent disabled:opacity-60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </span>
                  <span className="flex-1 truncate text-sm font-medium">
                    {org.name}
                  </span>
                  {joiningId === org.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4 text-muted-foreground" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={onCreate}
          className="space-y-4 rounded-xl border bg-card p-5"
        >
          <div className="space-y-1.5">
            <label htmlFor="org-name" className="text-sm font-medium">
              {hasOrgs ? "New workspace name" : "Workspace name"}
            </label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Studio"
              autoFocus={!hasOrgs}
              autoComplete="organization"
              maxLength={60}
              required
            />
            {name.trim() && (
              <p className="text-xs text-muted-foreground">
                URL handle:{" "}
                <span className="font-mono">
                  {slugify(name) || "workspace"}
                </span>
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "Creating..." : "Create workspace"}
          </Button>
        </form>
      </div>
    </main>
  );
}
