import { getConfigOptions } from "./utils.js";
import { splitByVariantDelimiter, escapeCssIdentifier, appendImportant, parseNamedVariant, parseAdvancedVariant, parseArbitraryVariant, applyArbitraryVariant } from "./resolvers.js";
import { buildLayoutDeclaration, buildPositionInsetDeclaration } from "./builders/layout.js";
import { buildSpacingDeclaration, buildGapDeclaration, buildDimensionDeclaration } from "./builders/spacing.js";
import { buildFlexGridDeclaration } from "./builders/flexgrid.js";
import { buildTypographyDeclaration } from "./builders/typography.js";
import { buildColorDeclaration } from "./builders/colors.js";
import { buildBorderDeclaration, buildBorderRadiusDeclaration } from "./builders/borders.js";
import {
  buildOpacityDeclaration,
  buildShadowDeclaration,
  buildInsetShadowDeclaration,
  buildInsetRingDeclaration,
  buildRingDeclaration,
  buildTextShadowDeclaration,
  buildRingOffsetDeclaration,
} from "./builders/effects.js";
import { buildBackgroundDeclaration, buildGradientDeclaration } from "./builders/backgrounds.js";
import { buildTransformDeclaration } from "./builders/transforms.js";
import { buildFilterDeclaration } from "./builders/filters.js";
import { buildTransitionDeclaration } from "./builders/transitions.js";
import {
  buildAnimationDeclaration,
  buildMaskDeclaration,
  buildContainerQueryDeclaration,
  buildInteractivityDeclaration,
  buildZoomDeclaration,
  buildForcedColorDeclaration,
  buildBorderSpacingDeclaration,
  buildScrollSnapDeclaration,
  buildAccessibilityDeclaration,
  buildNamedVariantMarkerDeclaration,
} from "./builders/misc.js";
import { buildBlendingDeclaration } from "./builders/blending.js";
import { buildSpaceBetweenDeclaration, buildDivideDeclaration, isChildScoped } from "./builders/space-divide.js";
import { PluginRegistry, isPlugin } from "./plugins.js";

// ─── Lazy Builder Loading System ──────────────────────────────────────────────

/**
 * Lazy builder registry: category name → dynamic import function
 * Allows tree-shaking by bundlers and on-demand loading in environments that support it
 */
const LAZY_BUILDER_MAP = {
  layout: () => import('./builders/layout.js'),
  spacing: () => import('./builders/spacing.js'),
  typography: () => import('./builders/typography.js'),
  colors: () => import('./builders/colors.js'),
  borders: () => import('./builders/borders.js'),
  effects: () => import('./builders/effects.js'),
  transforms: () => import('./builders/transforms.js'),
  transitions: () => import('./builders/transitions.js'),
  filters: () => import('./builders/filters.js'),
  flexgrid: () => import('./builders/flexgrid.js'),
  backgrounds: () => import('./builders/backgrounds.js'),
  blending: () => import('./builders/blending.js'),
  misc: () => import('./builders/misc.js'),
  spaceDivide: () => import('./builders/space-divide.js'),
};

/**
 * Track loaded builder modules to avoid duplicate loads
 * Maps category name → loaded module object
 */
const loadedBuilders = new Map();

/**
 * Track in-progress loads to avoid duplicate parallel loads
 * Maps category name → Promise<module>
 */
const loadingPromises = new Map();

/**
 * Load a builder module by category with promise caching
 * @param {string} category - Builder category name (e.g., 'layout', 'spacing')
 * @returns {Promise<object|null>} - Loaded module or null if not found
 */
async function loadBuilder(category) {
  // Return cached if already loaded
  if (loadedBuilders.has(category)) {
    return loadedBuilders.get(category);
  }
  
  // Wait for in-progress load
  if (loadingPromises.has(category)) {
    return loadingPromises.get(category);
  }
  
  // Start new load
  const loader = LAZY_BUILDER_MAP[category];
  if (!loader) return null;
  
  const promise = loader()
    .then(module => {
      loadedBuilders.set(category, module);
      loadingPromises.delete(category);
      return module;
    })
    .catch(error => {
      loadingPromises.delete(category);
      console.error(`[Windrunner] Failed to load builder: ${category}`, error);
      return null;
    });
  
  loadingPromises.set(category, promise);
  return promise;
}

/**
 * Prefix to category mapping for O(1) builder routing
 * Maps utility prefix → array of builder categories
 */
