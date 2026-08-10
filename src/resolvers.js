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

// ─── Bracket-aware variant delimiter splitter ─────────────────────────────────
/**
 * Split class name by variant delimiter (colon) with bracket-aware parsing.
 * 
 * This function correctly handles arbitrary variants with nested brackets by tracking
 * bracket depth and only splitting on colons that are outside of bracket context.
 * 
 * Examples:
 * - "md:hover:bg-blue-500" → ["md", "hover", "bg-blue-500"]
 * - "[@media(min-width:768px)]:bg-blue-500" → ["[@media(min-width:768px)]", "bg-blue-500"]
 * - "[&>span]:text-red-500" → ["[&>span]", "text-red-500"]
 * - "bg-[rgb(255:128:64)]" → ["bg-[rgb(255:128:64)]"]
 * - "md:[@media(hover:hover)]:[&>span]:hover:text-blue-500" → ["md", "[@media(hover:hover)]", "[&>span]", "hover", "text-blue-500"]
 * 
 * The implementation:
 * 1. Tracks bracket depth as it iterates through the string
 * 2. Only treats colons as delimiters when bracket depth is 0
 * 3. Safely handles unmatched brackets by never letting depth go negative
 * 
 * Requirement 7.3: Parse arbitrary variants using bracket-aware delimiter splitting
 * to correctly handle nested brackets like [@media(min-width:768px)]:bg-blue-500
 * 
 * @param {string} token - Class name token to split
 * @returns {string[]} - Array of variant parts and base utility
 */
