import {
  FLEX_DIRECTION_MAP,
  FLEX_WRAP_MAP,
  ALIGN_CONTENT_MAP,
  ALIGN_SELF_MAP,
  ALIGN_ITEMS_MAP,
  JUSTIFY_CONTENT_MAP,
  JUSTIFY_ITEMS_MAP,
  JUSTIFY_SELF_MAP,
  PLACE_CONTENT_MAP,
  PLACE_ITEMS_MAP,
  PLACE_SELF_MAP,
  GRID_AUTO_FLOW_MAP,
} from "../maps/flexgrid.maps.js";
import { resolveThemeValue, resolveArbitraryValue } from "../resolvers.js";

export function buildFlexGridDeclaration(baseToken, theme) {
  // grow / shrink (v4 canonical)
  if (baseToken === "grow")     return "flex-grow: 1;";
  if (baseToken === "grow-0")   return "flex-grow: 0;";
  if (baseToken === "shrink")   return "flex-shrink: 1;";
  if (baseToken === "shrink-0") return "flex-shrink: 0;";

  if (baseToken.startsWith("grow-")) {
    const val = resolveThemeValue(theme.flexGrow || {}, baseToken.slice(5));
    if (val !== undefined) return `flex-grow: ${val};`;
  }
  if (baseToken.startsWith("shrink-")) {
    const val = resolveThemeValue(theme.flexShrink || {}, baseToken.slice(7));
    if (val !== undefined) return `flex-shrink: ${val};`;
  }

  // flex-basis
  if (baseToken.startsWith("basis-")) {
    const val = resolveThemeValue(theme.flexBasis || theme.spacing || {}, baseToken.slice(6));
    if (val !== undefined) return `flex-basis: ${val};`;
  }

  // flex shorthand
  if (baseToken === "flex-1")       return "flex: 1 1 0%;";
  if (baseToken === "flex-auto")    return "flex: 1 1 auto;";
  if (baseToken === "flex-initial") return "flex: 0 1 auto;";
  if (baseToken === "flex-none")    return "flex: none;";
  if (baseToken.startsWith("flex-")) {
    const value = baseToken.slice(5);
    if (FLEX_DIRECTION_MAP[value]) return FLEX_DIRECTION_MAP[value];
    if (FLEX_WRAP_MAP[value])      return FLEX_WRAP_MAP[value];
    const themeVal = resolveThemeValue(theme.flex || {}, value);
    if (themeVal !== undefined) return `flex: ${themeVal};`;
  }

  // align-content
  if (baseToken.startsWith("content-")) {
    const key = baseToken.slice(8);
    if (ALIGN_CONTENT_MAP[key]) return ALIGN_CONTENT_MAP[key];
  }

  // align-self
  if (baseToken.startsWith("self-")) return ALIGN_SELF_MAP[baseToken.slice(5)] ?? undefined;

  // justify-*
  if (baseToken.startsWith("justify-items-")) return JUSTIFY_ITEMS_MAP[baseToken.slice(14)] ?? undefined;
  if (baseToken.startsWith("justify-self-"))  return JUSTIFY_SELF_MAP[baseToken.slice(13)]  ?? undefined;
  if (baseToken.startsWith("justify-"))       return JUSTIFY_CONTENT_MAP[baseToken.slice(8)] ?? undefined;

  // align-items
  if (baseToken.startsWith("items-")) return ALIGN_ITEMS_MAP[baseToken.slice(6)] ?? undefined;

  // place-*
  if (baseToken.startsWith("place-content-")) return PLACE_CONTENT_MAP[baseToken.slice(14)] ?? undefined;
  if (baseToken.startsWith("place-items-"))   return PLACE_ITEMS_MAP[baseToken.slice(12)]   ?? undefined;
  if (baseToken.startsWith("place-self-"))    return PLACE_SELF_MAP[baseToken.slice(11)]    ?? undefined;

  // grid-auto-flow
  if (baseToken.startsWith("grid-flow-")) return GRID_AUTO_FLOW_MAP[baseToken.slice(10)] ?? undefined;

  // grid-auto-columns / rows
  if (baseToken.startsWith("auto-cols-")) {
    const val = resolveThemeValue(theme.gridAutoColumns || {}, baseToken.slice(10));
    if (val !== undefined) return `grid-auto-columns: ${val};`;
  }
  if (baseToken.startsWith("auto-rows-")) {
    const val = resolveThemeValue(theme.gridAutoRows || {}, baseToken.slice(10));
    if (val !== undefined) return `grid-auto-rows: ${val};`;
  }

  // grid-template-columns
  if (baseToken.startsWith("grid-cols-")) {
    const valueKey = baseToken.slice(10);
    const direct = resolveThemeValue(theme.gridTemplateColumns || {}, valueKey);
    if (direct !== undefined) return `grid-template-columns: ${direct};`;
    if (/^\d+$/.test(valueKey)) return `grid-template-columns: repeat(${valueKey}, minmax(0, 1fr));`;
    const arb = resolveArbitraryValue(valueKey);
    if (arb !== undefined) return `grid-template-columns: ${arb};`;
  }

  // grid-template-rows
  if (baseToken.startsWith("grid-rows-")) {
    const valueKey = baseToken.slice(10);
    const direct = resolveThemeValue(theme.gridTemplateRows || {}, valueKey);
    if (direct !== undefined) return `grid-template-rows: ${direct};`;
    if (/^\d+$/.test(valueKey)) return `grid-template-rows: repeat(${valueKey}, minmax(0, 1fr));`;
    const arb = resolveArbitraryValue(valueKey);
    if (arb !== undefined) return `grid-template-rows: ${arb};`;
  }

  // col span / start / end
  if (baseToken.startsWith("col-")) {
    const val = resolveThemeValue(theme.gridColumn || {}, baseToken.slice(4));
    if (val !== undefined) return `grid-column: ${val};`;
    const spanMatch = baseToken.match(/^col-span-(\d+)$/);
    if (spanMatch) return `grid-column: span ${spanMatch[1]} / span ${spanMatch[1]};`;
    if (baseToken === "col-auto") return "grid-column: auto;";
    if (baseToken.startsWith("col-start-")) {
      const sv = resolveThemeValue(theme.gridColumnStart || {}, baseToken.slice(10));
      if (sv !== undefined) return `grid-column-start: ${sv};`;
    }
    if (baseToken.startsWith("col-end-")) {
      const ev = resolveThemeValue(theme.gridColumnEnd || {}, baseToken.slice(8));
      if (ev !== undefined) return `grid-column-end: ${ev};`;
    }
  }

  // row span / start / end
  if (baseToken.startsWith("row-")) {
    const val = resolveThemeValue(theme.gridRow || {}, baseToken.slice(4));
    if (val !== undefined) return `grid-row: ${val};`;
    const spanMatch = baseToken.match(/^row-span-(\d+)$/);
    if (spanMatch) return `grid-row: span ${spanMatch[1]} / span ${spanMatch[1]};`;
    if (baseToken === "row-auto") return "grid-row: auto;";
    if (baseToken.startsWith("row-start-")) {
      const sv = resolveThemeValue(theme.gridRowStart || {}, baseToken.slice(10));
      if (sv !== undefined) return `grid-row-start: ${sv};`;
    }
    if (baseToken.startsWith("row-end-")) {
      const ev = resolveThemeValue(theme.gridRowEnd || {}, baseToken.slice(8));
      if (ev !== undefined) return `grid-row-end: ${ev};`;
    }
  }

  return undefined;
}
