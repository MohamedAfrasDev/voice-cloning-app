"use client";

import { useSyncExternalStore } from "react";
import {
  DARK_SCHEME_QUERY,
  parseThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemePreference,
} from "@/lib/theme";

const CHANGE_EVENT = "themechange";

// Used when storage is blocked, so the choice still lasts for this visit.
let unsavedPreference: ThemePreference | undefined;

function getPreference(): ThemePreference {
  if (unsavedPreference) return unsavedPreference;
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

function getTheme(): Theme {
  return resolveTheme(
    getPreference(),
    window.matchMedia(DARK_SCHEME_QUERY).matches,
  );
}

function applyTheme() {
  document.documentElement.classList.toggle("dark", getTheme() === "dark");
}

// The class is applied before subscribers re-render, so they can read the new
// CSS variables.
function subscribe(onChange: () => void) {
  const update = () => {
    applyTheme();
    onChange();
  };
  const system = window.matchMedia(DARK_SCHEME_QUERY);
  system.addEventListener("change", update);
  window.addEventListener("storage", update);
  window.addEventListener(CHANGE_EVENT, update);
  return () => {
    system.removeEventListener("change", update);
    window.removeEventListener("storage", update);
    window.removeEventListener(CHANGE_EVENT, update);
  };
}

function setPreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    unsavedPreference = undefined;
  } catch {
    unsavedPreference = preference;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useTheme() {
  const preference = useSyncExternalStore<ThemePreference | null>(
    subscribe,
    getPreference,
    () => null,
  );
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    getTheme,
    () => "light",
  );

  /** `preference` is `null` until the browser can read the saved choice. */
  return { preference, theme, setPreference };
}
