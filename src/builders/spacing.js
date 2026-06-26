import { SIDE_PROPS } from "../maps/layout.maps.js";
import { resolveThemeValue, resolveArbitraryValue } from "../resolvers.js";

export function buildSpacingDeclaration(baseToken, theme) {
  const negative = baseToken.startsWith("-");
  const normalized = negative ? baseToken.slice(1) : baseToken;
  const match = normalized.match(/^(m|p)([trblxy]?)-(.+)$/);
  if (!match) return undefined;

  const [, kind, side, valueKey] = match;
  const baseProp = kind === "m" ? "margin" : "padding";

  let value = resolveThemeValue(theme.spacing || {}, valueKey);
  if (value === undefined && kind === "m" && valueKey === "auto") value = "auto";
  if (value === undefined) return undefined;
  if (negative && value !== "auto") value = `-${value}`;

  const suffixes = SIDE_PROPS[side];
  if (!suffixes) return undefined;
  return suffixes.map((s) => `${baseProp}${s}: ${value};`).join(" ");
}

export function buildGapDeclaration(baseToken, theme) {
  const match = baseToken.match(/^gap(?:-([xy]))?-(.+)$/);
  if (!match) return undefined;

  const [, axis = "", valueKey] = match;
  const gapScale = theme.gap || theme.spacing || {};
  const value = resolveThemeValue(gapScale, valueKey);
  if (value === undefined) return undefined;

  if (axis === "x") return `column-gap: ${value};`;
  if (axis === "y") return `row-gap: ${value};`;
  return `gap: ${value};`;
}

export function buildDimensionDeclaration(baseToken, theme) {
  const patterns = [
    { prefix: "min-inline-size-", prop: "min-inline-size", scale: theme.minWidth || theme.width || theme.spacing || {} },
    { prefix: "max-inline-size-", prop: "max-inline-size", scale: theme.maxWidth || theme.width || theme.spacing || {} },
    { prefix: "inline-size-", prop: "inline-size", scale: theme.width || theme.spacing || {} },
    { prefix: "min-block-size-", prop: "min-block-size", scale: theme.minHeight || theme.height || theme.spacing || {} },
    { prefix: "max-block-size-", prop: "max-block-size", scale: theme.maxHeight || theme.height || theme.spacing || {} },
    { prefix: "block-size-", prop: "block-size", scale: theme.height || theme.spacing || {} },
    { prefix: "min-w-", prop: "min-width",  scale: theme.minWidth  || theme.width  || {} },
    { prefix: "max-w-", prop: "max-width",  scale: theme.maxWidth  || theme.width  || {} },
    { prefix: "min-h-", prop: "min-height", scale: theme.minHeight || theme.height || {} },
    { prefix: "max-h-", prop: "max-height", scale: theme.maxHeight || theme.height || {} },
    { prefix: "w-",     prop: "width",      scale: theme.width     || {} },
    { prefix: "h-",     prop: "height",     scale: theme.height    || {} },
  ];

  for (const pattern of patterns) {
    if (!baseToken.startsWith(pattern.prefix)) continue;
    const valueKey = baseToken.slice(pattern.prefix.length);
    let value = resolveThemeValue(pattern.scale, valueKey);
    if (value === undefined) value = resolveThemeValue(theme.spacing || {}, valueKey);
    if (value === undefined) {
      const arb = resolveArbitraryValue(valueKey);
      if (arb !== undefined) return `${pattern.prop}: ${arb};`;
      return undefined;
    }
    return `${pattern.prop}: ${value};`;
  }

  return undefined;
}
