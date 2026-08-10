// ─── Factory Helpers for Compressed Maps ──────────────────────────────────────
// Generate maps with repetitive patterns to reduce bundle size after minification

/**
 * Create a map from array of values with simple property pattern
 * @param {string} prop - CSS property name
 * @param {string[]} values - Array of CSS values
 */
function createSimpleMap(prop, values) {
  const map = {};
  for (const value of values) {
    map[value] = `${prop}: ${value};`;
  }
  return map;
}

export const FLEX_DIRECTION_MAP = {
  ...createSimpleMap("flex-direction", ["row", "row-reverse"]),
  col: "flex-direction: column;",
  "col-reverse": "flex-direction: column-reverse;",
};

export const FLEX_WRAP_MAP = {
  ...createSimpleMap("flex-wrap", ["nowrap", "wrap"]),
  "wrap-reverse": "flex-wrap: wrap-reverse;",
};

export const ALIGN_CONTENT_MAP = {
  ...createSimpleMap("align-content", ["normal", "center", "baseline", "stretch"]),
  start: "align-content: flex-start;",
  end: "align-content: flex-end;",
  between: "align-content: space-between;",
  around: "align-content: space-around;",
  evenly: "align-content: space-evenly;",
};

export const ALIGN_SELF_MAP = {
  ...createSimpleMap("align-self", ["auto", "center", "stretch", "baseline"]),
  start: "align-self: flex-start;",
  end: "align-self: flex-end;",
};

export const ALIGN_ITEMS_MAP = {
  ...createSimpleMap("align-items", ["center", "baseline", "stretch"]),
  start: "align-items: flex-start;",
  end: "align-items: flex-end;",
};

export const JUSTIFY_CONTENT_MAP = {
  ...createSimpleMap("justify-content", ["normal", "center", "stretch"]),
  start: "justify-content: flex-start;",
  end: "justify-content: flex-end;",
  between: "justify-content: space-between;",
  around: "justify-content: space-around;",
  evenly: "justify-content: space-evenly;",
};

export const JUSTIFY_ITEMS_MAP = createSimpleMap("justify-items", [
  "normal", "start", "end", "center", "stretch"
]);

export const JUSTIFY_SELF_MAP = createSimpleMap("justify-self", [
  "auto", "start", "end", "center", "stretch"
]);

export const PLACE_CONTENT_MAP = {
  ...createSimpleMap("place-content", ["center", "start", "end", "baseline", "stretch"]),
  between: "place-content: space-between;",
  around: "place-content: space-around;",
  evenly: "place-content: space-evenly;",
};

export const PLACE_ITEMS_MAP = createSimpleMap("place-items", [
  "start", "end", "center", "baseline", "stretch"
]);

export const PLACE_SELF_MAP = createSimpleMap("place-self", [
  "auto", "start", "end", "center", "stretch"
]);

export const GRID_AUTO_FLOW_MAP = {
  row: "grid-auto-flow: row;",
  col: "grid-auto-flow: column;",
  dense: "grid-auto-flow: dense;",
  "row-dense": "grid-auto-flow: row dense;",
  "col-dense": "grid-auto-flow: column dense;",
};
