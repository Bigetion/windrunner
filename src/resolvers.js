import {
  TIME_VALUE_WITH_UNIT_REGEX,
  TIME_VALUE_NUMERIC_REGEX,
  CSS_ESCAPE_BACKSLASH_REGEX,
  CSS_ESCAPE_SPECIAL_CHARS_REGEX,
  CSS_ESCAPE_LEADING_DIGIT_REGEX,
} from "./constants.js";

// ─── Arbitrary value ─────────────────────────────────────────────────────────

export function resolveArbitraryValue(valueKey) {
  if (valueKey.startsWith("[") && valueKey.endsWith("]")) {
    return valueKey.slice(1, -1).replace(/_/g, " ");
  }
  return undefined;
}

// ─── CSS color / image type guards ───────────────────────────────────────────
// Used to prevent arbitrary values that are colors or images from being
// mismatched by builders that check non-color theme scales first
// (e.g. backgroundSize, ringWidth, fontSize) before deferring to color builders.

/**
 * CSS named colors that are valid arbitrary value tokens.
 * Covers all Level 4 named colors and the special keywords.
 */
const CSS_NAMED_COLORS = new Set([
  "aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black",
  "blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse",
  "chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue",
  "darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki",
  "darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon",
  "darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise",
  "darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick",
  "floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod",
  "gray","green","greenyellow","grey","honeydew","hotpink","indianred","indigo",
  "ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue",
  "lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightgrey",
  "lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray",
  "lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen",
  "magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple",
  "mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise",
  "mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite",
  "navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod",
  "palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink",
  "plum","powderblue","purple","rebeccapurple","red","rosybrown","royalblue",
  "saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver",
  "skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue",
  "tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke",
  "yellow","yellowgreen",
  // CSS special color keywords
  "transparent","currentcolor","currentColor","inherit","initial","unset","revert",
]);

/**
 * Returns true if a resolved arbitrary value looks like a CSS color.
 * Covers: hex, functional notations (rgb/hsl/oklch/etc.), named colors, and keywords.
 */