const PREFIX_TO_CATEGORY = {
  // Layout & Display
  "block": ['layout'],
  "inline": ['layout'],
  "flex": ['flexgrid', 'layout'],
  "grid": ['flexgrid', 'layout'],
  "hidden": ['layout'],
  "table": ['layout'],
  "flow": ['layout'],
  
  // Position
  "static": ['layout'],
  "fixed": ['layout'],
  "absolute": ['layout'],
  "relative": ['layout'],
  "sticky": ['layout'],
  "inset": ['layout', 'effects'],
  "top": ['layout'],
  "right": ['layout'],
  "bottom": ['layout'],
  "left": ['layout'],
  "start": ['layout'],
  "end": ['layout'],
  "z": ['layout'],
  
  // Spacing
  "m": ['spacing'],
  "mx": ['spacing'],
  "my": ['spacing'],
  "mt": ['spacing'],
  "mr": ['spacing'],
  "mb": ['spacing'],
  "ml": ['spacing'],
  "ms": ['spacing'],
  "me": ['spacing'],
  "p": ['spacing'],
  "px": ['spacing'],
  "py": ['spacing'],
  "pt": ['spacing'],
  "pr": ['spacing'],
  "pb": ['spacing'],
  "pl": ['spacing'],
  "ps": ['spacing'],
  "pe": ['spacing'],
  "space": ['spaceDivide'],
  
  // Sizing
  "w": ['spacing'],
  "h": ['spacing'],
  "min": ['spacing'],
  "max": ['spacing'],
  "size": ['spacing'],
  
  // Typography
  "text": ['typography', 'colors'],
  "font": ['typography'],
  "leading": ['typography'],
  "tracking": ['typography'],
  "line": ['typography'],
  "whitespace": ['typography'],
  "break": ['typography'],
  "hyphens": ['typography'],
  "list": ['typography'],
  "italic": ['typography'],
  "underline": ['typography'],
  "overline": ['typography'],
  "uppercase": ['typography'],
  "lowercase": ['typography'],
  "capitalize": ['typography'],
  "normal": ['typography', 'layout'],
  "truncate": ['typography'],
  
  // Colors & Backgrounds
  "bg": ['backgrounds', 'colors'],
  "from": ['backgrounds'],
  "via": ['backgrounds'],
  "to": ['backgrounds'],
  "fill": ['colors'],
  "stroke": ['colors'],
  
  // Borders
  "border": ['borders', 'colors'],
  "rounded": ['borders'],
  "divide": ['spaceDivide'],
  
  // Effects
  "shadow": ['effects'],
  "opacity": ['effects'],
  "ring": ['effects'],
  
  // Transforms
  "scale": ['transforms'],
  "rotate": ['transforms'],
  "translate": ['transforms'],
  "skew": ['transforms'],
  "origin": ['transforms'],
  "transform": ['transforms'],
  
  // Filters
  "blur": ['filters'],
  "brightness": ['filters'],
  "contrast": ['filters'],
  "grayscale": ['filters'],
  "hue": ['filters'],
  "invert": ['filters'],
  "saturate": ['filters'],
  "sepia": ['filters'],
  "drop": ['filters'],
  "backdrop": ['filters'],
  
  // Transitions & Animations
  "transition": ['transitions'],
  "duration": ['transitions'],
  "ease": ['transitions'],
  "delay": ['transitions'],
  "animate": ['misc'],
  
  // Interactivity
  "cursor": ['misc'],
  "pointer": ['misc'],
  "resize": ['misc'],
  "select": ['misc'],
  "appearance": ['misc'],
  "outline": ['colors', 'misc'],
  "caret": ['colors'],
  "accent": ['colors'],
  
  // Flexbox & Grid specific
  "items": ['flexgrid'],
  "justify": ['flexgrid'],
  "place": ['flexgrid'],
  "content": ['flexgrid', 'typography'],
  "self": ['flexgrid'],
  "order": ['flexgrid'],
  "gap": ['spacing'],
  "grow": ['flexgrid'],
  "shrink": ['flexgrid'],
  "basis": ['flexgrid'],
  "cols": ['flexgrid'],
  "rows": ['flexgrid'],
  "col": ['flexgrid'],
  "row": ['flexgrid'],
  "auto": ['flexgrid', 'layout'],
  
  // Misc
  "overflow": ['layout'],
  "overscroll": ['misc'],
  "scroll": ['misc'],
  "snap": ['misc'],
  "touch": ['misc'],
  "will": ['misc'],
  "mix": ['blending'],
  "blend": ['blending'],
  "isolation": ['layout'],
  "object": ['layout'],
  "container": ['misc'],
  "columns": ['layout'],
  "aspect": ['layout'],
  "clear": ['layout'],
  "float": ['layout'],
  "box": ['layout'],
  "visible": ['layout'],
  "invisible": ['layout'],
  "collapse": ['layout'],
  "mask": ['misc'],
  "forced": ['misc'],
  "field": ['misc'],
  "placeholder": ['colors'],
  "sr": ['misc'],
  "not": ['misc'],
  
  // Named variant markers
  "group": ['misc'],
  "peer": ['misc'],
};

/**
 * Async compilation path with lazy builder loading
 * @param {string} baseToken - Base utility token (e.g., 'mt-4')
 * @param {object} theme - Theme configuration
 * @param {PluginRegistry} pluginRegistry - Plugin registry
 * @returns {Promise<string|undefined>} - CSS declaration or undefined
 */
async function compileBaseTokenLazy(baseToken, theme, pluginRegistry) {
  // Check custom utilities first (plugins have priority)
  if (pluginRegistry) {
    const pluginMatch = pluginRegistry.matchUtility(baseToken);
    if (pluginMatch) {
      const { handler, match } = pluginMatch;
      try {
        if (typeof handler === 'function') {
          const result = handler(match, theme);
          if (result) return result;
        } else if (typeof handler === 'string') {
          return handler;
        }
      } catch (error) {
        console.warn(`[Windrunner] Plugin utility handler error for "${baseToken}":`, error);
      }
    }
  }
  
  // Extract prefix and get relevant categories
  const prefix = extractPrefix(baseToken);
  const categories = PREFIX_TO_CATEGORY[prefix];
  
  if (!categories) {
    // Fallback: try all categories
    for (const category of Object.keys(LAZY_BUILDER_MAP)) {
      const builderModule = await loadBuilder(category);
      if (!builderModule) continue;
      
      // Try each exported builder function
      for (const [name, fn] of Object.entries(builderModule)) {
        if (typeof fn === 'function' && name.startsWith('build')) {
          const result = fn(baseToken, theme);
          if (result) return result;
        }
      }
    }
    return undefined;
  }
  
  // Try each relevant category
  for (const category of categories) {
    const builderModule = await loadBuilder(category);
    if (!builderModule) continue;
    
    // Try each exported builder function in this module
    for (const [name, fn] of Object.entries(builderModule)) {
      if (typeof fn === 'function' && name.startsWith('build')) {
        const result = fn(baseToken, theme);
        if (result) return result;
      }
    }
  }
  
  return undefined;
}

// ─── Prefix-based Router for Performance (Synchronous Path) ───────────────────

/**
 * Router map: prefix → array of relevant builder functions
 * This allows us to only check relevant builders instead of all 30+ functions
 * Used for synchronous compilation (backward compatibility)
 */
