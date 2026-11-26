export type ThemePreference = "light" | "dark" | "system";
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function parseThemePreference(value: unknown): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): Theme {
  if (preference !== "system") return preference;
  return systemPrefersDark ? "dark" : "light";
}

/**
 * Runs before the first paint so the page never flashes the wrong theme. It
 * must stay self-contained and agree with `resolveTheme`.
 */
export const THEME_INIT_SCRIPT = `(function(){var p;try{p=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var d=p==="dark"||(p!=="light"&&matchMedia("${DARK_SCHEME_QUERY}").matches);document.documentElement.classList.toggle("dark",d)})()`;
