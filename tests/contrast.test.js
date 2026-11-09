import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Reads the token values straight from theme.css, so changing a color there
// re-runs these checks against the real palette.
const css = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8');

function tokensFor(selector) {
  const start = css.indexOf(selector);
  const block = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background, minimum ratio]
// 4.5 = WCAG AA for normal text, 3 = WCAG AA for UI components / focus rings.
const pairs = [
  ['color-text', 'color-bg', 4.5],
  ['color-text', 'color-surface', 4.5],
  ['color-text', 'color-surface-muted', 4.5],
  ['color-text-muted', 'color-bg', 4.5],
  ['color-text-muted', 'color-surface', 4.5],
  ['color-primary', 'color-surface', 4.5],
  ['color-primary', 'color-bg', 4.5],
  ['color-on-primary', 'color-primary', 4.5],
  ['color-on-primary', 'color-primary-hover', 4.5],
  ['color-on-primary-soft', 'color-primary-soft', 4.5],
  ['color-success', 'color-success-soft', 4.5],
  ['color-danger', 'color-danger-soft', 4.5],
  ['color-focus', 'color-surface', 3],
  ['color-focus', 'color-bg', 3],
];

const themes = {
  light: tokensFor(":root[data-theme='light']"),
  dark: tokensFor(":root[data-theme='dark']"),
};

describe.each(Object.entries(themes))('%s theme', (_name, tokens) => {
  it.each(pairs)('%s on %s meets %s:1', (fg, bg, min) => {
    expect(tokens[fg], `missing --${fg}`).toBeDefined();
    expect(tokens[bg], `missing --${bg}`).toBeDefined();
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(min);
  });
});

it('both themes define the same tokens', () => {
  expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort());
});