const PREFIX_ROUTER = {
  // Layout & Display
  "block": [buildLayoutDeclaration],
  "inline": [buildLayoutDeclaration],
  "flex": [buildFlexGridDeclaration, buildLayoutDeclaration],
  "grid": [buildFlexGridDeclaration, buildLayoutDeclaration],
  "hidden": [buildLayoutDeclaration],
  "table": [buildLayoutDeclaration],
  "flow": [buildLayoutDeclaration],
  
  // Position
  "static": [buildLayoutDeclaration],
  "fixed": [buildLayoutDeclaration],
  "absolute": [buildLayoutDeclaration],
  "relative": [buildLayoutDeclaration],
  "sticky": [buildLayoutDeclaration],
  "inset": [buildPositionInsetDeclaration, buildInsetShadowDeclaration, buildInsetRingDeclaration],
  "top": [buildPositionInsetDeclaration],
  "right": [buildPositionInsetDeclaration],
  "bottom": [buildPositionInsetDeclaration],
  "left": [buildPositionInsetDeclaration],
  "start": [buildPositionInsetDeclaration],
  "end": [buildPositionInsetDeclaration],
  "z": [buildLayoutDeclaration],
  
  // Spacing
  "m": [buildSpacingDeclaration],
  "mx": [buildSpacingDeclaration],
  "my": [buildSpacingDeclaration],
  "mt": [buildSpacingDeclaration],
  "mr": [buildSpacingDeclaration],
  "mb": [buildSpacingDeclaration],
  "ml": [buildSpacingDeclaration],
  "ms": [buildSpacingDeclaration],
  "me": [buildSpacingDeclaration],
  "p": [buildSpacingDeclaration],
  "px": [buildSpacingDeclaration],
  "py": [buildSpacingDeclaration],
  "pt": [buildSpacingDeclaration],
  "pr": [buildSpacingDeclaration],
  "pb": [buildSpacingDeclaration],
  "pl": [buildSpacingDeclaration],
  "ps": [buildSpacingDeclaration],
  "pe": [buildSpacingDeclaration],
  "space": [buildSpaceBetweenDeclaration],
  
  // Sizing
  "w": [buildDimensionDeclaration],
  "h": [buildDimensionDeclaration],
  "min": [buildDimensionDeclaration],
  "max": [buildDimensionDeclaration],
  "size": [buildDimensionDeclaration],
  
  // Typography
  "text": [buildTypographyDeclaration, buildColorDeclaration],
  "font": [buildTypographyDeclaration],
  "leading": [buildTypographyDeclaration],
  "tracking": [buildTypographyDeclaration],
  "line": [buildTypographyDeclaration],
  "whitespace": [buildTypographyDeclaration],
  "break": [buildTypographyDeclaration],
  "hyphens": [buildTypographyDeclaration],
  "list": [buildTypographyDeclaration],
  "italic": [buildTypographyDeclaration],
  "underline": [buildTypographyDeclaration],
  "overline": [buildTypographyDeclaration],
  "uppercase": [buildTypographyDeclaration],
  "lowercase": [buildTypographyDeclaration],
  "capitalize": [buildTypographyDeclaration],
  "normal": [buildTypographyDeclaration, buildLayoutDeclaration],
  "truncate": [buildTypographyDeclaration],
  
  // Colors & Backgrounds
  "bg": [buildBackgroundDeclaration, buildColorDeclaration, buildGradientDeclaration],
  "from": [buildGradientDeclaration],
  "via": [buildGradientDeclaration],
  "to": [buildGradientDeclaration],
  "fill": [buildColorDeclaration],
  "stroke": [buildColorDeclaration],
  
  // Borders
  "border": [buildBorderDeclaration, buildColorDeclaration],
  "rounded": [buildBorderRadiusDeclaration],
  "divide": [buildDivideDeclaration],
  
  // Effects
  "shadow": [buildShadowDeclaration, buildTextShadowDeclaration],
  "opacity": [buildOpacityDeclaration],
  "ring": [buildRingDeclaration, buildRingOffsetDeclaration],
  
  // Transforms
  "scale": [buildTransformDeclaration],
  "rotate": [buildTransformDeclaration],
  "translate": [buildTransformDeclaration],
  "skew": [buildTransformDeclaration],
  "origin": [buildTransformDeclaration],
  "transform": [buildTransformDeclaration],
  
  // Filters
  "blur": [buildFilterDeclaration],
  "brightness": [buildFilterDeclaration],
  "contrast": [buildFilterDeclaration],
  "grayscale": [buildFilterDeclaration],
  "hue": [buildFilterDeclaration],
  "invert": [buildFilterDeclaration],
  "saturate": [buildFilterDeclaration],
  "sepia": [buildFilterDeclaration],
  "drop": [buildFilterDeclaration],
  "backdrop": [buildFilterDeclaration],
  
  // Transitions & Animations
  "transition": [buildTransitionDeclaration],
  "duration": [buildTransitionDeclaration],
  "ease": [buildTransitionDeclaration],
  "delay": [buildTransitionDeclaration],
  "animate": [buildAnimationDeclaration],
  
  // Interactivity
  "cursor": [buildInteractivityDeclaration],
  "pointer": [buildInteractivityDeclaration],
  "resize": [buildInteractivityDeclaration],
  "select": [buildInteractivityDeclaration],
  "appearance": [buildInteractivityDeclaration],
  "outline": [buildColorDeclaration, buildInteractivityDeclaration],
  "caret": [buildColorDeclaration],
  "accent": [buildColorDeclaration],
  
  // Flexbox & Grid specific
  "items": [buildFlexGridDeclaration],
  "justify": [buildFlexGridDeclaration],
  "place": [buildFlexGridDeclaration],
  "content": [buildFlexGridDeclaration, buildTypographyDeclaration],
  "self": [buildFlexGridDeclaration],
  "order": [buildFlexGridDeclaration],
  "gap": [buildGapDeclaration],
  "grow": [buildFlexGridDeclaration],
  "shrink": [buildFlexGridDeclaration],
  "basis": [buildFlexGridDeclaration],
  "cols": [buildFlexGridDeclaration],
  "rows": [buildFlexGridDeclaration],
  "col": [buildFlexGridDeclaration],
  "row": [buildFlexGridDeclaration],
  "auto": [buildFlexGridDeclaration, buildLayoutDeclaration],
  
  // Misc
  "overflow": [buildLayoutDeclaration],
  "overscroll": [buildInteractivityDeclaration],
  "scroll": [buildScrollSnapDeclaration, buildInteractivityDeclaration],
  "snap": [buildScrollSnapDeclaration],
  "touch": [buildInteractivityDeclaration],
  "will": [buildInteractivityDeclaration],
  "mix": [buildBlendingDeclaration],
  "blend": [buildBlendingDeclaration],
  "isolation": [buildLayoutDeclaration],
  "object": [buildLayoutDeclaration],
  "container": [buildContainerQueryDeclaration],
  "columns": [buildLayoutDeclaration],
  "aspect": [buildLayoutDeclaration],
  "clear": [buildLayoutDeclaration],
  "float": [buildLayoutDeclaration],
  "box": [buildLayoutDeclaration],
  "visible": [buildLayoutDeclaration],
  "invisible": [buildLayoutDeclaration],
  "collapse": [buildLayoutDeclaration],
  "mask": [buildMaskDeclaration],
  "forced": [buildForcedColorDeclaration],
  "field": [buildInteractivityDeclaration],
  "placeholder": [buildColorDeclaration],
  "sr": [buildAccessibilityDeclaration],
  "not": [buildAccessibilityDeclaration],
  
  // Named variant markers
  "group": [buildNamedVariantMarkerDeclaration],
  "peer": [buildNamedVariantMarkerDeclaration],
};

