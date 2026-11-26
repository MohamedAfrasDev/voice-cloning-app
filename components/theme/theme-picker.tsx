"use client";

import { useTheme } from "@/hooks/use-theme";
import { THEME_OPTIONS } from "./theme-options";

export function ThemePicker() {
  const { preference, setPreference } = useTheme();

  return (
    <fieldset className="p-4">
      <legend className="sr-only">Theme</legend>
      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-input p-4 text-sm font-medium transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/5 has-checked:text-primary has-focus-visible:ring-3 has-focus-visible:ring-ring"
          >
            <Icon className="size-5" aria-hidden />
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                value={value}
                checked={preference === value}
                onChange={() => setPreference(value)}
                className="accent-primary outline-none"
              />
              {label}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        System follows your device setting. Saved in this browser.
      </p>
    </fieldset>
  );
}
