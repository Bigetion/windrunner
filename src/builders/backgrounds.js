import {
  BG_ATTACHMENT_MAP,
  BG_CLIP_MAP,
  BG_ORIGIN_MAP,
  BG_REPEAT_MAP,
} from "../maps/effects.maps.js";
import { resolveThemeValue, resolveColorWithOpacity } from "../resolvers.js";

export function buildBackgroundDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("bg-")) return undefined;
  const key = baseToken.slice(3);

  if (BG_ATTACHMENT_MAP[key]) return BG_ATTACHMENT_MAP[key];
  if (key.startsWith("clip-"))   return BG_CLIP_MAP[key.slice(5)]   ?? undefined;
  if (key.startsWith("origin-")) return BG_ORIGIN_MAP[key.slice(7)] ?? undefined;
  if (BG_REPEAT_MAP[key]) return BG_REPEAT_MAP[key];

  // bg-size (any value from theme, not just 3 keywords)
  const bgSize = resolveThemeValue(theme.backgroundSize || {}, key);
  if (bgSize !== undefined) return `background-size: ${bgSize};`;

  // bg-position
  const bgPos = resolveThemeValue(theme.backgroundPosition || {}, key);
  if (bgPos !== undefined) return `background-position: ${bgPos};`;

  // bg-image (linear gradients etc.)
  const bgImage = resolveThemeValue(theme.backgroundImage || {}, key);
  if (bgImage !== undefined) return `background-image: ${bgImage};`;

  return undefined;
}

export function buildGradientDeclaration(baseToken, theme) {
  const colors = theme.gradientColorStops || theme.colors || {};

  // from-{color|position}
  if (baseToken.startsWith("from-")) {
    const key = baseToken.slice(5);
    
    // Position value (e.g., from-10%)
    if (key.endsWith("%") || /^\d+$/.test(key)) {
      return `--tw-gradient-from-position: ${key.endsWith("%") ? key : key + "%"};`;
    }
    
    // Color value
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) {
      return `--tw-gradient-from: ${color} var(--tw-gradient-from-position, 0%); --tw-gradient-to: transparent var(--tw-gradient-to-position, 100%); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`;
    }
  }

  // via-{color|position}
  if (baseToken.startsWith("via-")) {
    const key = baseToken.slice(4);
    
    // Position value (e.g., via-50%)
    if (key.endsWith("%") || /^\d+$/.test(key)) {
      return `--tw-gradient-via-position: ${key.endsWith("%") ? key : key + "%"};`;
    }
    
    // Color value
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) {
      return `--tw-gradient-to: transparent var(--tw-gradient-to-position, 100%); --tw-gradient-stops: var(--tw-gradient-from), ${color} var(--tw-gradient-via-position, 50%), var(--tw-gradient-to);`;
    }
  }

  // to-{color|position}
  if (baseToken.startsWith("to-")) {
    const key = baseToken.slice(3);
    
    // Position value (e.g., to-90%)
    if (key.endsWith("%") || /^\d+$/.test(key)) {
      return `--tw-gradient-to-position: ${key.endsWith("%") ? key : key + "%"};`;
    }
    
    // Color value
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) {
      return `--tw-gradient-to: ${color} var(--tw-gradient-to-position, 100%);`;
    }
  }

  return undefined;
}
