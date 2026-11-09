"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  AudioWaveform,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import Logo from "@/public/logo.svg";

type Mode = "sign-in" | "sign-up";

const COPY: Record<
  Mode,
  { title: string; subtitle: string; submit: string; switchPrompt: string; switchAction: string }
> = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to your Live Voice workspace.",
    submit: "Sign in",
    switchPrompt: "Don't have an account?",
    switchAction: "Create one",
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Start cloning and generating voices in minutes.",
    submit: "Create account",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
  },
};

const FEATURES = [
  {
    icon: AudioWaveform,
    title: "Studio-grade voice cloning",
    body: "Replicate any voice from a short sample with natural prosody.",
  },
  {
    icon: Sparkles,
    title: "Real-time generation",
    body: "Low-latency synthesis built for production workloads.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Encrypted storage, isolated workspaces and organization-level access.",
  },
];

export function AuthForm({ mode: initialMode }: { mode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSignIn = mode === "sign-in";
  const copy = COPY[mode];

  function switchMode() {
    const next: Mode = isSignIn ? "sign-up" : "sign-in";
    setMode(next);
    setError(undefined);
    setShowPassword(false);
    // Keep the URL in sync without a navigation / remount.
    window.history.replaceState(null, "", `/${next}`);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const name = String(form.get("name") ?? "").trim();

    try {
      const { error } = isSignIn
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({
            email,
            password,
            name: name || email.split("@")[0],
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
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Left: product intro */}
      <aside className="relative hidden overflow-hidden bg-zinc-950 text-zinc-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 20% 0%, oklch(0.63 0.2 254 / 0.35), transparent 70%), radial-gradient(50% 40% at 100% 100%, oklch(0.63 0.2 254 / 0.2), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <Image src={Logo} alt="" width={32} height={32} className="size-8" />
          <span className="text-lg font-semibold tracking-tight">
            Live Voice
          </span>
        </div>

        <div className="relative max-w-lg space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-balance">
              Voice AI infrastructure your team can trust.
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              Clone, manage and generate lifelike speech from a single secure
              workspace — built for teams shipping voice at scale.
            </p>
          </div>

          <ul className="space-y-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Icon className="size-5 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-sm text-zinc-400">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-zinc-500">
          <Lock className="size-3.5" />
          <span>Encrypted in transit and at rest</span>
          <span aria-hidden>·</span>
          <span>Live Voice</span>
        </div>
      </aside>

      {/* Right: auth card */}
      <main className="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image src={Logo} alt="" width={28} height={28} className="size-7" />
            <span className="text-lg font-semibold tracking-tight">
              Live Voice
            </span>
          </div>

          <div className="mb-8 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {copy.title}
            </h1>
            <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="w-full">
              <Image
                src="https://img.icons8.com/color/96/google-logo.png"
                alt=""
                width={50}
                height={50}
                className="size-4"
              />
              Google
            </Button>
            <Button type="button" variant="outline" className="w-full">
              <Image
                src="https://img.icons8.com/ios-filled/50/github.png"
                alt=""
                width={50}
                height={50}
                className="size-4 dark:invert"
              />
              GitHub
            </Button>
          </div>

          <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
            {!isSignIn && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium">
                  Full name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Cooper"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Work email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignIn ? "Enter your password" : "At least 8 characters"}
                  required
                  minLength={8}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
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

            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? "Please wait..." : copy.submit}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {copy.switchPrompt}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {copy.switchAction}
            </button>
          </p>

          {!isSignIn && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By creating an account you agree to our Terms of Service and
              Privacy Policy.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
