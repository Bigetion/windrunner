import { getConfigOptions } from "./utils.js";
import { splitByVariantDelimiter, escapeCssIdentifier, appendImportant } from "./resolvers.js";
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
} from "./builders/misc.js";
import { buildBlendingDeclaration } from "./builders/blending.js";
import { buildSpaceBetweenDeclaration, buildDivideDeclaration, isChildScoped } from "./builders/space-divide.js";
import { PluginRegistry, isPlugin } from "./plugins.js";

// ─── Prefix-based Router for Performance ──────────────────────────────────────

/**
 * Router map: prefix → array of relevant builder functions
 * This allows us to only check relevant builders instead of all 30+ functions
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
    buildForcedColorDeclaration(baseToken)
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

// ─── Master compile dispatcher ────────────────────────────────────────────────

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

function applyVariants(selector, variants, pluginRegistry) {
  let currentSelector = selector;

  for (const variant of variants) {
    // Check custom variants first (plugins have priority)
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
  const important = token.startsWith("!");
  const normalized = important ? token.slice(1) : token;
  const parts = splitByVariantDelimiter(normalized);
  if (parts.length === 0) return null;

  const baseToken = parts[parts.length - 1];
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
  if (!declaration) return "";

  const selector = `.${escapeCssIdentifier(parsed.original)}`;
  const variantSelector = applyVariants(selector, parsed.variants, context.plugins);
  if (!variantSelector) return "";

  const finalDeclaration = appendImportant(
    isChildScoped(declaration) ? declaration.declaration : declaration,
    parsed.important,
  );
  const scopedSelector = isChildScoped(declaration)
    ? `${variantSelector} > :not(:first-child)`
    : variantSelector;
  const ruleBody = `${scopedSelector} { ${finalDeclaration} }`;

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
      ? classNames.flatMap(str => 
          typeof str === 'string' ? str.split(/\s+/).filter(Boolean) : []
        )
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
export function extractClassNames(html) {
  const classSet = new Set();
  
  // Match class="..." and className="..." attributes
  const classRegex = /class(?:Name)?=["']([^"']+)["']/g;
  let match;
  
  while ((match = classRegex.exec(html)) !== null) {
    const classes = match[1].split(/\s+/).filter(Boolean);
    classes.forEach(cls => classSet.add(cls));
  }
  
  return Array.from(classSet);
}
