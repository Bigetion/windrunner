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

  // bg-size
  const bgSize = resolveThemeValue(theme.backgroundSize || {}, key);
  if (bgSize !== undefined && (key === "auto" || key === "cover" || key === "contain")) {
    return `background-size: ${bgSize};`;
  }

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
    if (key.endsWith("%")) return `--tw-gradient-from-position: ${key};`;
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) {
      return `--tw-gradient-from: ${color}; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via, transparent), var(--tw-gradient-to, transparent);`;
    }
  }

  // via-{color|position}
  if (baseToken.startsWith("via-")) {
    const key = baseToken.slice(4);
    if (key.endsWith("%")) return `--tw-gradient-via-position: ${key};`;
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) return `--tw-gradient-via: ${color};`;
  }

  // to-{color|position}
  if (baseToken.startsWith("to-")) {
    const key = baseToken.slice(3);
    if (key.endsWith("%")) return `--tw-gradient-to-position: ${key};`;
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) return `--tw-gradient-to: ${color};`;
  }

  return undefined;
}