/**
 * Extract the prefix from a utility class token.
 * Examples: "bg-blue-500" → "bg", "text-xl" → "text", "mt-4" → "mt"
 */
function extractPrefix(token) {
  // Handle single-word utilities (flex, block, etc.)
  const dashIndex = token.indexOf("-");
  if (dashIndex === -1) return token;
  
  // Handle multi-dash prefixes (min-w, max-h, etc.)
  const prefix = token.slice(0, dashIndex);
  
  // Check for two-part prefixes
  const secondDashIndex = token.indexOf("-", dashIndex + 1);
  if (secondDashIndex !== -1) {
    const twoPartPrefix = token.slice(0, secondDashIndex);
    if (PREFIX_ROUTER[twoPartPrefix]) return twoPartPrefix;
  }
  
  return prefix;
}

// ─── Unknown Prefix Cache for Early Rejection ─────────────────────────────────
// Cache prefixes that are definitely not Tailwind utilities to skip checkAllBuilders
// This prevents wasting cycles on typos, library classes, or non-Tailwind classes

const UNKNOWN_PREFIX_CACHE = new Set();
const MAX_UNKNOWN_CACHE_SIZE = 500; // Prevent unbounded growth

/**
 * Fallback: check all builders (for utilities not in router or edge cases)
 * Optimized: Early rejection for known-invalid prefixes
 */
function checkAllBuilders(baseToken, theme) {
  // Early rejection: if we've seen this prefix fail before, skip immediately
  const prefix = extractPrefix(baseToken);
  if (UNKNOWN_PREFIX_CACHE.has(prefix)) {
    return undefined;
  }
  
  const result = (
    buildLayoutDeclaration(baseToken, theme) ||
    buildPositionInsetDeclaration(baseToken, theme) ||
    buildSpacingDeclaration(baseToken, theme) ||
    buildSpaceBetweenDeclaration(baseToken, theme) ||
    buildGapDeclaration(baseToken, theme) ||
    buildDimensionDeclaration(baseToken, theme) ||
    buildFlexGridDeclaration(baseToken, theme) ||
    buildBorderDeclaration(baseToken, theme) ||
    buildBorderRadiusDeclaration(baseToken, theme) ||
    buildBorderSpacingDeclaration(baseToken, theme) ||
    buildDivideDeclaration(baseToken, theme) ||
    buildOpacityDeclaration(baseToken, theme) ||
    buildShadowDeclaration(baseToken, theme) ||
    buildInsetShadowDeclaration(baseToken, theme) ||
    buildInsetRingDeclaration(baseToken, theme) ||
    buildRingDeclaration(baseToken, theme) ||
    buildRingOffsetDeclaration(baseToken, theme) ||
    buildTextShadowDeclaration(baseToken, theme) ||
    buildTransitionDeclaration(baseToken) ||
    buildTransformDeclaration(baseToken, theme) ||
    buildFilterDeclaration(baseToken, theme) ||
    buildBackgroundDeclaration(baseToken, theme) ||
    buildGradientDeclaration(baseToken, theme) ||
    buildColorDeclaration(baseToken, theme) ||
    buildTypographyDeclaration(baseToken, theme) ||
    buildBlendingDeclaration(baseToken) ||
    buildInteractivityDeclaration(baseToken, theme) ||
    buildAnimationDeclaration(baseToken) ||
    buildMaskDeclaration(baseToken) ||
    buildContainerQueryDeclaration(baseToken) ||
    buildScrollSnapDeclaration(baseToken) ||
    buildAccessibilityDeclaration(baseToken) ||
    buildZoomDeclaration(baseToken, theme) ||
    buildForcedColorDeclaration(baseToken) ||
    buildNamedVariantMarkerDeclaration(baseToken)
  );
  
  // If no builder matched, cache this prefix as unknown for future early rejection
  if (!result && prefix) {
    // Implement simple LRU-style eviction when cache grows too large
    if (UNKNOWN_PREFIX_CACHE.size >= MAX_UNKNOWN_CACHE_SIZE) {
      // Clear half the cache (oldest entries naturally fall off with Set iteration)
      const toRemove = Math.floor(MAX_UNKNOWN_CACHE_SIZE / 2);
      const iterator = UNKNOWN_PREFIX_CACHE.values();
      for (let i = 0; i < toRemove; i += 1) {
        const value = iterator.next().value;
        if (value) UNKNOWN_PREFIX_CACHE.delete(value);
      }
    }
    UNKNOWN_PREFIX_CACHE.add(prefix);
  }
  
  return result;
}

// ─── Master compile dispatcher (Synchronous - Backward Compatible) ────────────

/**
 * Synchronous compilation dispatcher
 * Maintained for backward compatibility
 * @param {string} baseToken - Base utility token
 * @param {object} theme - Theme configuration
 * @param {PluginRegistry} pluginRegistry - Plugin registry
 * @returns {string|undefined} - CSS declaration or undefined
 */
function compileBaseToken(baseToken, theme, pluginRegistry) {
  // Check custom utilities first (plugins have priority)
  if (pluginRegistry) {
    const pluginMatch = pluginRegistry.matchUtility(baseToken);
    if (pluginMatch) {
      const { handler, match } = pluginMatch;
      try {
        // Handler can be a function or string
        if (typeof handler === 'function') {
          const result = handler(match, theme);
          if (result) return result;
        } else if (typeof handler === 'string') {
          return handler;
        }
      } catch (error) {
        console.warn(`[Windrunner] Plugin utility handler error for "${baseToken}":`, error);
      }
    }
  }
  
  // Fast path: use prefix router to only check relevant builders
  const prefix = extractPrefix(baseToken);
  const builders = PREFIX_ROUTER[prefix];
  
  if (builders) {
    for (let i = 0; i < builders.length; i += 1) {
      const result = builders[i](baseToken, theme);
      if (result) return result;
    }
  }
  
  // Fallback: check all builders for edge cases or utilities not in router
  return checkAllBuilders(baseToken, theme);
}

// ─── Variant & selector logic ─────────────────────────────────────────────────

// ─── Variant Map for O(1) lookup ──────────────────────────────────────────────

/**
 * Built-in variants mapped to selector transform functions.
 * Using a Map for O(1) lookup instead of a switch statement.
 * @type {Map<string, (selector: string) => string>}
 */
