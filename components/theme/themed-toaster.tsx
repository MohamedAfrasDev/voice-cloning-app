"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/hooks/use-theme";

export function ThemedToaster() {
  // Mounted on every page, so this also keeps the theme in step with the
  // system setting and other tabs.
  const { theme } = useTheme();
  return <Toaster theme={theme} />;
}
