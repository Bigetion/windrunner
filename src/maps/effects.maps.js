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

/**
 * Create map with vendor prefixes
 * @param {string} prop - CSS property name
 * @param {string[]} values - Array of values
 * @param {string} vendorPrefix - Vendor prefix (-webkit-, -moz-, etc.)
 */
function createVendorPrefixedMap(prop, values, vendorPrefix) {
  const map = {};
  for (const value of values) {
    map[value] = `${prop}: ${value}; ${vendorPrefix}${prop}: ${value};`;
  }
  return map;
}

export const ANIMATE_MAP = {
  none: "animation: none;",
  spin: "animation: spin 1s linear infinite;",
  ping: "animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;",
  pulse: "animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;",
  bounce: "animation: bounce 1s infinite;",
};

export const INSET_SHADOW_SIZES = {
  none: "box-shadow: none;",
  xs: "box-shadow: inset 0 1px 1px 0 rgb(0 0 0 / 0.05);",
  sm: "box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.1);",
  DEFAULT: "box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.1);",
  md: "box-shadow: inset 0 2px 6px 0 rgb(0 0 0 / 0.1);",
  lg: "box-shadow: inset 0 4px 8px 0 rgb(0 0 0 / 0.15);",
};

export const PERSPECTIVE_MAP = {
  none: "perspective: none;",
  dramatic: "perspective: 100px;",
  near: "perspective: 300px;",
  normal: "perspective: 500px;",
  midrange: "perspective: 800px;",
  distant: "perspective: 1200px;",
};

export const PERSPECTIVE_ORIGIN_MAP = createSimpleMap("perspective-origin", [
  "center", "top", "bottom", "left", "right", "top-left", "top-right", 
  "bottom-left", "bottom-right"
]);

// Mask utilities with vendor prefixes
export const MASK_CLIP_MAP = (() => {
  const map = {};
  const values = { border: "border", padding: "padding", content: "content", text: "text" };
  for (const [key, value] of Object.entries(values)) {
    const fullKey = `mask-clip-${key}`;
    map[fullKey] = `mask-clip: ${value}; -webkit-mask-clip: ${value};`;
  }
  return map;
})();

export const MASK_COMPOSITE_MAP = (() => {
  const map = {};
  const values = ["add", "subtract", "intersect", "exclude", "replace", "xor"];
  for (const value of values) {
    const key = `mask-composite-${value}`;
    map[key] = `mask-composite: ${value}; -webkit-mask-composite: ${value};`;
  }
  return map;
})();

export const MASK_MODE_MAP = (() => {
  const map = {};
  const values = ["alpha", "luminance", "match-source"];
  for (const value of values) {
    const key = `mask-mode-${value}`;
    map[key] = `mask-mode: ${value}; -webkit-mask-mode: ${value};`;
  }
  return map;
})();

export const MASK_ORIGIN_MAP = (() => {
  const map = {};
  const values = { 
    border: "border-box", padding: "padding-box", content: "content-box",
    fill: "fill-box", stroke: "stroke-box", view: "view-box"
  };
  for (const [key, value] of Object.entries(values)) {
    const fullKey = `mask-origin-${key}`;
    map[fullKey] = `mask-origin: ${value}; -webkit-mask-origin: ${value};`;
  }
  return map;
})();

export const MASK_TYPE_MAP = (() => {
  const map = {};
  const values = ["luminance", "alpha"];
  for (const value of values) {
    const key = `mask-type-${value}`;
    map[key] = `mask-type: ${value}; -webkit-mask-type: ${value};`;
  }
  return map;
})();

