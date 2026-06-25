import {
  DISPLAY_MAP,
  VISIBILITY_MAP,
  ISOLATION_MAP,
  OVERFLOW_MAP,
  OVERFLOW_X_MAP,
  OVERFLOW_Y_MAP,
  OVERSCROLL_MAP,
  OVERSCROLL_X_MAP,
  OVERSCROLL_Y_MAP,
  FLOAT_MAP,
  CLEAR_MAP,
  OBJECT_FIT_MAP,
  TRANSFORM_STYLE_MAP,
  BACKFACE_MAP,
  FIELD_SIZING_MAP,
  BOX_SIZING_MAP,
  TABLE_LAYOUT_MAP,
  CAPTION_SIDE_MAP,
  BORDER_COLLAPSE_MAP,
  SCROLL_BEHAVIOR_MAP,
  SIDE_PROPS,
  INSET_AXIS_PROPS,
  POSITION_MAP,
} from "../maps/layout.maps.js";
import { TOUCH_ACTION_MAP, APPEARANCE_MAP } from "../maps/interactivity.maps.js";
import { resolveThemeValue, resolveArbitraryValue } from "../resolvers.js";

export function buildLayoutDeclaration(baseToken, theme) {
  // overflow
  if (baseToken.startsWith("overflow-x-")) return OVERFLOW_X_MAP[baseToken.slice(11)] ?? undefined;
  if (baseToken.startsWith("overflow-y-")) return OVERFLOW_Y_MAP[baseToken.slice(11)] ?? undefined;
  if (baseToken.startsWith("overflow-"))   return OVERFLOW_MAP[baseToken.slice(9)]   ?? undefined;

  // overscroll
  if (baseToken.startsWith("overscroll-x-")) return OVERSCROLL_X_MAP[baseToken.slice(13)] ?? undefined;
  if (baseToken.startsWith("overscroll-y-")) return OVERSCROLL_Y_MAP[baseToken.slice(13)] ?? undefined;
  if (baseToken.startsWith("overscroll-"))   return OVERSCROLL_MAP[baseToken.slice(11)]   ?? undefined;

  // float / clear
  if (baseToken.startsWith("float-")) return FLOAT_MAP[baseToken.slice(6)] ?? undefined;
  if (baseToken.startsWith("clear-")) return CLEAR_MAP[baseToken.slice(6)] ?? undefined;

  // object-fit / object-position
  if (baseToken.startsWith("object-fit-")) return OBJECT_FIT_MAP[baseToken.slice(11)] ?? undefined;
  if (baseToken.startsWith("object-")) {
    const val = baseToken.slice(7);
    if (OBJECT_FIT_MAP[val]) return OBJECT_FIT_MAP[val];
    const pos = resolveThemeValue(theme.objectPosition || {}, val);
    if (pos !== undefined) return `object-position: ${pos};`;
  }

  // z-index (support negative)
  if (baseToken.startsWith("z-") || baseToken.startsWith("-z-")) {
    const negative = baseToken.startsWith("-");
    const key = negative ? baseToken.slice(3) : baseToken.slice(2);
    const val = resolveThemeValue(theme.zIndex || {}, key);
    if (val !== undefined) return `z-index: ${negative ? `-${val}` : val};`;
    const arb = resolveArbitraryValue(negative ? baseToken.slice(3) : baseToken.slice(2));
    if (arb !== undefined) return `z-index: ${negative ? `-${arb}` : arb};`;
  }

  // order
  if (baseToken.startsWith("order-")) {
    const val = resolveThemeValue(theme.order || {}, baseToken.slice(6));
    if (val !== undefined) return `order: ${val};`;
  }

  // aspect-ratio
  if (baseToken.startsWith("aspect-")) {
    const val = resolveThemeValue(theme.aspectRatio || {}, baseToken.slice(7));
    if (val !== undefined) return `aspect-ratio: ${val};`;
    const arb = resolveArbitraryValue(baseToken.slice(7));
    if (arb !== undefined) return `aspect-ratio: ${arb};`;
  }

  // columns
  if (baseToken.startsWith("columns-")) {
    const val = resolveThemeValue(theme.columns || {}, baseToken.slice(8));
    if (val !== undefined) return `columns: ${val};`;
  }

  // box-sizing
  if (baseToken.startsWith("box-")) return BOX_SIZING_MAP[baseToken.slice(4)] ?? undefined;

  // table layout / caption
  if (baseToken.startsWith("table-")) {
    const key = baseToken.slice(6);
    if (TABLE_LAYOUT_MAP[key]) return TABLE_LAYOUT_MAP[key];
  }
  if (baseToken.startsWith("caption-")) return CAPTION_SIDE_MAP[baseToken.slice(8)] ?? undefined;
  if (baseToken.startsWith("border-collapse") || baseToken.startsWith("border-separate")) {
    return BORDER_COLLAPSE_MAP[baseToken.slice(7)] ?? undefined;
  }

  // scroll-behavior / scroll-margin / scroll-padding
  if (baseToken.startsWith("scroll-")) {
    const key = baseToken.slice(7);
    if (SCROLL_BEHAVIOR_MAP[key]) return SCROLL_BEHAVIOR_MAP[key];

    const smMatch = baseToken.match(/^scroll-m([trblxy]?)-(.+)$/);
    if (smMatch) {
      const [, side, valueKey] = smMatch;
      const val = resolveThemeValue(theme.scrollMargin || theme.spacing || {}, valueKey);
      if (val === undefined) return undefined;
      const suffixes = SIDE_PROPS[side] ?? undefined;
      if (!suffixes) return undefined;
      return suffixes.map((s) => `scroll-margin${s}: ${val};`).join(" ");
    }

    const spMatch = baseToken.match(/^scroll-p([trblxy]?)-(.+)$/);
    if (spMatch) {
      const [, side, valueKey] = spMatch;
      const val = resolveThemeValue(theme.scrollPadding || theme.spacing || {}, valueKey);
      if (val === undefined) return undefined;
      const suffixes = SIDE_PROPS[side] ?? undefined;
      if (!suffixes) return undefined;
      return suffixes.map((s) => `scroll-padding${s}: ${val};`).join(" ");
    }
  }

  // will-change
  if (baseToken.startsWith("will-change-")) {
    const val = resolveThemeValue(theme.willChange || {}, baseToken.slice(12));
    if (val !== undefined) return `will-change: ${val};`;
  }

  // content (pseudo-element)
  if (baseToken.startsWith("content-")) {
    const val = resolveThemeValue(theme.content || {}, baseToken.slice(8));
    if (val !== undefined) return `content: "${val}";`;
    const arb = resolveArbitraryValue(baseToken.slice(8));
    if (arb !== undefined) return `content: ${arb};`;
  }

  // size-* (width + height shorthand)
  if (baseToken.startsWith("size-")) {
    const val = resolveThemeValue(theme.size || theme.spacing || {}, baseToken.slice(5));
    if (val !== undefined) return `width: ${val}; height: ${val};`;
  }

  // static maps
  if (DISPLAY_MAP[baseToken])       return DISPLAY_MAP[baseToken];
  if (VISIBILITY_MAP[baseToken])    return VISIBILITY_MAP[baseToken];
  if (ISOLATION_MAP[baseToken])     return ISOLATION_MAP[baseToken];
  if (TRANSFORM_STYLE_MAP[baseToken]) return TRANSFORM_STYLE_MAP[baseToken];
  if (BACKFACE_MAP[baseToken])      return BACKFACE_MAP[baseToken];
  if (FIELD_SIZING_MAP[baseToken])  return FIELD_SIZING_MAP[baseToken];

  if (baseToken.startsWith("touch-")) {
    const key = baseToken.slice(6);
    if (TOUCH_ACTION_MAP[key]) return TOUCH_ACTION_MAP[key];
  }
  if (TOUCH_ACTION_MAP[baseToken])  return TOUCH_ACTION_MAP[baseToken];
  if (APPEARANCE_MAP[baseToken])    return APPEARANCE_MAP[baseToken];

  return undefined;
}