export function splitByVariantDelimiterBracketAware(token) {
  const parts = [];
  let start = 0;
  let bracketDepth = 0;

  for (let i = 0; i < token.length; i += 1) {
    const char = token[i];
    if (char === "[") {
      bracketDepth += 1;
    } else if (char === "]") {
      // Safely decrement, never go below 0 to handle malformed input gracefully
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (char === ":" && bracketDepth === 0) {
      // Only split on colons outside brackets
      parts.push(token.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(token.slice(start));
  return parts;
}

/**
 * Alias for splitByVariantDelimiterBracketAware for backward compatibility
 * @deprecated Use splitByVariantDelimiterBracketAware for clarity
 */
export const splitByVariantDelimiter = splitByVariantDelimiterBracketAware;

// ─── Named group/peer variant parser ──────────────────────────────────────────
/**
 * Parse named group or peer variant
 * Supports patterns:
 * - group/[name] → marker class
 * - peer/[name] → marker class
 * - group-[state]/[name] → state-based group variant
 * - peer-[state]/[name] → state-based peer variant
 * 
 * @param {string} variant - e.g., "group-hover/sidebar", "peer-checked/toggle", "group/nav", "peer/input"
 * @returns {{ type: 'group'|'peer', state: string|null, name: string } | null}
 */
export function parseNamedVariant(variant) {
  if (typeof variant !== "string" || !variant) return null;

  // Match pattern: (group|peer)(-state)?/name
  // Examples:
  // - group/sidebar → type=group, state=null, name=sidebar
  // - group-hover/sidebar → type=group, state=hover, name=sidebar
  // - peer/toggle → type=peer, state=null, name=toggle
  // - peer-checked/toggle → type=peer, state=checked, name=toggle
  const match = variant.match(/^(group|peer)(?:-([a-zA-Z0-9_-]+))?\/([a-zA-Z0-9_-]+)$/);
  
  if (!match) return null;
  
  const [, type, state, name] = match;
  
  return {
    type,                    // 'group' or 'peer'
    state: state || null,    // hover, focus, checked, etc. (or null for marker)
    name,                    // sidebar, toggle, nav, etc.
  };
}

// ─── Advanced variant parser (has-*, data-*, aria-*) ──────────────────────────
/**
 * Parse advanced state variant
 * Supports patterns:
 * - has-[selector] → :has() pseudo-class
 * - group-has-[selector] → .group:has(selector) .class
 * - peer-has-[selector] → .peer:has(selector) ~ .class
 * - data-[attr] → [data-attr] attribute selector
 * - data-[attr=value] → [data-attr="value"] attribute selector
 * - aria-[attr] → [aria-attr] attribute selector
 * - aria-[attr=value] → [aria-attr="value"] attribute selector
 * 
 * @param {string} variant - e.g., "has-[:checked]", "data-[state=open]", "aria-[expanded=true]"
 * @returns {{ type: string, content?: string, attribute?: string, value?: string|null } | null}
 */
export function parseAdvancedVariant(variant) {
  if (typeof variant !== "string" || !variant) return null;

  // Helper function to extract bracketed content with nested bracket support
  const extractBracketContent = (str, prefix) => {
    if (!str.startsWith(prefix + '[') || !str.endsWith(']')) return null;
    
    let bracketDepth = 0;
    let startIdx = prefix.length;
    
    for (let i = startIdx; i < str.length; i++) {
      if (str[i] === '[') {
        if (bracketDepth === 0) startIdx = i + 1;
        bracketDepth++;
      } else if (str[i] === ']') {
        bracketDepth--;
        if (bracketDepth === 0) {
          const content = str.slice(startIdx, i);
          // Return null for empty content
          return content.length > 0 ? content : null;
        }
      }
    }
    return null;
  };

  // Match has-[...] pattern with nested bracket support
  if (variant.startsWith('has-[')) {
    const content = extractBracketContent(variant, 'has-');
    if (content !== null) {
      return {
        type: 'has',
        content
      };
    }
  }
  
  // Match group-has-[...] pattern with nested bracket support
  if (variant.startsWith('group-has-[')) {
    const content = extractBracketContent(variant, 'group-has-');
    if (content !== null) {
      return {
        type: 'group-has',
        content
      };
    }
  }
  
  // Match peer-has-[...] pattern with nested bracket support
  if (variant.startsWith('peer-has-[')) {
    const content = extractBracketContent(variant, 'peer-has-');
    if (content !== null) {
      return {
        type: 'peer-has',
        content
      };
    }
  }
  
  // Match data-[attr] or data-[attr=value] pattern (no nested brackets expected)
  const dataMatch = variant.match(/^data-\[([^\]=]+)(?:=([^\]]+))?\]$/);
  if (dataMatch) {
    return {
      type: 'data',
      attribute: dataMatch[1],
      value: dataMatch[2] || null
    };
  }
  
  // Match aria-[attr] or aria-[attr=value] pattern (no nested brackets expected)
  const ariaMatch = variant.match(/^aria-\[([^\]=]+)(?:=([^\]]+))?\]$/);
  if (ariaMatch) {
    return {
      type: 'aria',
      attribute: ariaMatch[1],
      value: ariaMatch[2] || null
    };
  }
  
  return null;
}

// ─── Arbitrary variant parser ─────────────────────────────────────────────────
/**
 * Parse arbitrary variant
 * 
 * Supports patterns:
 * - [&>selector] → arbitrary selector variant (& represents base selector)
 * - [@media(...)] → arbitrary media query variant
 * - [@container(...)] → arbitrary container query variant
 * - [@supports(...)] → arbitrary supports query variant
 * 
 * Examples:
 * - "[&>span]" → { type: 'selector', content: '&>span' }
 * - "[@media(hover:hover)]" → { type: 'media', content: '(hover:hover)' }
 * - "[@container(min-width:768px)]" → { type: 'container', content: '(min-width:768px)' }
 * - "[@supports(display:grid)]" → { type: 'supports', content: '(display:grid)' }
 * 
 * Requirement 7.1: Detect [&...] pattern for arbitrary selectors
 * Requirement 7.2: Detect [@media(...)] pattern for arbitrary media queries
 * Requirement 7.2: Support [@container(...)] and [@supports(...)] patterns
 * 
 * @param {string} variant - e.g., "[&>span]", "[@media(hover:hover)]"
 * @returns {{ type: 'selector'|'media'|'container'|'supports', content: string } | null}
 */