export const MASK_LINEAR_MAP = (() => {
  const map = {};
  const directions = {
    "to-t": "to top", "to-tr": "to top right", "to-r": "to right",
    "to-br": "to bottom right", "to-b": "to bottom", "to-bl": "to bottom left",
    "to-l": "to left", "to-tl": "to top left"
  };
  for (const [key, direction] of Object.entries(directions)) {
    const fullKey = `mask-linear-${key}`;
    const gradient = `linear-gradient(${direction}, black, transparent)`;
    map[fullKey] = `mask-image: ${gradient}; -webkit-mask-image: ${gradient};`;
  }
  map["mask-none"] = "mask-image: none; -webkit-mask-image: none;";
  return map;
})();

export const MASK_RADIAL_POSITIONS = {
  center: "center",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  "top-right": "top right",
  "bottom-right": "bottom right",
  "bottom-left": "bottom left",
  "top-left": "top left",
};

export const MASK_REPEAT_MAP = (() => {
  const map = {};
  const values = { 
    "mask-repeat": "repeat",
    "mask-no-repeat": "no-repeat", 
    "mask-repeat-x": "repeat-x",
    "mask-repeat-y": "repeat-y",
    "mask-repeat-round": "round",
    "mask-repeat-space": "space"
  };
  for (const [key, value] of Object.entries(values)) {
    map[key] = `mask-repeat: ${value}; -webkit-mask-repeat: ${value};`;
  }
  return map;
})();

export const MASK_SIZE_MAP = (() => {
  const map = {};
  const values = ["auto", "cover", "contain"];
  for (const value of values) {
    const key = `mask-size-${value}`;
    map[key] = `mask-size: ${value}; -webkit-mask-size: ${value};`;
  }
  return map;
})();

export const BG_ATTACHMENT_MAP = createSimpleMap("background-attachment", [
  "fixed", "local", "scroll"
]);

export const BG_CLIP_MAP = {
  border: "background-clip: border-box;",
  padding: "background-clip: padding-box;",
  content: "background-clip: content-box;",
  text: "background-clip: text; -webkit-background-clip: text;",
};

export const BG_ORIGIN_MAP = {
  border: "background-origin: border-box;",
  padding: "background-origin: padding-box;",
  content: "background-origin: content-box;",
};

export const BG_REPEAT_MAP = {
  ...createSimpleMap("background-repeat", ["repeat", "no-repeat", "repeat-x", "repeat-y"]),
  "repeat-round": "background-repeat: round;",
  "repeat-space": "background-repeat: space;",
};

// Blend mode maps - use factory for repeated patterns
export const MIX_BLEND_MAP = (() => {
  const map = {};
  const modes = [
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light",
    "difference", "exclusion", "hue", "saturation", "color",
    "luminosity", "plus-darker", "plus-lighter"
  ];
  for (const mode of modes) {
    map[`mix-blend-${mode}`] = `mix-blend-mode: ${mode};`;
  }
  return map;
})();

export const BG_BLEND_MAP = (() => {
  const map = {};
  const modes = [
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light",
    "difference", "exclusion", "hue", "saturation", "color", "luminosity"
  ];
  for (const mode of modes) {
    map[`bg-blend-${mode}`] = `background-blend-mode: ${mode};`;
  }
  return map;
})();

export const TEXT_SHADOW_SIZES = {
  "2xs":  "0 1px 2px rgb(0 0 0 / 0.10)",
  xs:     "0 1px 2px rgb(0 0 0 / 0.20)",
  sm:     "0 1px 3px rgb(0 0 0 / 0.25)",
  DEFAULT:"0 1px 3px rgb(0 0 0 / 0.30)",
  md:     "0 2px 4px rgb(0 0 0 / 0.30)",
  lg:     "0 4px 6px rgb(0 0 0 / 0.25)",
  xl:     "0 8px 12px rgb(0 0 0 / 0.20)",
  "2xl":  "0 16px 24px rgb(0 0 0 / 0.15)",
  none:   "none",
};

export const FORCED_COLOR_MAP = {
  "forced-color-adjust-auto": "forced-color-adjust: auto;",
  "forced-color-adjust-none": "forced-color-adjust: none;",
};
