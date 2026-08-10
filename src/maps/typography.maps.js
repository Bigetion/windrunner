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

export const TEXT_ALIGN_MAP = createSimpleMap("text-align", [
  "left", "center", "right", "justify", "start", "end"
]);

export const TEXT_DECORATION_MAP = {
  ...createSimpleMap("text-decoration-line", ["underline", "overline", "line-through"]),
  "no-underline": "text-decoration-line: none;",
};

export const TEXT_DECORATION_STYLE_MAP = createSimpleMap("text-decoration-style", [
  "solid", "double", "dotted", "dashed", "wavy"
]);

export const TEXT_TRANSFORM_MAP = {
  ...createSimpleMap("text-transform", ["uppercase", "lowercase", "capitalize"]),
  "normal-case": "text-transform: none;",
};

export const TEXT_OVERFLOW_MAP = {
  truncate: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
  "overflow-ellipsis": "text-overflow: ellipsis;",
  "text-ellipsis": "text-overflow: ellipsis;",
  "text-clip": "text-overflow: clip;",
};

export const WHITESPACE_MAP = createSimpleMap("white-space", [
  "normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"
]);

export const WORD_BREAK_MAP = {
  "break-normal": "overflow-wrap: normal; word-break: normal;",
  "break-words": "overflow-wrap: break-word;",
  "break-all": "word-break: break-all;",
  "break-keep": "word-break: keep-all;",
};

export const FONT_STYLE_MAP = {
  italic: "font-style: italic;",
  "not-italic": "font-style: normal;",
};

export const FONT_STRETCH_MAP = createSimpleMap("font-stretch", [
  "ultra-condensed", "extra-condensed", "condensed", "semi-condensed",
  "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded"
]);

export const FONT_VARIANT_NUMERIC_MAP = createSimpleMap("font-variant-numeric", [
  "ordinal", "slashed-zero", "lining-nums", "oldstyle-nums",
  "proportional-nums", "tabular-nums", "diagonal-fractions", "stacked-fractions"
]);

export const LIST_STYLE_IMAGE_MAP = {
  none: "list-style-image: none;",
};

export const TEXT_WRAP_MAP = createSimpleMap("text-wrap", [
  "wrap", "nowrap", "balance", "pretty"
]);

export const HYPHENS_MAP = createSimpleMap("hyphens", ["none", "manual", "auto"]);

export const FONT_SMOOTHING_MAP = {
  antialiased: "-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;",
  "subpixel-antialiased": "-webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto;",
};

export const LIST_STYLE_POSITION_MAP = createSimpleMap("list-style-position", [
  "inside", "outside"
]);

export const VERTICAL_ALIGN_MAP = createSimpleMap("vertical-align", [
  "baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super"
]);
