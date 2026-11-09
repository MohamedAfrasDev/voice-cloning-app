"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const isSignIn = mode === "sign-in";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      const { error } = isSignIn
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({
            email,
            password,
            name: email.split("@")[0],
          });
      if (error) {
        setError(error.message ?? "Something went wrong");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-sm flex-col gap-4"
        >
          <h1 className="text-2xl font-semibold">
            {isSignIn ? "Sign in" : "Create your account"}
          </h1>
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={8}
            autoComplete={isSignIn ? "current-password" : "new-password"}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Please wait..." : isSignIn ? "Sign in" : "Sign up"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {isSignIn ? "No account? " : "Already have an account? "}
            <Link
              href={isSignIn ? "/sign-up" : "/sign-in"}
              className="underline"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
