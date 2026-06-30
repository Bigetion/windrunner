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

/**
 * Fallback: check all builders (for utilities not in router or edge cases)
 */
function checkAllBuilders(baseToken, theme) {
  return (
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
    
    // Built-in variants
    switch (variant) {
      case "dark":          currentSelector = `.dark ${currentSelector}`; break;
      case "hover":         currentSelector = `${currentSelector}:hover`; break;
      case "focus":         currentSelector = `${currentSelector}:focus`; break;
      case "focus-visible": currentSelector = `${currentSelector}:focus-visible`; break;
      case "focus-within":  currentSelector = `${currentSelector}:focus-within`; break;
      case "active":        currentSelector = `${currentSelector}:active`; break;
      case "visited":       currentSelector = `${currentSelector}:visited`; break;
      case "disabled":      currentSelector = `${currentSelector}:disabled`; break;
      case "checked":       currentSelector = `${currentSelector}:checked`; break;
      case "indeterminate": currentSelector = `${currentSelector}:indeterminate`; break;
      case "required":      currentSelector = `${currentSelector}:required`; break;
      case "valid":         currentSelector = `${currentSelector}:valid`; break;
      case "invalid":       currentSelector = `${currentSelector}:invalid`; break;
      case "target":        currentSelector = `${currentSelector}:target`; break;
      case "enabled":       currentSelector = `${currentSelector}:enabled`; break;
      case "default":       currentSelector = `${currentSelector}:default`; break;
      case "optional":      currentSelector = `${currentSelector}:optional`; break;
      case "user-valid":    currentSelector = `${currentSelector}:user-valid`; break;
      case "user-invalid":  currentSelector = `${currentSelector}:user-invalid`; break;
      case "in-range":      currentSelector = `${currentSelector}:in-range`; break;
      case "out-of-range":  currentSelector = `${currentSelector}:out-of-range`; break;
      case "placeholder-shown": currentSelector = `${currentSelector}:placeholder-shown`; break;
      case "autofill":      currentSelector = `${currentSelector}:autofill`; break;
      case "details-content": currentSelector = `${currentSelector}:details-content`; break;
      case "placeholder":   currentSelector = `${currentSelector}::placeholder`; break;
      case "backdrop":      currentSelector = `${currentSelector}::backdrop`; break;
      case "before":        currentSelector = `${currentSelector}::before`; break;
      case "after":         currentSelector = `${currentSelector}::after`; break;
      case "first-letter":  currentSelector = `${currentSelector}::first-letter`; break;
      case "first-line":    currentSelector = `${currentSelector}::first-line`; break;
      case "marker":        currentSelector = `${currentSelector}::marker`; break;
      case "selection":     currentSelector = `${currentSelector}::selection`; break;
      case "file":          currentSelector = `${currentSelector}::file-selector-button`; break;
      case "first":         currentSelector = `${currentSelector}:first-child`; break;
      case "last":          currentSelector = `${currentSelector}:last-child`; break;
      case "odd":           currentSelector = `${currentSelector}:nth-child(odd)`; break;
      case "even":          currentSelector = `${currentSelector}:nth-child(even)`; break;
      case "first-of-type": currentSelector = `${currentSelector}:first-of-type`; break;
      case "last-of-type":  currentSelector = `${currentSelector}:last-of-type`; break;
      case "only":          currentSelector = `${currentSelector}:only-child`; break;
      case "only-of-type":  currentSelector = `${currentSelector}:only-of-type`; break;
      case "empty":         currentSelector = `${currentSelector}:empty`; break;
      case "read-only":     currentSelector = `${currentSelector}:read-only`; break;
      case "open":          currentSelector = `${currentSelector}[open]`; break;
      case "group-hover":   currentSelector = `.group:hover ${currentSelector}`; break;
      case "group-focus":   currentSelector = `.group:focus ${currentSelector}`; break;
      case "group-active":  currentSelector = `.group:active ${currentSelector}`; break;
      case "peer-hover":    currentSelector = `.peer:hover ~ ${currentSelector}`; break;
      case "peer-focus":    currentSelector = `.peer:focus ~ ${currentSelector}`; break;
      case "peer-checked":  currentSelector = `.peer:checked ~ ${currentSelector}`; break;
      case "peer-disabled": currentSelector = `.peer:disabled ~ ${currentSelector}`; break;
      case "not-hover":     currentSelector = `${currentSelector}:not(:hover)`; break;
      case "not-focus":     currentSelector = `${currentSelector}:not(:focus)`; break;
      case "not-disabled":  currentSelector = `${currentSelector}:not(:disabled)`; break;
      case "not-checked":   currentSelector = `${currentSelector}:not(:checked)`; break;
      case "in-hover":      currentSelector = `.group:hover ${currentSelector}`; break;
      case "in-focus":      currentSelector = `.group:focus ${currentSelector}`; break;
      default:
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
