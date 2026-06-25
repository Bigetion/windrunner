import { OUTLINE_STYLE_MAP } from "../maps/interactivity.maps.js";
import { resolveThemeValue, resolveColorWithOpacity } from "../resolvers.js";

export function buildColorDeclaration(baseToken, theme) {
  const colors = theme.colors || {};

  // background-color (non-image: handled in backgrounds.js)
  if (baseToken.startsWith("bg-")) {
    const key = baseToken.slice(3);
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) return `background-color: ${color};`;
  }

  // border-color
  if (baseToken.startsWith("border-")) {
    const key = baseToken.slice(7);
    const color = resolveColorWithOpacity(colors, key);
    if (color !== undefined) return `border-color: ${color};`;
  }

  // fill / stroke
  if (baseToken.startsWith("fill-")) {
    const val = resolveColorWithOpacity({ ...colors, none: "none" }, baseToken.slice(5));
    if (val !== undefined) return `fill: ${val};`;
  }
  if (baseToken.startsWith("stroke-")) {
    const key = baseToken.slice(7);
    const width = resolveThemeValue(theme.strokeWidth || {}, key);
    if (width !== undefined) return `stroke-width: ${width};`;
    const color = resolveColorWithOpacity({ ...colors, none: "none" }, key);
    if (color !== undefined) return `stroke: ${color};`;
  }

  // outline-color / width / offset / style
  if (baseToken.startsWith("outline-")) {
    const key = baseToken.slice(8);
    if (OUTLINE_STYLE_MAP[key]) return OUTLINE_STYLE_MAP[key];
    const width = resolveThemeValue(theme.outlineWidth || {}, key);
    if (width !== undefined) return `outline-width: ${width};`;
    const offset = resolveThemeValue(theme.outlineOffset || {}, key);
    if (offset !== undefined) return `outline-offset: ${offset};`;
    const color = resolveColorWithOpacity(theme.outlineColor || colors, key);
    if (color !== undefined) return `outline-color: ${color};`;
  }

  // caret-color
  if (baseToken.startsWith("caret-")) {
    const color = resolveColorWithOpacity(theme.caretColor || colors, baseToken.slice(6));
    if (color !== undefined) return `caret-color: ${color};`;
  }

  // accent-color
  if (baseToken.startsWith("accent-")) {
    const color = resolveColorWithOpacity({ ...colors, auto: "auto" }, baseToken.slice(7));
    if (color !== undefined) return `accent-color: ${color};`;
  }

  // placeholder-color
  if (baseToken.startsWith("placeholder-")) {
    const color = resolveColorWithOpacity(colors, baseToken.slice(12));
    if (color !== undefined) return `--tw-placeholder-color: ${color};`;
  }

  return undefined;
}
