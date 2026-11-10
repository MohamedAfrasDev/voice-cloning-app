import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { OrgSwitcher } from "@/app/auth/org-switcher";
import { SignOutButton } from "@/app/auth/sign-out-button";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Live Voice",
    template: "%s | Live Voice",
  },
  description: "AI-Powered text-to-speech and voice cloning platform",
};

async function UserMenu() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <OrgSwitcher />
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <SignOutButton />
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