export function parseArbitraryVariant(variant) {
  if (typeof variant !== "string" || !variant) return null;
  
  // Must start and end with brackets
  if (!variant.startsWith('[') || !variant.endsWith(']')) {
    return null;
  }
  
  // Extract content between outer brackets
  const content = variant.slice(1, -1);
  
  // Empty or whitespace-only content is invalid
  if (!content || !content.trim()) return null;
  
  // Detect media query pattern: [@media(...)]
  if (content.startsWith('@media')) {
    const queryContent = content.slice(6).trim(); // Remove "@media" prefix
    return {
      type: 'media',
      content: queryContent
    };
  }
  
  // Detect container query pattern: [@container(...)]
  if (content.startsWith('@container')) {
    const queryContent = content.slice(10).trim(); // Remove "@container" prefix
    return {
      type: 'container',
      content: queryContent
    };
  }
  
  // Detect supports query pattern: [@supports(...)]
  if (content.startsWith('@supports')) {
    const queryContent = content.slice(9).trim(); // Remove "@supports" prefix
    return {
      type: 'supports',
      content: queryContent
    };
  }
  
  // Otherwise treat as arbitrary selector
  return {
    type: 'selector',
    content
  };
}

// ─── Arbitrary variant CSS generation ─────────────────────────────────────────
/**
 * Apply arbitrary variant to selector
 * 
 * For selector variants: Replaces & with base selector
 * For at-rule variants: Returns wrapper object to be processed by compiler
 * 
 * Examples:
 * - applyArbitraryVariant('.class', { type: 'selector', content: '&>span' })
 *   → '.class>span'
 * 
 * - applyArbitraryVariant('.class', { type: 'selector', content: '& p' })
 *   → '.class p'
 * 
 * - applyArbitraryVariant('.class', { type: 'media', content: '(hover:hover)' })
 *   → { __type: 'media-wrapper', query: '(hover:hover)', selector: '.class' }
 * 
 * - applyArbitraryVariant('.class', { type: 'container', content: '(min-width:768px)' })
 *   → { __type: 'container-wrapper', query: '(min-width:768px)', selector: '.class' }
 * 
 * Requirement 7.4: Replace & with base selector in arbitrary selector variants
 * Requirement 7.5: Return wrapper objects for media/container/supports queries
 * Requirement 7.7: Preserve variant order when multiple arbitrary variants present
 * 
 * @param {string} selector - Base CSS selector (e.g., '.class')
 * @param {{ type: string, content: string }} parsed - Parsed arbitrary variant
 * @returns {string | object} - Modified selector or wrapper object for at-rules
 */
export function applyArbitraryVariant(selector, parsed) {
  if (!parsed || typeof parsed !== 'object') return selector;
  
  const { type, content } = parsed;
  
  switch (type) {
    case 'selector': {
      // Replace & with base selector
      // Examples:
      // - '&>span' → '.class>span'
      // - '& p' → '.class p'
      // - '&:hover' → '.class:hover'
      // - '&::before' → '.class::before'
      // - '[&>span]:text-red-500' → '.class>span'
      const transformed = content.replace(/&/g, selector);
      return transformed;
    }
    
    case 'media':
      // Return wrapper indicator for media query
      // The compiler will wrap the CSS rule in @media
      return {
        __type: 'media-wrapper',
        query: content,
        selector
      };
      
    case 'container':
      // Return wrapper indicator for container query
      // The compiler will wrap the CSS rule in @container
      return {
        __type: 'container-wrapper',
        query: content,
        selector
      };
      
    case 'supports':
      // Return wrapper indicator for supports query
      // The compiler will wrap the CSS rule in @supports
      return {
        __type: 'supports-wrapper',
        query: content,
        selector
      };
      
    default:
      return selector;
  }
}
