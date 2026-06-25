import { resolveThemeValue } from "../resolvers.js";

export function buildFilterDeclaration(baseToken, theme) {
  const negative = baseToken.startsWith("-");
  const normalized = negative ? baseToken.slice(1) : baseToken;
  const isBackdrop = normalized.startsWith("backdrop-");
  const rest = isBackdrop ? normalized.slice(9) : normalized;
  const prefix = isBackdrop ? "backdrop-filter" : "filter";

  const getScale = (key) => {
    if (isBackdrop) {
      const backdropKey = `backdrop${key.charAt(0).toUpperCase() + key.slice(1)}`;
      return theme[backdropKey] || theme[key] || {};
    }
    return theme[key] || {};
  };

  if (rest === "blur" || rest.startsWith("blur-")) {
    const key = rest === "blur" ? "DEFAULT" : rest.slice(5);
    const val = resolveThemeValue(getScale("blur"), key);
    if (val !== undefined) return `${prefix}: blur(${val});`;
  }

  if (rest.startsWith("brightness-")) {
    const val = resolveThemeValue(getScale("brightness"), rest.slice(11));
    if (val !== undefined) return `${prefix}: brightness(${val});`;
  }

  if (rest.startsWith("contrast-")) {
    const val = resolveThemeValue(getScale("contrast"), rest.slice(9));
    if (val !== undefined) return `${prefix}: contrast(${val});`;
  }

  if (rest === "grayscale" || rest.startsWith("grayscale-")) {
    const key = rest === "grayscale" ? "DEFAULT" : rest.slice(10);
    const val = resolveThemeValue(getScale("grayscale"), key);
    if (val !== undefined) return `${prefix}: grayscale(${val});`;
  }

  if (rest.startsWith("hue-rotate-")) {
    const val = resolveThemeValue(getScale("hueRotate"), rest.slice(11));
    if (val !== undefined) {
      const v = negative ? `-${val}` : val;
      return `${prefix}: hue-rotate(${v});`;
    }
  }

  if (rest === "invert" || rest.startsWith("invert-")) {
    const key = rest === "invert" ? "DEFAULT" : rest.slice(7);
    const val = resolveThemeValue(getScale("invert"), key);
    if (val !== undefined) return `${prefix}: invert(${val});`;
  }

  if (rest.startsWith("saturate-")) {
    const val = resolveThemeValue(getScale("saturate"), rest.slice(9));
    if (val !== undefined) return `${prefix}: saturate(${val});`;
  }

  if (rest === "sepia" || rest.startsWith("sepia-")) {
    const key = rest === "sepia" ? "DEFAULT" : rest.slice(6);
    const val = resolveThemeValue(getScale("sepia"), key);
    if (val !== undefined) return `${prefix}: sepia(${val});`;
  }

  // drop-shadow (non-backdrop only)
  if (!isBackdrop && rest === "drop-shadow") {
    const val = resolveThemeValue(theme.dropShadow || {}, "DEFAULT");
    if (val !== undefined) return `filter: drop-shadow(${val});`;
  }
  if (!isBackdrop && rest.startsWith("drop-shadow-")) {
    const val = resolveThemeValue(theme.dropShadow || {}, rest.slice(12) || "DEFAULT");
    if (val !== undefined) return `filter: drop-shadow(${val});`;
  }

  // backdrop-opacity
  if (isBackdrop && rest.startsWith("opacity-")) {
    const val = resolveThemeValue(theme.backdropOpacity || theme.opacity || {}, rest.slice(8));
    if (val !== undefined) return `backdrop-filter: opacity(${val});`;
  }

  return undefined;
}