const VARIANT_MAP = new Map([
  // Dark mode
  ["dark",            (s) => `.dark ${s}`],
  // Pseudo-classes – interactive
  ["hover",           (s) => `${s}:hover`],
  ["focus",           (s) => `${s}:focus`],
  ["focus-visible",   (s) => `${s}:focus-visible`],
  ["focus-within",    (s) => `${s}:focus-within`],
  ["active",          (s) => `${s}:active`],
  ["visited",         (s) => `${s}:visited`],
  ["disabled",        (s) => `${s}:disabled`],
  ["checked",         (s) => `${s}:checked`],
  ["indeterminate",   (s) => `${s}:indeterminate`],
  ["required",        (s) => `${s}:required`],
  ["valid",           (s) => `${s}:valid`],
  ["invalid",         (s) => `${s}:invalid`],
  ["target",          (s) => `${s}:target`],
  ["enabled",         (s) => `${s}:enabled`],
  ["default",         (s) => `${s}:default`],
  ["optional",        (s) => `${s}:optional`],
  ["user-valid",      (s) => `${s}:user-valid`],
  ["user-invalid",    (s) => `${s}:user-invalid`],
  ["in-range",        (s) => `${s}:in-range`],
  ["out-of-range",    (s) => `${s}:out-of-range`],
  ["placeholder-shown", (s) => `${s}:placeholder-shown`],
  ["autofill",        (s) => `${s}:autofill`],
  ["details-content", (s) => `${s}:details-content`],
  ["read-only",       (s) => `${s}:read-only`],
  ["open",            (s) => `${s}[open]`],
  // Pseudo-elements
  ["placeholder",     (s) => `${s}::placeholder`],
  ["backdrop",        (s) => `${s}::backdrop`],
  ["before",          (s) => `${s}::before`],
  ["after",           (s) => `${s}::after`],
  ["first-letter",    (s) => `${s}::first-letter`],
  ["first-line",      (s) => `${s}::first-line`],
  ["marker",          (s) => `${s}::marker`],
  ["selection",       (s) => `${s}::selection`],
  ["file",            (s) => `${s}::file-selector-button`],
  // Structural pseudo-classes
  ["first",           (s) => `${s}:first-child`],
  ["last",            (s) => `${s}:last-child`],
  ["odd",             (s) => `${s}:nth-child(odd)`],
  ["even",            (s) => `${s}:nth-child(even)`],
  ["first-of-type",   (s) => `${s}:first-of-type`],
  ["last-of-type",    (s) => `${s}:last-of-type`],
  ["only",            (s) => `${s}:only-child`],
  ["only-of-type",    (s) => `${s}:only-of-type`],
  ["empty",           (s) => `${s}:empty`],
  // Group & peer variants
  ["group-hover",     (s) => `.group:hover ${s}`],
  ["group-focus",     (s) => `.group:focus ${s}`],
  ["group-active",    (s) => `.group:active ${s}`],
  ["peer-hover",      (s) => `.peer:hover ~ ${s}`],
  ["peer-focus",      (s) => `.peer:focus ~ ${s}`],
  ["peer-checked",    (s) => `.peer:checked ~ ${s}`],
  ["peer-disabled",   (s) => `.peer:disabled ~ ${s}`],
  // Negation variants
  ["not-hover",       (s) => `${s}:not(:hover)`],
  ["not-focus",       (s) => `${s}:not(:focus)`],
  ["not-disabled",    (s) => `${s}:not(:disabled)`],
  ["not-checked",     (s) => `${s}:not(:checked)`],
  // In-* variants (group-based)
  ["in-hover",        (s) => `.group:hover ${s}`],
  ["in-focus",        (s) => `.group:focus ${s}`],
]);

/**
 * Apply named group or peer variant to a selector
 * Handles patterns like:
 * - group/sidebar → .group\/sidebar
 * - group-hover/sidebar → .group\/sidebar:hover .selector
 * - peer/toggle → .peer\/toggle
 * - peer-checked/toggle → .peer\/toggle:checked ~ .selector
 * 
 * @param {string} selector - Current CSS selector (e.g., ".bg-blue-500")
 * @param {{ type: 'group'|'peer', state: string|null, name: string }} namedVariant - Parsed named variant
 * @returns {string} - Transformed selector with named variant applied
 */
