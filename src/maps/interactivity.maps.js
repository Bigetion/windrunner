// ─── Factory Helper for Compressed Maps ───────────────────────────────────────

function createSimpleMap(prop, values) {
  const map = {};
  values.forEach((value) => {
    map[value] = `${prop}: ${value};`;
  });
  return map;
}

// ─── Optimized Cursor Map ─────────────────────────────────────────────────────

export const CURSOR_MAP = createSimpleMap("cursor", [
  "auto", "default", "pointer", "wait", "text", "move", "help",
  "not-allowed", "none", "context-menu", "progress", "cell",
  "crosshair", "vertical-text", "alias", "copy", "no-drop",
  "grab", "grabbing", "all-scroll", "zoom-in", "zoom-out"
]);

// ─── Optimized Interaction Maps ───────────────────────────────────────────────

export const POINTER_EVENTS_MAP = createSimpleMap("pointer-events", ["none", "auto"]);

export const RESIZE_MAP = {
  none: "resize: none;",
  y: "resize: vertical;",
  x: "resize: horizontal;",
  resize: "resize: both;",
};

export const USER_SELECT_MAP = createSimpleMap("user-select", [
  "none", "text", "all", "auto"
]);

export const APPEARANCE_MAP = createSimpleMap("appearance", ["none", "auto"]);

export const TOUCH_ACTION_MAP = createSimpleMap("touch-action", [
  "auto", "none", "pan-x", "pan-left", "pan-right", "pan-y",
  "pan-up", "pan-down", "pinch-zoom", "manipulation"
]);

// ─── Optimized Style Maps ─────────────────────────────────────────────────────

export const OUTLINE_STYLE_MAP = {
  none: "outline: 2px solid transparent; outline-offset: 2px;",
  ...createSimpleMap("outline-style", ["solid", "dashed", "dotted", "double"]),
};

export const BORDER_STYLE_MAP = createSimpleMap("border-style", [
  "solid", "dashed", "dotted", "double", "hidden", "none"
]);

// ─── Transition Maps ──────────────────────────────────────────────────────────

export const TRANSITION_PROPERTY_MAP = {
  none:    "none",
  all:     "all",
  DEFAULT: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
  colors:  "color, background-color, border-color, text-decoration-color, fill, stroke",
  opacity: "opacity",
  shadow:  "box-shadow",
  transform: "transform",
};

export const TRANSITION_TIMING_MAP = {
  linear:   "linear",
  in:       "cubic-bezier(0.4, 0, 1, 1)",
  out:      "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
};
