export const CURSOR_MAP = {
  auto:            "cursor: auto;",
  default:         "cursor: default;",
  pointer:         "cursor: pointer;",
  wait:            "cursor: wait;",
  text:            "cursor: text;",
  move:            "cursor: move;",
  help:            "cursor: help;",
  "not-allowed":   "cursor: not-allowed;",
  none:            "cursor: none;",
  "context-menu":  "cursor: context-menu;",
  progress:        "cursor: progress;",
  cell:            "cursor: cell;",
  crosshair:       "cursor: crosshair;",
  "vertical-text": "cursor: vertical-text;",
  alias:           "cursor: alias;",
  copy:            "cursor: copy;",
  "no-drop":       "cursor: no-drop;",
  grab:            "cursor: grab;",
  grabbing:        "cursor: grabbing;",
  "all-scroll":    "cursor: all-scroll;",
  "zoom-in":       "cursor: zoom-in;",
  "zoom-out":      "cursor: zoom-out;",
};

export const POINTER_EVENTS_MAP = {
  none: "pointer-events: none;",
  auto: "pointer-events: auto;",
};

export const RESIZE_MAP = {
  none:   "resize: none;",
  y:      "resize: vertical;",
  x:      "resize: horizontal;",
  resize: "resize: both;",
};

export const USER_SELECT_MAP = {
  none: "user-select: none;",
  text: "user-select: text;",
  all:  "user-select: all;",
  auto: "user-select: auto;",
};

export const APPEARANCE_MAP = {
  none: "appearance: none;",
  auto: "appearance: auto;",
};

export const TOUCH_ACTION_MAP = {
  auto:         "touch-action: auto;",
  none:         "touch-action: none;",
  "pan-x":      "touch-action: pan-x;",
  "pan-left":   "touch-action: pan-left;",
  "pan-right":  "touch-action: pan-right;",
  "pan-y":      "touch-action: pan-y;",
  "pan-up":     "touch-action: pan-up;",
  "pan-down":   "touch-action: pan-down;",
  "pinch-zoom": "touch-action: pinch-zoom;",
  manipulation: "touch-action: manipulation;",
};

export const OUTLINE_STYLE_MAP = {
  none:   "outline: 2px solid transparent; outline-offset: 2px;",
  solid:  "outline-style: solid;",
  dashed: "outline-style: dashed;",
  dotted: "outline-style: dotted;",
  double: "outline-style: double;",
};

export const BORDER_STYLE_MAP = {
  solid:  "border-style: solid;",
  dashed: "border-style: dashed;",
  dotted: "border-style: dotted;",
  double: "border-style: double;",
  hidden: "border-style: hidden;",
  none:   "border-style: none;",
};

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