function applyNamedVariant(selector, { type, state, name }) {
  // Escape forward slash in name for valid CSS
  // The slash needs to be escaped as \/ in CSS selectors
  const escapedName = name.replace(/\//g, '\\/');
  
  if (type === 'group') {
    if (state) {
      // State-based group variant: group-hover/sidebar:bg-blue-500
      // Generates: .group\/sidebar:hover .group-hover\/sidebar\:bg-blue-500
      return `.group\\/${escapedName}:${state} ${selector}`;
    } else {
      // Marker class: group/sidebar
      // Generates: .group\/sidebar
      return `.group\\/${escapedName}`;
    }
  }
  
  if (type === 'peer') {
    if (state) {
      // State-based peer variant: peer-checked/toggle:bg-green-500
      // Generates: .peer\/toggle:checked ~ .peer-checked\/toggle\:bg-green-500
      return `.peer\\/${escapedName}:${state} ~ ${selector}`;
    } else {
      // Marker class: peer/toggle
      // Generates: .peer\/toggle
      return `.peer\\/${escapedName}`;
    }
  }
  
  return selector;
}

/**
 * Apply advanced state variant to selector
 * Handles has-*, group-has-*, peer-has-*, data-*, and aria-* variants
 * 
 * @param {string} selector - Base CSS selector
 * @param {object} parsed - Parsed advanced variant from parseAdvancedVariant()
 * @returns {string} - Modified selector with variant applied
 */
function applyAdvancedVariant(selector, parsed) {
  const { type, content, attribute, value } = parsed;
  
  switch (type) {
    case 'has':
      // has-[:checked] → selector:has(:checked)
      return `${selector}:has(${content})`;
      
    case 'group-has':
      // group-has-[:checked] → .group:has(:checked) selector
      return `.group:has(${content}) ${selector}`;
      
    case 'peer-has':
      // peer-has-[:checked] → .peer:has(:checked) ~ selector
      return `.peer:has(${content}) ~ ${selector}`;
      
    case 'data':
      if (value) {
        // data-[state=open] → selector[data-state="open"]
        return `${selector}[data-${attribute}="${value}"]`;
      } else {
        // data-[loading] → selector[data-loading]
        return `${selector}[data-${attribute}]`;
      }
      
    case 'aria':
      if (value) {
        // aria-[expanded=true] → selector[aria-expanded="true"]
        return `${selector}[aria-${attribute}="${value}"]`;
      } else {
        // aria-[hidden] → selector[aria-hidden]
        return `${selector}[aria-${attribute}]`;
      }
      
    default:
      return selector;
  }
}

function applyVariants(selector, variants, pluginRegistry) {
  let currentSelector = selector;
  const wrappers = []; // Collect at-rule wrappers (media, container, supports)

  for (const variant of variants) {
    // Check for arbitrary variants first (to handle [@media...], [&...], etc.)
    const arbitraryVariant = parseArbitraryVariant(variant);
    if (arbitraryVariant) {
      const result = applyArbitraryVariant(currentSelector, arbitraryVariant);
      
      // Check if result is a wrapper object
      if (result && typeof result === 'object' && result.__type) {
        // Store wrapper for later application
        wrappers.push(result);
        // Keep the original selector for further variant application
        // The wrapper will be applied around the final CSS rule
      } else {
        // It's a transformed selector (e.g., & replacement)
        currentSelector = result;
      }
      continue;
    }
  
    // Check for advanced variants (has-*, data-*, aria-*)
    const advancedVariant = parseAdvancedVariant(variant);
    if (advancedVariant) {
      currentSelector = applyAdvancedVariant(currentSelector, advancedVariant);
      continue;
    }

    // Check for named group/peer variant
    const namedVariant = parseNamedVariant(variant);
    if (namedVariant) {
      currentSelector = applyNamedVariant(currentSelector, namedVariant);
      continue;
    }

    // Check custom variants (plugins have priority)
    if (pluginRegistry) {
      const customHandler = pluginRegistry.matchVariant(variant);
      if (customHandler) {
        try {
          const result = customHandler(currentSelector);
          if (result) {
            currentSelector = result;
            continue;
          }
        } catch (error) {
          console.warn(`[Windrunner] Plugin variant handler error for "${variant}":`, error);
        }
      }
    }

    // Built-in variant lookup (O(1) via Map)
    const builtinHandler = VARIANT_MAP.get(variant);
    if (builtinHandler) {
      currentSelector = builtinHandler(currentSelector);
    } else {
      return undefined;
    }
  }

  // If there are wrappers, return an object with both the selector and wrappers
  // The compiler will apply these wrappers around the final CSS rule
  if (wrappers.length > 0) {
    return {
      selector: currentSelector,
      wrappers
    };
  }

  return currentSelector;
}


// ─── Runtime context ──────────────────────────────────────────────────────────

export function resolveRuntimeContext(options = {}) {
  const config = getConfigOptions(options, []);
  const pluginRegistry = new PluginRegistry();
  
  // Load plugins from options
  if (options.plugins && Array.isArray(options.plugins)) {
    options.plugins.forEach(pluginDef => {
      if (isPlugin(pluginDef)) {
        try {
          pluginDef.handler({
            addUtility: (pattern, handler) => pluginRegistry.addUtility(pattern, handler),
            addUtilities: (utilities) => pluginRegistry.addUtilities(utilities),
            addVariant: (name, handler) => pluginRegistry.addVariant(name, handler),
            addVariants: (variants) => pluginRegistry.addVariants(variants),
            theme: (key) => {
              if (!key) return config.theme || {};
              const keys = key.split('.');
              let value = config.theme || {};
              for (const k of keys) {
                value = value[k];
                if (value === undefined) break;
              }
              return value;
            },
            config: () => config,
          });
        } catch (error) {
          console.error('[Windrunner] Plugin initialization error:', error);
        }
      }
    });
  }
  
  return {
    config,
    theme: config.theme || {},
    screens: (config.theme && config.theme.screens) || config.screens || {},
    containers: (config.theme && config.theme.containers) || config.containers || {},
    plugins: pluginRegistry,
  };
}

export function getBaseTailwindOptions(options = {}) {
  const { id, autoStart, compatMode, compatStyleId, compatGenerateCss, ...tailwindOptions } = options;
  return tailwindOptions;
}

// ─── Parse Cache for Performance ──────────────────────────────────────────────

/**
 * Cache for parsed class structures to avoid re-parsing the same class names.
 * Key: className + screens/containers hash
 * Value: parsed class object
 */
const parseCache = new Map();
const PARSE_CACHE_MAX_SIZE = 2000; // Limit cache size to prevent memory bloat

/**
 * Generate a simple cache key from screens and containers config.
 * Most apps use a single config, so this will be the same for all classes.
 */
function getConfigHash(screens, containers) {
  // For performance, we assume most calls use the same config
  // Just check if both are empty objects (common case)
  const screensEmpty = !screens || Object.keys(screens).length === 0;
  const containersEmpty = !containers || Object.keys(containers).length === 0;
  
  if (screensEmpty && containersEmpty) return "default";
  
  // For non-empty configs, create a simple hash
  return `${Object.keys(screens || {}).join(",")}|${Object.keys(containers || {}).join(",")}`;
}

// ─── Class parser ─────────────────────────────────────────────────────────────

/**
 * Parse a runtime class token into its variants, breakpoint, and base utility.
 * Supports responsive prefixes (md:, lg:), container breakpoints (@sm:, @md:),
 * starting: variant, and the ! important prefix.
 *
 * @param {string} className
 * @param {Record<string, string>} screens
 * @param {Record<string, string>} containers
 * @returns {{ original: string, baseToken: string, variants: string[], breakpoint: string|null, containerBreakpoint: string|null, important: boolean, starting: boolean } | null}
 */
export function parseClass(className, screens = {}, containers = {}) {
  if (typeof className !== "string") return null;
  const token = className.trim();
  if (!token) return null;

  // Check cache first
  const configHash = getConfigHash(screens, containers);
  const cacheKey = `${token}:${configHash}`;
  
  if (parseCache.has(cacheKey)) {
    return parseCache.get(cacheKey);
  }

  // Parse the class
  let important = token.startsWith("!");
  const normalized = important ? token.slice(1) : token;
  const parts = splitByVariantDelimiter(normalized);
  if (parts.length === 0) return null;

  let baseToken = parts[parts.length - 1];
  
  // Also check if the base token (after variants) starts with !
  // This handles patterns like "hover:!bg-blue-500" and "data-[state=open]:!block"
  if (!important && baseToken.startsWith("!")) {
    important = true;
    baseToken = baseToken.slice(1);
  }
  
  const variants = [];
  let breakpoint = null;
  let containerBreakpoint = null;
  let starting = false;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];

    if (part === "starting") { starting = true; continue; }

    if (part.startsWith("@")) {
      const cKey = part.slice(1);
      if (!containerBreakpoint && containers[cKey]) { containerBreakpoint = cKey; continue; }
    }

    if (!breakpoint && screens[part]) { breakpoint = part; continue; }

    variants.push(part);
  }

  const result = { original: token, baseToken, variants, breakpoint, containerBreakpoint, important, starting };
  
  // Store in cache with size limit
  if (parseCache.size >= PARSE_CACHE_MAX_SIZE) {
    // Remove oldest entry (first item in Map)
    const firstKey = parseCache.keys().next().value;
    parseCache.delete(firstKey);
  }
  parseCache.set(cacheKey, result);
  
  return result;
}