export function buildPositionInsetDeclaration(baseToken, theme) {
  if (POSITION_MAP[baseToken]) return POSITION_MAP[baseToken];

  const negative = baseToken.startsWith("-");
  const normalized = negative ? baseToken.slice(1) : baseToken;
  const insetScale = theme.inset || theme.spacing || {};

  const directionalMatch = normalized.match(/^(top|right|bottom|left)-(.+)$/);
  if (directionalMatch) {
    const [, side, valueKey] = directionalMatch;
    let value = resolveThemeValue(insetScale, valueKey);
    if (value === undefined) return undefined;
    if (negative && value !== "auto") value = `-${value}`;
    return `${side}: ${value};`;
  }

  const axisMatch = normalized.match(/^inset-([xy])-(.+)$/);
  if (axisMatch) {
    const [, axis, valueKey] = axisMatch;
    let value = resolveThemeValue(insetScale, valueKey);
    if (value === undefined) return undefined;
    if (negative && value !== "auto") value = `-${value}`;
    const props = INSET_AXIS_PROPS[axis];
    if (!props) return undefined;
    return props.map((prop) => `${prop}: ${value};`).join(" ");
  }

  const insetMatch = normalized.match(/^inset-(.+)$/);
  if (insetMatch) {
    const valueKey = insetMatch[1];
    let value = resolveThemeValue(insetScale, valueKey);
    if (value === undefined) return undefined;
    if (negative && value !== "auto") value = `-${value}`;
    return `top: ${value}; right: ${value}; bottom: ${value}; left: ${value};`;
  }

  return undefined;
}