export function isArbitraryColor(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (v.startsWith("#")) return true;
  if (/^rgba?\s*\(/i.test(v)) return true;
  if (/^hsla?\s*\(/i.test(v)) return true;
  if (/^oklch\s*\(/i.test(v)) return true;
  if (/^oklab\s*\(/i.test(v)) return true;
  if (/^color\s*\(/i.test(v)) return true;
  if (/^color-mix\s*\(/i.test(v)) return true;
  if (CSS_NAMED_COLORS.has(v.toLowerCase())) return true;
  return false;
}

/**
 * Returns true if a resolved arbitrary value looks like a CSS image value.
 * Used to prevent bg-[url(...)] from being mismatched as background-size.
 */
export function isArbitraryImage(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return (
    /^url\s*\(/i.test(v) ||
    /^linear-gradient\s*\(/i.test(v) ||
    /^radial-gradient\s*\(/i.test(v) ||
    /^conic-gradient\s*\(/i.test(v)
  );
}

// ─── Theme scale lookup ───────────────────────────────────────────────────────

export function resolveThemeValue(scale, valueKey) {
  if (typeof scale !== "object" || scale === null) return undefined;
  if (Object.prototype.hasOwnProperty.call(scale, valueKey)) {
    return scale[valueKey];
  }
  const arbitrary = resolveArbitraryValue(valueKey);
  if (arbitrary !== undefined) return arbitrary;
  return undefined;
}

// ─── Time value (transition-duration / delay) ─────────────────────────────────

export function resolveTimeValue(valueKey) {
  const arbitrary = resolveArbitraryValue(valueKey);
  if (arbitrary !== undefined) return arbitrary;
  if (TIME_VALUE_WITH_UNIT_REGEX.test(valueKey)) return valueKey;
  if (TIME_VALUE_NUMERIC_REGEX.test(valueKey)) return `${valueKey}ms`;
  return undefined;
}

// ─── Color lookup ─────────────────────────────────────────────────────────────

export function resolveColorValue(colors, colorKey) {
  if (!colors || typeof colors !== "object") return undefined;

  const arbitrary = resolveArbitraryValue(colorKey);
  if (arbitrary !== undefined) return arbitrary;

  if (Object.prototype.hasOwnProperty.call(colors, colorKey)) {
    const direct = colors[colorKey];
    if (typeof direct === "string") return direct;
    if (direct && typeof direct === "object" && typeof direct.DEFAULT === "string") {
      return direct.DEFAULT;
    }
  }

  // nested lookup: "blue-500" → colors.blue["500"]
  const segments = colorKey.split("-");
  let current = colors;
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (!current || typeof current !== "object") return undefined;
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    current = current[segment];
  }

  if (typeof current === "string") return current;
  if (current && typeof current === "object" && typeof current.DEFAULT === "string") {
    return current.DEFAULT;
  }
  return undefined;
}

// ─── Color with opacity modifier: "blue-500/50" ───────────────────────────────

export function resolveColorWithOpacity(colors, rawKey) {
  const slashIdx = rawKey.lastIndexOf("/");
  if (slashIdx === -1) return resolveColorValue(colors, rawKey);

  const colorKey = rawKey.slice(0, slashIdx);
  const opacityStr = rawKey.slice(slashIdx + 1);
  const color = resolveColorValue(colors, colorKey);
  if (color === undefined) return undefined;

  // Arbitrary opacity e.g. /[0.35]
  const arbOpacity = resolveArbitraryValue(opacityStr);
  if (arbOpacity !== undefined) {
    const opacityVal = parseFloat(arbOpacity);
    if (isNaN(opacityVal)) return undefined;
    // If arbitrary opacity is already 0-1, use as-is; if >1, treat as percentage
    const finalOpacity = opacityVal <= 1 ? opacityVal * 100 : opacityVal;
    return `color-mix(in oklch, ${color} ${finalOpacity}%, transparent)`;
  }

  // Numeric opacity (0-100 scale)
  const opacityNum = parseFloat(opacityStr);
  if (isNaN(opacityNum)) return undefined;
  return `color-mix(in oklch, ${color} ${opacityNum}%, transparent)`;
}

// ─── CSS identifier escaping ──────────────────────────────────────────────────

export function escapeCssIdentifier(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value)
    .replace(CSS_ESCAPE_BACKSLASH_REGEX, "\\\\")
    .replace(CSS_ESCAPE_SPECIAL_CHARS_REGEX, "\\$1")
    .replace(CSS_ESCAPE_LEADING_DIGIT_REGEX, "\\3$1 ");
}

// ─── !important appender ──────────────────────────────────────────────────────
// Optimized: uses single regex replace instead of multiple array operations

export function appendImportant(declaration, isImportant) {
  if (!isImportant) return declaration;
  // Match CSS declarations and append !important if not already present
  // Regex captures declaration content before semicolon
  return declaration.replace(/([^;{}]+);/g, (match, decl) => {
    const trimmed = decl.trim();
    if (!trimmed || trimmed.includes("!important")) return match;
    return `${trimmed} !important;`;
  });
}

// ─── Variant delimiter splitter ───────────────────────────────────────────────
// Splits "md:hover:bg-blue-500" into ["md", "hover", "bg-blue-500"]
// but respects brackets so "bg-[url(a:b)]" stays as one token.
// Optimized: uses index slicing instead of character concatenation for better performance

export function splitByVariantDelimiter(token) {
  const parts = [];
  let start = 0;
  let bracketDepth = 0;

  for (let i = 0; i < token.length; i += 1) {
    const char = token[i];
    if (char === "[") {
      bracketDepth += 1;
    } else if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (char === ":" && bracketDepth === 0) {
      parts.push(token.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(token.slice(start));
  return parts;
}