// ─── Core compile function ────────────────────────────────────────────────────

export function compileRuntimeClassNameWithContext(className, context) {
  const parsed = parseClass(className, context.screens, context.containers);
  if (!parsed) return "";

  const declaration = compileBaseToken(parsed.baseToken, context.theme, context.plugins);
  // Allow empty string declarations (for marker classes like group/sidebar)
  // but reject undefined (unknown utilities)
  if (declaration === undefined) return "";

  const selector = `.${escapeCssIdentifier(parsed.original)}`;
  const variantResult = applyVariants(selector, parsed.variants, context.plugins);
  if (!variantResult) return "";

  // Handle wrapper objects from arbitrary variants
  let finalSelector;
  let wrappers = [];
  
  if (variantResult && typeof variantResult === 'object' && variantResult.selector) {
    // variantResult is an object with selector and wrappers
    finalSelector = variantResult.selector;
    wrappers = variantResult.wrappers || [];
  } else {
    // variantResult is a plain selector string
    finalSelector = variantResult;
  }

  const finalDeclaration = appendImportant(
    isChildScoped(declaration) ? declaration.declaration : declaration,
    parsed.important,
  );
  const scopedSelector = isChildScoped(declaration)
    ? `${finalSelector} > :not(:first-child)`
    : finalSelector;
  let ruleBody = `${scopedSelector} { ${finalDeclaration} }`;

  // Apply arbitrary variant wrappers (media, container, supports)
  // Wrappers are applied in reverse order so that the first (leftmost) variant
  // in the class name becomes the outermost wrapper in the CSS output.
  // E.g., [@media(hover:hover)]:[@supports(display:grid)]:grid
  //   → @media (hover:hover) { @supports (display:grid) { .sel { ... } } }
  for (let i = wrappers.length - 1; i >= 0; i--) {
    const wrapper = wrappers[i];
    switch (wrapper.__type) {
      case 'media-wrapper':
        ruleBody = `@media ${wrapper.query} { ${ruleBody} }`;
        break;
      case 'container-wrapper':
        ruleBody = `@container ${wrapper.query} { ${ruleBody} }`;
        break;
      case 'supports-wrapper':
        ruleBody = `@supports ${wrapper.query} { ${ruleBody} }`;
        break;
    }
  }

  // Apply built-in responsive/container breakpoints
  // These wrap around everything including arbitrary wrappers
  let result = ruleBody;
  if (parsed.breakpoint) {
    result = `@media (min-width: ${context.screens[parsed.breakpoint]}) { ${ruleBody} }`;
  } else if (parsed.containerBreakpoint) {
    result = `@container (min-width: ${context.containers[parsed.containerBreakpoint]}) { ${ruleBody} }`;
  }

  if (parsed.starting) {
    return `@starting-style { ${result} }`;
  }

  return result;
}

// ─── Public compileClass API (Node.js + browser) ──────────────────────────────

/**
 * Compile a single class name to a CSS rule string.
 * Works in Node.js too (no DOM dependency).
 *
 * @param {string} className
 * @param {object} options
 * @returns {string}
 */
export function compileClass(className, options = {}) {
  return compileRuntimeClassNameWithContext(className, resolveRuntimeContext(options));
}

// ─── SSR / Critical CSS Utility ───────────────────────────────────────────────

/**
 * Compile multiple class names into a single CSS string for SSR / critical CSS.
 * This is useful for generating CSS at build time or in server-side rendering.
 *
 * @param {string | string[]} classNames - Single class string or array of class names
 * @param {object} options - Windrunner configuration options
 * @returns {string} - Combined CSS rules ready for injection into <style> tag
 *
 * @example
 * // Server-side rendering
 * import { compileCriticalCss } from 'windrunner';
 * 
 * const criticalCss = compileCriticalCss([
 *   'flex items-center justify-between',
 *   'text-xl font-bold text-slate-900',
 *   'bg-white shadow-lg rounded-xl p-6'
 * ]);
 * 
 * // Inject into HTML
 * const html = `
 *   <style>${criticalCss}</style>
 *   <div class="flex items-center justify-between">...</div>
 * `;
 *
 * @example
 * // Static site generation
 * const allClasses = extractClassesFromTemplates('./src');
 * const criticalCss = compileCriticalCss(allClasses, {
 *   theme: { colors: { brand: '#ff0000' } }
 * });
 * fs.writeFileSync('dist/critical.css', criticalCss);
 */
export function compileCriticalCss(classNames, options = {}) {
  // Normalize input to array
  const classList = typeof classNames === 'string'
    ? classNames.split(/\s+/).filter(Boolean)
    : Array.isArray(classNames)
      ? classNames.flatMap(item => {
          if (typeof item === 'string') {
            return item.split(/\s+/).filter(Boolean);
          } else if (Array.isArray(item)) {
            // Handle nested arrays by flattening
            return item.flatMap(str => 
              typeof str === 'string' ? str.split(/\s+/).filter(Boolean) : []
            );
          }
          return [];
        })
      : [];

  // Create compilation context once
  const context = resolveRuntimeContext(options);

  // Compile all classes and deduplicate
  const cssRules = new Set();
  
  classList.forEach((className) => {
    const css = compileRuntimeClassNameWithContext(className, context);
    if (css) {
      cssRules.add(css);
    }
  });

  // Combine all rules with newlines for readability
  return Array.from(cssRules).join('\n');
}

/**
 * Extract unique class names from HTML string.
 * Utility helper for compileCriticalCss.
 *
 * @param {string} html - HTML content to extract classes from
 * @returns {string[]} - Array of unique class names
 *
 * @example
 * import { extractClassNames, compileCriticalCss } from 'windrunner';
 * 
 * const html = await fs.readFile('dist/index.html', 'utf-8');
 * const classes = extractClassNames(html);
 * const css = compileCriticalCss(classes);
 */
