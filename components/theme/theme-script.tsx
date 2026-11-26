"use client";

import { THEME_INIT_SCRIPT } from "@/lib/theme";

// Runs while the server HTML is parsed. On the client the type change keeps
// React from warning about a script it will never run. See the Next.js guide
// "How to prevent flash before hydration".
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
