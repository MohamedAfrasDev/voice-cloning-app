import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import {
  parseThemePreference,
  resolveTheme,
  THEME_INIT_SCRIPT,
} from "../lib/theme";

const css = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

function tokens(selector: ":root" | ".dark") {
  const body = css.split(`\n${selector} {`)[1]?.split("}")[0];
  assert.ok(body, `missing ${selector} block`);
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}

type Rgb = number[];
const rgb = (hex: string): Rgb =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (top: Rgb, bottom: Rgb, alpha: number): Rgb =>
  top.map((v, i) => v * alpha + bottom[i] * (1 - alpha));
function luminance(color: Rgb) {
  const [r, g, b] = color.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: Rgb, b: Rgb) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

const SURFACES = ["background", "card", "muted", "sidebar"];

// [foreground token, background tokens, minimum ratio]
const PAIRS: [string, string[], number][] = [
  ["foreground", SURFACES, 4.5],
  ["muted-foreground", SURFACES, 4.5],
  ["primary", SURFACES, 4.5],
  ["destructive", SURFACES, 4.5],
  ["success", SURFACES, 4.5],
  ["warning", SURFACES, 4.5],
  ["primary-foreground", ["primary", "primary-hover"], 4.5],
  ["input", ["background", "card"], 3],
  ["ring", ["background", "card", "sidebar"], 3],
  ["waveform", ["background", "card"], 3],
  ["waveform-progress", ["background", "card"], 3],
];

for (const [name, selector, tint] of [
  ["light", ":root", 0.1],
  ["dark", ".dark", 0.2],
] as const) {
  test(`${name} theme colors meet WCAG contrast`, () => {
    const t = tokens(selector);
    const color = (token: string) => {
      assert.ok(t[token], `missing --${token}`);
      return rgb(t[token]);
    };
    const check = (label: string, fg: Rgb, bg: Rgb, min: number) => {
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= min, `${label}: ${ratio.toFixed(2)} < ${min}`);
    };

    for (const [fg, backgrounds, min] of PAIRS) {
      for (const bg of backgrounds) {
        check(`${fg} on ${bg}`, color(fg), color(bg), min);
      }
    }
    // Tinted fills used by destructive buttons and the active nav item.
    for (const surface of ["background", "card"]) {
      const bg = mix(color("destructive"), color(surface), tint);
      check(`destructive on its tint over ${surface}`, color("destructive"), bg, 4.5);
    }
    const active = mix(color("primary"), color("sidebar"), 0.05);
    check("primary on active nav item", color("primary"), active, 4.5);
  });
}

test("resolveTheme follows the system only for the system preference", () => {
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(parseThemePreference("nonsense"), "system");
  assert.equal(parseThemePreference(null), "system");
});

test("the pre-paint script agrees with resolveTheme", () => {
  for (const stored of ["light", "dark", "system", null, "blocked"]) {
    for (const systemDark of [true, false]) {
      let dark: boolean | undefined;
      runInNewContext(THEME_INIT_SCRIPT, {
        localStorage: {
          getItem: () => {
            if (stored === "blocked") throw new Error("blocked");
            return stored;
          },
        },
        matchMedia: () => ({ matches: systemDark }),
        document: {
          documentElement: {
            classList: { toggle: (_: string, on: boolean) => (dark = on) },
          },
        },
      });
      const expected = resolveTheme(parseThemePreference(stored), systemDark);
      assert.equal(dark, expected === "dark", `${stored}/${systemDark}`);
    }
  }
});
