import { BORDER_STYLE_MAP } from "../maps/interactivity.maps.js";
import { ROUNDED_PROPS } from "../maps/layout.maps.js";
import { resolveThemeValue } from "../resolvers.js";

export function buildBorderDeclaration(baseToken, theme) {
  if (baseToken === "border") {
    const value = resolveThemeValue(theme.borderWidth || {}, "DEFAULT") || "1px";
    return `border-width: ${value};`;
  }

  // border-{side}-{width?}
  const sideMatch = baseToken.match(/^border-([trblxy])-?(\d+)?$/);
  if (sideMatch) {
    const [, side, numVal] = sideMatch;
    const sideMap = { t: "top", r: "right", b: "bottom", l: "left" };
    const widthKey = numVal || "DEFAULT";
    const widthVal = resolveThemeValue(theme.borderWidth || {}, widthKey);
    if (widthVal === undefined) return undefined;
    if (side === "x") return `border-left-width: ${widthVal}; border-right-width: ${widthVal};`;
    if (side === "y") return `border-top-width: ${widthVal}; border-bottom-width: ${widthVal};`;
    return `border-${sideMap[side]}-width: ${widthVal};`;
  }

  // border-{number}
  const widthMatch = baseToken.match(/^border-(\d+)$/);
  if (widthMatch) {
    const value = resolveThemeValue(theme.borderWidth || {}, widthMatch[1]);
    if (value !== undefined) return `border-width: ${value};`;
  }

  // border-style keywords
  if (baseToken.startsWith("border-")) {
    const key = baseToken.slice(7);
    if (BORDER_STYLE_MAP[key]) return BORDER_STYLE_MAP[key];
  }

  return undefined;
}

export function buildBorderRadiusDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("rounded")) return undefined;

  const match = baseToken.match(/^rounded(?:-(tl|tr|br|bl|ss|se|es|ee|t|r|b|l))?(?:-(.+))?$/);
  if (!match) return undefined;

  const [, side = "", rawValueKey] = match;
  const valueKey = rawValueKey || "DEFAULT";
  const radius = resolveThemeValue(theme.borderRadius || {}, valueKey);
  if (radius === undefined) return undefined;

  const props = ROUNDED_PROPS[side];
  if (!props) return undefined;
  return props.map((prop) => `${prop}: ${radius};`).join(" ");
}