/**
 * Extract class names from HTML content
 * Supports: class="...", className="...", classList.add/remove/toggle, setAttribute
 * Enhanced parsing with better handling of edge cases
 * @param {string} html - HTML content to extract classes from
 * @returns {string[]} - Array of unique class names
 */
export function extractClassNames(html) {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const classSet = new Set();
  
  // Pattern 1: class="..." or className="..." attributes (double and single quotes)
  // Handles: class="...", class='...', className="...", className='...'
  const classAttrPattern = /class(?:Name)?=["']([^"']+)["']/gi;
  let match;
  
  while ((match = classAttrPattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 2: classList.add/remove/toggle with quoted arguments
  // Matches: classList.add('class1', 'class2') or classList.add("class1", "class2")
  const classListPattern = /classList\.(?:add|remove|toggle|contains|replace)\(\s*([^)]+)\s*\)/gi;
  
  while ((match = classListPattern.exec(html)) !== null) {
    const args = match[1];
    // Extract all quoted strings from the arguments
    const quotedStringPattern = /["']([^"']+)["']/g;
    let quotedMatch;
    
    while ((quotedMatch = quotedStringPattern.exec(args)) !== null) {
      const classList = quotedMatch[1].trim();
      if (classList) {
        classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
      }
    }
  }
  
  // Pattern 3: setAttribute("class", "...") or setAttribute('class', '...')
  const setAttributePattern = /setAttribute\(\s*["']class(?:Name)?["']\s*,\s*["']([^"']+)["']\s*\)/gi;
  
  while ((match = setAttributePattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 4: JSX className with template literals (partial support for static parts)
  // Matches: className={`static-class ${variable}`}
  const templateLiteralPattern = /className\s*=\s*\{`([^`]*)`\}/gi;
  
  while ((match = templateLiteralPattern.exec(html)) !== null) {
    const template = match[1];
    // Extract static parts (before ${})
    const staticParts = template.split(/\$\{[^}]*\}/);
    staticParts.forEach(part => {
      const classList = part.trim();
      if (classList) {
        classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
      }
    });
  }
  
  // Pattern 5: JSX className with string literals in braces
  // Matches: className={'class-name'} or className={"class-name"}
  const jsxBracesPattern = /className\s*=\s*\{\s*["']([^"']+)["']\s*\}/gi;
  
  while ((match = jsxBracesPattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 6: clsx() or classnames() or cn() utility calls
  // Matches: clsx('class1', 'class2'), classnames('class1'), cn('class1')
  const clsxPattern = /(?:clsx|classnames|cn|classNames)\(\s*["']([^"']+)["']/gi;
  
  while ((match = clsxPattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 7: Vue :class bindings
  // Matches: :class="...", v-bind:class="..."
  const vueClassPattern = /(?::class|v-bind:class)=["']([^"']+)["']/gi;
  
  while ((match = vueClassPattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }

  return Array.from(classSet);
}

/**
 * Compile critical CSS from HTML content
 * Extracts all class names from the HTML and compiles them to CSS
 * Supports arbitrary values, variants, breakpoints, and opacity modifiers
 * 
 * @param {string} html - HTML content containing class attributes
 * @param {Object} options - Compilation options (theme, screens, containers, etc.)
 * @returns {string} - Compiled CSS rules ready for injection
 * 
 * @example
 * const html = '<div class="flex items-center md:gap-4 bg-blue-500/50">Content</div>';
 * const css = compileCriticalCssFromHtml(html, {
 *   screens: { md: '768px' },
 *   theme: { colors: { blue: { 500: '#3b82f6' } } }
 * });
 * // Returns: ".flex { display: flex; } .items-center { align-items: center; } ..."
 */
export function compileCriticalCssFromHtml(html, options = {}) {
  const classNames = extractClassNames(html);
  return compileCriticalCss(classNames, options);
}

/**
 * Compile critical CSS from HTML files (Node.js only)
 * Reads HTML files from the filesystem, extracts class names, and compiles them to CSS
 * Supports arbitrary values, variants, breakpoints, and opacity modifiers
 * 
 * @param {string|string[]} filePaths - Single file path or array of file paths to read
 * @param {Object} options - Compilation options (theme, screens, containers, etc.)
 * @returns {Promise<string>} - Compiled CSS rules ready for injection
 * @throws {Error} - If called in non-Node.js environment or if file reading fails
 * 
 * @example
 * // Single file
 * const css = await compileCriticalCssFromFiles('./index.html');
 * 
 * // Multiple files with custom theme
 * const css = await compileCriticalCssFromFiles(
 *   ['./index.html', './about.html'],
 *   { theme: { colors: { brand: '#ff6b6b' } } }
 * );
 */
export async function compileCriticalCssFromFiles(filePaths, options = {}) {
  // Normalize to array
  const sources = Array.isArray(filePaths) ? filePaths : [filePaths];
  
  // Validate inputs
  if (sources.length === 0) {
    return '';
  }
  
  if (sources.some(path => !path || typeof path !== 'string')) {
    throw new Error("compileCriticalCssFromFiles() requires valid file path(s).");
  }
  
  // Dynamic import of Node.js fs module
  let fs;
  try {
    fs = await import("fs/promises");
  } catch (error) {
    throw new Error(
      "compileCriticalCssFromFiles() is only supported in Node.js environments. " +
      "Use compileCriticalCssFromHtml() in browser environments."
    );
  }

  // Read all files concurrently
  try {
    const contents = await Promise.all(
      sources.map(async (filePath) => {
        try {
          return await fs.readFile(filePath, "utf8");
        } catch (error) {
          throw new Error(`Failed to read file: ${filePath} - ${error.message}`);
        }
      })
    );

    // Combine all HTML content and extract classes
    const combinedHtml = contents.join("\n");
    const classNames = extractClassNames(combinedHtml);
    
    // Compile to CSS
    return compileCriticalCss(classNames, options);
  } catch (error) {
    if (error.message.startsWith("Failed to read file:")) {
      throw error;
    }
    throw new Error(`compileCriticalCssFromFiles() failed: ${error.message}`);
  }
}

// ─── Export Lazy Loading API ──────────────────────────────────────────────────

/**
 * Export lazy compilation function for environments that support dynamic imports
 * This is the async compilation path that loads builders on demand
 */
export { compileBaseTokenLazy, loadBuilder, PREFIX_TO_CATEGORY, LAZY_BUILDER_MAP };
