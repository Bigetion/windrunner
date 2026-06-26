import {
  ANIMATE_MAP,
  MASK_LINEAR_MAP,
  MASK_REPEAT_MAP,
  MASK_SIZE_MAP,
  MASK_RADIAL_POSITIONS,
  MASK_CLIP_MAP,
  MASK_COMPOSITE_MAP,
  MASK_MODE_MAP,
  MASK_ORIGIN_MAP,
  MASK_TYPE_MAP,
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
  if (MASK_CLIP_MAP[baseToken]) return MASK_CLIP_MAP[baseToken];
  if (MASK_COMPOSITE_MAP[baseToken]) return MASK_COMPOSITE_MAP[baseToken];
  if (MASK_MODE_MAP[baseToken]) return MASK_MODE_MAP[baseToken];
  if (MASK_ORIGIN_MAP[baseToken]) return MASK_ORIGIN_MAP[baseToken];
  if (MASK_TYPE_MAP[baseToken]) return MASK_TYPE_MAP[baseToken];
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
  if (baseToken.startsWith("user-select-"))    return USER_SELECT_MAP[baseToken.slice(12)]     ?? undefined;
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
    // outline-offset-{n}: key is "offset-{n}", strip "offset-" prefix
    if (key.startsWith("offset-")) {
      const offsetKey = key.slice(7);
      const offset = resolveThemeValue(theme.outlineOffset || {}, offsetKey);
      if (offset !== undefined) return `outline-offset: ${offset};`;
      const arb = resolveArbitraryValue(offsetKey);
      if (arb !== undefined) return `outline-offset: ${arb};`;
    }
    const width = resolveThemeValue(theme.outlineWidth || {}, key);
    if (width !== undefined) return `outline-width: ${width};`;
    const color = resolveColorWithOpacity(theme.outlineColor || theme.colors || {}, key);
    if (color !== undefined) return `outline-color: ${color};`;
  }

  return undefined;
}

export function buildZoomDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("zoom-")) return undefined;
  const key = baseToken.slice(5);
  const val = resolveThemeValue(theme.zoom || {}, key);
  if (val !== undefined) return `zoom: ${val};`;
  const arb = resolveArbitraryValue(key);
  if (arb !== undefined) return `zoom: ${arb};`;
  return undefined;
}

export function buildForcedColorDeclaration(baseToken) {
  if (baseToken === "forced-color-adjust-auto") return "forced-color-adjust: auto;";
  if (baseToken === "forced-color-adjust-none") return "forced-color-adjust: none;";
  return undefined;
}

export function buildBorderSpacingDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("border-spacing-")) return undefined;
  const rest = baseToken.slice(15); // after "border-spacing-"

  const axisMatchX = rest.match(/^x-(.+)$/);
  if (axisMatchX) {
    const val = resolveThemeValue(theme.borderSpacing || theme.spacing || {}, axisMatchX[1]);
    if (val !== undefined) return `--tw-border-spacing-x: ${val}; border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y, 0);`;
  }

  const axisMatchY = rest.match(/^y-(.+)$/);
  if (axisMatchY) {
    const val = resolveThemeValue(theme.borderSpacing || theme.spacing || {}, axisMatchY[1]);
    if (val !== undefined) return `--tw-border-spacing-y: ${val}; border-spacing: var(--tw-border-spacing-x, 0) var(--tw-border-spacing-y);`;
  }

  const val = resolveThemeValue(theme.borderSpacing || theme.spacing || {}, rest);
  if (val !== undefined) return `--tw-border-spacing-x: ${val}; --tw-border-spacing-y: ${val}; border-spacing: ${val};`;

  const arb = resolveArbitraryValue(rest);
  if (arb !== undefined) return `--tw-border-spacing-x: ${arb}; --tw-border-spacing-y: ${arb}; border-spacing: ${arb};`;

  return undefined;
}

// ─── Scroll snap ──────────────────────────────────────────────────────────────

const SNAP_TYPE_MAP = {
  none:      "scroll-snap-type: none;",
  x:         "scroll-snap-type: x var(--tw-scroll-snap-strictness);",
  y:         "scroll-snap-type: y var(--tw-scroll-snap-strictness);",
  both:      "scroll-snap-type: both var(--tw-scroll-snap-strictness);",
  mandatory: "--tw-scroll-snap-strictness: mandatory;",
  proximity: "--tw-scroll-snap-strictness: proximity;",
};

const SNAP_ALIGN_MAP = {
  start:      "scroll-snap-align: start;",
  end:        "scroll-snap-align: end;",
  center:     "scroll-snap-align: center;",
  "align-none": "scroll-snap-align: none;",
};

const SNAP_STOP_MAP = {
  normal: "scroll-snap-stop: normal;",
  always: "scroll-snap-stop: always;",
};

export function buildScrollSnapDeclaration(baseToken) {
  if (!baseToken.startsWith("snap-")) return undefined;
  const key = baseToken.slice(5);
  if (SNAP_TYPE_MAP[key])  return SNAP_TYPE_MAP[key];
  if (SNAP_ALIGN_MAP[key]) return SNAP_ALIGN_MAP[key];
  if (SNAP_STOP_MAP[key])  return SNAP_STOP_MAP[key];
  return undefined;
}

// ─── SR-only (accessibility) ──────────────────────────────────────────────────

export function buildAccessibilityDeclaration(baseToken) {
  if (baseToken === "sr-only") {
    return "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;";
  }
  if (baseToken === "not-sr-only") {
    return "position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal;";
  }
  return undefined;
}
