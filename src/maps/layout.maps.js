// ─── Factory Helpers for Compressed Maps ──────────────────────────────────────
// Generate maps with repetitive patterns to reduce bundle size after minification

/**
 * Create a map from array of values with simple property pattern
 * @param {string} prop - CSS property name
 * @param {string[]} values - Array of CSS values
 * @param {Object} keyMap - Optional key remapping { cssValue: className }
 */
function createSimpleMap(prop, values, keyMap = {}) {
  const map = {};
  values.forEach((value) => {
    const key = keyMap[value] || value;
    map[key] = `${prop}: ${value};`;
  });
  return map;
}

// ─── Optimized Display Map ────────────────────────────────────────────────────

export const DISPLAY_MAP = {
  ...createSimpleMap("display", [
    "block", "inline", "inline-block", "flex", "inline-flex", 
    "grid", "inline-grid", "contents", "flow-root", "list-item",
    "table", "inline-table", "table-caption", "table-cell", 
    "table-column", "table-column-group", "table-footer-group",
    "table-header-group", "table-row-group", "table-row"
  ]),
  hidden: "display: none;", // Special case
};

// ─── Optimized Position & Overflow Maps ───────────────────────────────────────

export const POSITION_MAP = createSimpleMap("position", [
  "static", "fixed", "absolute", "relative", "sticky"
]);

export const VISIBILITY_MAP = {
  ...createSimpleMap("visibility", ["visible", "collapse"]),
  invisible: "visibility: hidden;", // Key differs from value
};

const OVERFLOW_VALUES = ["auto", "hidden", "clip", "visible", "scroll"];
export const OVERFLOW_MAP = createSimpleMap("overflow", OVERFLOW_VALUES);
export const OVERFLOW_X_MAP = createSimpleMap("overflow-x", OVERFLOW_VALUES);
export const OVERFLOW_Y_MAP = createSimpleMap("overflow-y", OVERFLOW_VALUES);

const OVERSCROLL_VALUES = ["auto", "contain", "none"];
export const OVERSCROLL_MAP = createSimpleMap("overscroll-behavior", OVERSCROLL_VALUES);
export const OVERSCROLL_X_MAP = createSimpleMap("overscroll-behavior-x", OVERSCROLL_VALUES);
export const OVERSCROLL_Y_MAP = createSimpleMap("overscroll-behavior-y", OVERSCROLL_VALUES);

// ─── Optimized Float & Clear Maps ─────────────────────────────────────────────

export const FLOAT_MAP = {
  ...createSimpleMap("float", ["left", "right", "none"]),
  start: "float: inline-start;",
  end: "float: inline-end;",
};

export const CLEAR_MAP = {
  ...createSimpleMap("clear", ["left", "right", "both", "none"]),
  start: "clear: inline-start;",
  end: "clear: inline-end;",
};

// ─── Optimized Object & Transform Maps ────────────────────────────────────────

export const ISOLATION_MAP = {
  isolate: "isolation: isolate;",
  "isolation-auto": "isolation: auto;",
};

export const OBJECT_FIT_MAP = createSimpleMap("object-fit", [
  "contain", "cover", "fill", "none", "scale-down"
]);

export const TRANSFORM_STYLE_MAP = {
  "transform-style-flat": "transform-style: flat;",
  "transform-style-3d": "transform-style: preserve-3d;",
  "transform-3d": "transform-style: preserve-3d;",
};

export const BACKFACE_MAP = {
  "backface-visible": "backface-visibility: visible;",
  "backface-hidden": "backface-visibility: hidden;",
};

export const FIELD_SIZING_MAP = {
  "field-sizing-fixed": "field-sizing: fixed;",
  "field-sizing-content": "field-sizing: content;",
};

export const BOX_SIZING_MAP = {
  border: "box-sizing: border-box;",
  content: "box-sizing: content-box;",
};

// ─── Optimized Break Maps ─────────────────────────────────────────────────────

const BREAK_AFTER_BEFORE_VALUES = [
  "auto", "avoid", "avoid-page", "avoid-column", 
  "page", "left", "right", "recto", "verso"
];
export const BREAK_AFTER_MAP = {
  ...createSimpleMap("break-after", BREAK_AFTER_BEFORE_VALUES),
  all: "break-after: all;",
};

export const BREAK_BEFORE_MAP = createSimpleMap("break-before", BREAK_AFTER_BEFORE_VALUES);

export const BREAK_INSIDE_MAP = createSimpleMap("break-inside", [
  "auto", "avoid", "avoid-page", "avoid-column"
]);

// ─── Optimized Misc Maps ──────────────────────────────────────────────────────

export const BOX_DECORATION_BREAK_MAP = createSimpleMap("box-decoration-break", [
  "slice", "clone"
]);

export const HYPHENS_MAP = createSimpleMap("hyphens", ["none", "manual", "auto"]);

export const COLOR_SCHEME_MAP = createSimpleMap("color-scheme", [
  "light", "dark", "normal"
]);

export const SCROLLBAR_COLOR_MAP = createSimpleMap("scrollbar-color", [
  "auto", "transparent", "current"
]);

export const SCROLLBAR_WIDTH_MAP = createSimpleMap("scrollbar-width", [
  "auto", "thin", "none"
]);

export const SCROLLBAR_GUTTER_MAP = {
  auto: "scrollbar-gutter: auto;",
  stable: "scrollbar-gutter: stable;",
  "stable-both-edges": "scrollbar-gutter: stable both-edges;",
  "both-edges": "scrollbar-gutter: both-edges;",
};

export const TABLE_LAYOUT_MAP = createSimpleMap("table-layout", ["auto", "fixed"]);

export const CAPTION_SIDE_MAP = createSimpleMap("caption-side", ["top", "bottom"]);

export const BORDER_COLLAPSE_MAP = createSimpleMap("border-collapse", [
  "collapse", "separate"
]);

export const SCROLL_BEHAVIOR_MAP = createSimpleMap("scroll-behavior", [
  "auto", "smooth"
]);

// Shared side/axis helpers used by spacing, inset, border, etc.
export const SIDE_PROPS = {
  "": [""],
  t: ["-top"],
  r: ["-right"],
  b: ["-bottom"],
  l: ["-left"],
  x: ["-left", "-right"],
  y: ["-top", "-bottom"],
};

export const INSET_AXIS_PROPS = {
  x: ["left", "right"],
  y: ["top", "bottom"],
};

export const ROUNDED_PROPS = {
  "": ["border-radius"],
  t: ["border-top-left-radius", "border-top-right-radius"],
  r: ["border-top-right-radius", "border-bottom-right-radius"],
  b: ["border-bottom-right-radius", "border-bottom-left-radius"],
  l: ["border-top-left-radius", "border-bottom-left-radius"],
  tl: ["border-top-left-radius"],
  tr: ["border-top-right-radius"],
  br: ["border-bottom-right-radius"],
  bl: ["border-bottom-left-radius"],
  ss: ["border-start-start-radius"],
  se: ["border-start-end-radius"],
  es: ["border-end-start-radius"],
  ee: ["border-end-end-radius"],
};
