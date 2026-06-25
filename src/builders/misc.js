import {
  ANIMATE_MAP,
  MASK_LINEAR_MAP,
  MASK_REPEAT_MAP,
  MASK_SIZE_MAP,
  MASK_RADIAL_POSITIONS,
} from "../maps/effects.maps.js";
import {
  CURSOR_MAP,
  POINTER_EVENTS_MAP,
  USER_SELECT_MAP,
  APPEARANCE_MAP,
  OUTLINE_STYLE_MAP,
} from "../maps/interactivity.maps.js";
import { resolveThemeValue, resolveColorWithOpacity, resolveArbitraryValue } from "../resolvers.js";

export function buildAnimationDeclaration(baseToken) {
  if (!baseToken.startsWith("animate-")) return undefined;
  const key = baseToken.slice(8);
  if (ANIMATE_MAP[key]) return ANIMATE_MAP[key];
  const arb = resolveArbitraryValue(key);
  if (arb !== undefined) return `animation: ${arb};`;
  return undefined;
}

export function buildMaskDeclaration(baseToken) {
  if (MASK_LINEAR_MAP[baseToken]) return MASK_LINEAR_MAP[baseToken];
  if (MASK_REPEAT_MAP[baseToken]) return MASK_REPEAT_MAP[baseToken];
  if (MASK_SIZE_MAP[baseToken])   return MASK_SIZE_MAP[baseToken];

  if (baseToken === "mask-radial") {
    return "mask-image: radial-gradient(circle at center, black, transparent); -webkit-mask-image: radial-gradient(circle at center, black, transparent);";
  }
  if (baseToken.startsWith("mask-radial-at-")) {
    const pos = MASK_RADIAL_POSITIONS[baseToken.slice(15)];
    if (pos !== undefined) {
      return `mask-image: radial-gradient(circle at ${pos}, black, transparent); -webkit-mask-image: radial-gradient(circle at ${pos}, black, transparent);`;
    }
  }
  if (baseToken.startsWith("mask-position-")) {
    const pos = MASK_RADIAL_POSITIONS[baseToken.slice(14)];
    if (pos !== undefined) {
      return `mask-position: ${pos}; -webkit-mask-position: ${pos};`;
    }
  }

  return undefined;
}

export function buildContainerQueryDeclaration(baseToken) {
  if (baseToken === "@container") return "container-type: inline-size;";
  if (baseToken.startsWith("@container/")) {
    const name = baseToken.slice(11);
    return `container-type: inline-size; container-name: ${name};`;
  }
  return undefined;
}

export function buildInteractivityDeclaration(baseToken, theme) {
  if (baseToken.startsWith("cursor-"))         return CURSOR_MAP[baseToken.slice(7)]          ?? undefined;
  if (baseToken.startsWith("pointer-events-")) return POINTER_EVENTS_MAP[baseToken.slice(15)] ?? undefined;
  if (baseToken.startsWith("select-"))         return USER_SELECT_MAP[baseToken.slice(7)]      ?? undefined;
  if (baseToken.startsWith("appearance-")) {
    return APPEARANCE_MAP[baseToken.slice(11)] ? `appearance: ${baseToken.slice(11)};` : undefined;
  }

  // resize
  if (baseToken === "resize-none") return "resize: none;";
  if (baseToken === "resize-y")    return "resize: vertical;";
  if (baseToken === "resize-x")    return "resize: horizontal;";
  if (baseToken === "resize")      return "resize: both;";

  // outline
  if (baseToken === "outline")      return "outline-style: solid;";
  if (baseToken === "outline-none") return "outline: 2px solid transparent; outline-offset: 2px;";
  if (baseToken.startsWith("outline-")) {
    const key = baseToken.slice(8);
    if (OUTLINE_STYLE_MAP[key]) return OUTLINE_STYLE_MAP[key];
    const width = resolveThemeValue(theme.outlineWidth || {}, key);
    if (width !== undefined) return `outline-width: ${width};`;
    const offset = resolveThemeValue(theme.outlineOffset || {}, key);
    if (offset !== undefined) return `outline-offset: ${offset};`;
    const color = resolveColorWithOpacity(theme.outlineColor || theme.colors || {}, key);
    if (color !== undefined) return `outline-color: ${color};`;
  }

  return undefined;
}
