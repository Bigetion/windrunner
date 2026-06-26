import { INSET_SHADOW_SIZES, TEXT_SHADOW_SIZES } from "../maps/effects.maps.js";
import { resolveThemeValue, resolveColorWithOpacity } from "../resolvers.js";

export function buildOpacityDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("opacity-")) return undefined;
  const opacity = resolveThemeValue(theme.opacity || {}, baseToken.slice(8));
  if (opacity === undefined) return undefined;
  return `opacity: ${opacity};`;
}

export function buildShadowDeclaration(baseToken, theme) {
  if (baseToken === "shadow") {
    const value = resolveThemeValue(theme.boxShadow || {}, "DEFAULT");
    if (value === undefined) return undefined;
    return `box-shadow: ${value};`;
  }
  if (!baseToken.startsWith("shadow-")) return undefined;

  const valueKey = baseToken.slice(7);
  // shadow-color
  const color = resolveColorWithOpacity(theme.colors || {}, valueKey);
  if (color !== undefined) return `--tw-shadow-color: ${color};`;
  const value = resolveThemeValue(theme.boxShadow || {}, valueKey);
  if (value === undefined) return undefined;
  return `box-shadow: ${value};`;
}

export function buildInsetShadowDeclaration(baseToken, theme) {
  if (baseToken === "inset-shadow") return INSET_SHADOW_SIZES.DEFAULT;

  if (baseToken.startsWith("inset-shadow-")) {
    const key = baseToken.slice(13);
    if (INSET_SHADOW_SIZES[key]) return INSET_SHADOW_SIZES[key];
    const color = resolveColorWithOpacity(theme.colors || {}, key);
    if (color !== undefined) return `--tw-inset-shadow-color: ${color};`;
  }

  return undefined;
}

export function buildInsetRingDeclaration(baseToken, theme) {
  const ringColors = theme.ringColor || {};
  const colors = theme.colors || {};

  if (baseToken === "inset-ring") {
    return `box-shadow: inset 0 0 0 1px var(--tw-inset-ring-color, currentColor);`;
  }

  if (baseToken.startsWith("inset-ring-")) {
    const key = baseToken.slice(11);
    if (/^\d+$/.test(key)) {
      return `box-shadow: inset 0 0 0 ${key}px var(--tw-inset-ring-color, currentColor);`;
    }
    const color = resolveColorWithOpacity({ ...ringColors, ...colors }, key);
    if (color !== undefined) return `--tw-inset-ring-color: ${color};`;
  }

  return undefined;
}

export function buildRingDeclaration(baseToken, theme) {
  const ringColorScale = theme.ringColor || {};
  const ringWidthScale = theme.ringWidth || {};
  const defaultRingColor = resolveThemeValue(ringColorScale, "DEFAULT") || "#3b82f6";

  const buildRingWidth = (widthValue) =>
    `--tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: ${defaultRingColor}; box-shadow: var(--tw-ring-inset,) 0 0 0 calc(${widthValue} + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color);`;

  if (baseToken === "ring") {
    const widthValue = resolveThemeValue(ringWidthScale, "DEFAULT") || "3px";
    return buildRingWidth(widthValue);
  }

  if (!baseToken.startsWith("ring-")) return undefined;
  const valueKey = baseToken.slice(5);

  const widthValue = resolveThemeValue(ringWidthScale, valueKey);
  if (widthValue !== undefined) return buildRingWidth(widthValue);

  if (valueKey === "inset") return `--tw-ring-inset: inset;`;

  const colorValue =
    resolveColorWithOpacity(ringColorScale, valueKey) ||
    resolveColorWithOpacity(theme.colors || {}, valueKey);
  if (colorValue !== undefined) return `--tw-ring-color: ${colorValue};`;

  return undefined;
}

export function buildTextShadowDeclaration(baseToken, theme) {
  if (baseToken === "text-shadow") {
    const val = (theme.textShadow || TEXT_SHADOW_SIZES).DEFAULT || TEXT_SHADOW_SIZES.DEFAULT;
    return `text-shadow: ${val};`;
  }

  if (baseToken.startsWith("text-shadow-")) {
    const key = baseToken.slice(12);
    // text-shadow-color
    const color = resolveColorWithOpacity(theme.colors || {}, key);
    if (color !== undefined) return `--tw-text-shadow-color: ${color};`;
    // text-shadow-size
    const scale = theme.textShadow || TEXT_SHADOW_SIZES;
    const val = resolveThemeValue(scale, key);
    if (val !== undefined) return val === "none" ? "text-shadow: none;" : `text-shadow: ${val};`;
  }

  return undefined;
}

export function buildRingOffsetDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("ring-offset-")) return undefined;
  const key = baseToken.slice(12);

  // ring-offset-{width}
  const widthVal = resolveThemeValue(theme.ringOffsetWidth || {}, key);
  if (widthVal !== undefined) {
    return `--tw-ring-offset-width: ${widthVal}; box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000);`;
  }

  // ring-offset-{color}
  let color = resolveColorWithOpacity(theme.ringOffsetColor || {}, key);
  if (color === undefined) {
    color = resolveColorWithOpacity(theme.colors || {}, key);
  }
  if (color !== undefined) return `--tw-ring-offset-color: ${color};`;

  return undefined;
}
