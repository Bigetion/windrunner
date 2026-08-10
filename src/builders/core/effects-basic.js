import { resolveThemeValue, resolveColorWithOpacity, resolveArbitraryValue, isArbitraryColor } from "../../resolvers.js";

/**
 * Lite build: Basic effects only (shadow, opacity, ring)
 * Excludes: inset-shadow, text-shadow
 */

export function buildOpacityDeclaration(baseToken, theme) {
  if (baseToken === "opacity") return "opacity: 1;";
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
  if (baseToken === "shadow-none") return "box-shadow: none;";
  if (!baseToken.startsWith("shadow-")) return undefined;

  const valueKey = baseToken.slice(7);

  // arbitrary value: shadow-[4px_4px_0_0]
  const arb = resolveArbitraryValue(valueKey);
  if (arb !== undefined) return `box-shadow: ${arb};`;

  // named shadow from theme
  const value = resolveThemeValue(theme.boxShadow || {}, valueKey);
  if (value !== undefined) return `box-shadow: ${value};`;

  // shadow-color: check boxShadowColor first, then fall back to colors
  const colorScale = theme.boxShadowColor || theme.colors || {};
  const color = resolveColorWithOpacity(colorScale, valueKey);
  if (color !== undefined) return `--tw-shadow-color: ${color};`;

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
  if (baseToken === "ring-0") return "--tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: #3b82f6; box-shadow: var(--tw-ring-inset,) 0 0 0 calc(0px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color);";

  if (!baseToken.startsWith("ring-")) return undefined;
  const valueKey = baseToken.slice(5);

  // Guard: skip ring-width lookup for arbitrary values that are clearly colors.
  const arbResolved = resolveArbitraryValue(valueKey);
  const widthValue = (arbResolved !== undefined && isArbitraryColor(arbResolved))
    ? undefined
    : resolveThemeValue(ringWidthScale, valueKey);
  if (widthValue !== undefined) return buildRingWidth(widthValue);

  if (valueKey === "inset") return `--tw-ring-inset: inset;`;

  const colorValue =
    resolveColorWithOpacity(ringColorScale, valueKey) ||
    resolveColorWithOpacity(theme.colors || {}, valueKey);
  if (colorValue !== undefined) return `--tw-ring-color: ${colorValue};`;

  return undefined;
}

export function buildInsetShadowDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("inset-shadow")) return undefined;
  
  if (baseToken === "inset-shadow") {
    const value = resolveThemeValue(theme.boxShadow || {}, "DEFAULT");
    if (value === undefined) return undefined;
    return `box-shadow: inset ${value};`;
  }
  
  if (baseToken === "inset-shadow-none") return "box-shadow: inset 0 0 0 0 transparent;";
  
  const valueKey = baseToken.slice(13); // Remove "inset-shadow-"
  const value = resolveThemeValue(theme.boxShadow || {}, valueKey);
  if (value !== undefined) return `box-shadow: inset ${value};`;
  
  return undefined;
}

export function buildInsetRingDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("inset-ring")) return undefined;
  
  const ringWidthScale = theme.ringWidth || {};
  const ringColorScale = theme.ringColor || {};
  const defaultRingColor = resolveThemeValue(ringColorScale, "DEFAULT") || "#3b82f6";
  
  if (baseToken === "inset-ring") {
    const widthValue = resolveThemeValue(ringWidthScale, "DEFAULT") || "3px";
    return `--tw-ring-inset: inset; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: ${defaultRingColor}; box-shadow: var(--tw-ring-inset,) 0 0 0 calc(${widthValue} + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color);`;
  }
  
  const valueKey = baseToken.slice(11); // Remove "inset-ring-"
  const widthValue = resolveThemeValue(ringWidthScale, valueKey);
  if (widthValue !== undefined) {
    return `--tw-ring-inset: inset; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: ${defaultRingColor}; box-shadow: var(--tw-ring-inset,) 0 0 0 calc(${widthValue} + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color);`;
  }
  
  return undefined;
}
