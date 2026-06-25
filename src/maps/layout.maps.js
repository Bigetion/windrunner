export const DISPLAY_MAP = {
  block: "display: block;",
  inline: "display: inline;",
  "inline-block": "display: inline-block;",
  flex: "display: flex;",
  "inline-flex": "display: inline-flex;",
  grid: "display: grid;",
  "inline-grid": "display: inline-grid;",
  hidden: "display: none;",
  contents: "display: contents;",
  "flow-root": "display: flow-root;",
  "list-item": "display: list-item;",
  table: "display: table;",
  "inline-table": "display: inline-table;",
  "table-caption": "display: table-caption;",
  "table-cell": "display: table-cell;",
  "table-column": "display: table-column;",
  "table-column-group": "display: table-column-group;",
  "table-footer-group": "display: table-footer-group;",
  "table-header-group": "display: table-header-group;",
  "table-row-group": "display: table-row-group;",
  "table-row": "display: table-row;",
};

export const POSITION_MAP = {
  static: "position: static;",
  fixed: "position: fixed;",
  absolute: "position: absolute;",
  relative: "position: relative;",
  sticky: "position: sticky;",
};

export const VISIBILITY_MAP = {
  visible: "visibility: visible;",
  invisible: "visibility: hidden;",
  collapse: "visibility: collapse;",
};

export const OVERFLOW_MAP = {
  auto: "overflow: auto;",
  hidden: "overflow: hidden;",
  clip: "overflow: clip;",
  visible: "overflow: visible;",
  scroll: "overflow: scroll;",
};

export const OVERFLOW_X_MAP = {
  auto: "overflow-x: auto;",
  hidden: "overflow-x: hidden;",
  clip: "overflow-x: clip;",
  visible: "overflow-x: visible;",
  scroll: "overflow-x: scroll;",
};

export const OVERFLOW_Y_MAP = {
  auto: "overflow-y: auto;",
  hidden: "overflow-y: hidden;",
  clip: "overflow-y: clip;",
  visible: "overflow-y: visible;",
  scroll: "overflow-y: scroll;",
};

export const OVERSCROLL_MAP = {
  auto: "overscroll-behavior: auto;",
  contain: "overscroll-behavior: contain;",
  none: "overscroll-behavior: none;",
};

export const OVERSCROLL_X_MAP = {
  auto: "overscroll-behavior-x: auto;",
  contain: "overscroll-behavior-x: contain;",
  none: "overscroll-behavior-x: none;",
};

export const OVERSCROLL_Y_MAP = {
  auto: "overscroll-behavior-y: auto;",
  contain: "overscroll-behavior-y: contain;",
  none: "overscroll-behavior-y: none;",
};

export const FLOAT_MAP = {
  left: "float: left;",
  right: "float: right;",
  none: "float: none;",
  start: "float: inline-start;",
  end: "float: inline-end;",
};

export const CLEAR_MAP = {
  left: "clear: left;",
  right: "clear: right;",
  both: "clear: both;",
  none: "clear: none;",
  start: "clear: inline-start;",
  end: "clear: inline-end;",
};

export const ISOLATION_MAP = {
  isolate: "isolation: isolate;",
  "isolation-auto": "isolation: auto;",
};

export const OBJECT_FIT_MAP = {
  contain: "object-fit: contain;",
  cover: "object-fit: cover;",
  fill: "object-fit: fill;",
  none: "object-fit: none;",
  "scale-down": "object-fit: scale-down;",
};

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

export const TABLE_LAYOUT_MAP = {
  auto: "table-layout: auto;",
  fixed: "table-layout: fixed;",
};

export const CAPTION_SIDE_MAP = {
  top: "caption-side: top;",
  bottom: "caption-side: bottom;",
};

export const BORDER_COLLAPSE_MAP = {
  collapse: "border-collapse: collapse;",
  separate: "border-collapse: separate;",
};

export const SCROLL_BEHAVIOR_MAP = {
  auto: "scroll-behavior: auto;",
  smooth: "scroll-behavior: smooth;",
};

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
