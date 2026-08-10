import { getConfigOptions } from "./utils.js";
import { splitByVariantDelimiter, escapeCssIdentifier, appendImportant } from "./resolvers.js";
import { PluginRegistry, isPlugin } from "./plugins.js";

// Import only CORE builders for lite build (tree-shakeable)
import { buildLayoutDeclaration, buildPositionInsetDeclaration } from "./builders/core/layout.js";
import { buildSpacingDeclaration, buildGapDeclaration, buildDimensionDeclaration } from "./builders/core/spacing.js";
import { buildFlexGridDeclaration } from "./builders/core/flexgrid.js";
import { buildTypographyDeclaration } from "./builders/core/typography.js";
import { buildColorDeclaration } from "./builders/core/colors.js";
import { buildBorderDeclaration, buildBorderRadiusDeclaration } from "./builders/core/borders.js";
import {
  buildOpacityDeclaration,
  buildShadowDeclaration,
  buildInsetShadowDeclaration,
  buildInsetRingDeclaration,
  buildRingDeclaration,
} from "./builders/core/effects-basic.js";

// Import space-divide from parent builders folder (used in core spacing utilities)
import { buildSpaceBetweenDeclaration, buildDivideDeclaration, isChildScoped } from "./builders/space-divide.js";

// ─── Lite Builder Registry ────────────────────────────────────────────────────

/**
 * Lite prefix router: Maps utility prefixes to core builder functions only
 * Significantly smaller than the full PREFIX_ROUTER
 * Excludes: transforms, filters, transitions, animations, advanced effects, blending, misc
 */
const LITE_PREFIX_ROUTER = {
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
  
  // Colors (full palette included in lite)
  "bg": [buildColorDeclaration],
  "fill": [buildColorDeclaration],
  "stroke": [buildColorDeclaration],
  
  // Borders
  "border": [buildBorderDeclaration, buildColorDeclaration],
  "rounded": [buildBorderRadiusDeclaration],
  "divide": [buildDivideDeclaration],
  
  // Basic Effects (shadow, opacity, ring only - no advanced filters/transforms)
  "shadow": [buildShadowDeclaration],
  "opacity": [buildOpacityDeclaration],
  "ring": [buildRingDeclaration],
  
  // Flexbox & Grid
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
  
  // Core layout utilities
  "overflow": [buildLayoutDeclaration],
  "isolation": [buildLayoutDeclaration],
  "object": [buildLayoutDeclaration],
  "columns": [buildLayoutDeclaration],
  "aspect": [buildLayoutDeclaration],
  "clear": [buildLayoutDeclaration],
  "float": [buildLayoutDeclaration],
  "box": [buildLayoutDeclaration],
  "visible": [buildLayoutDeclaration],
  "invisible": [buildLayoutDeclaration],
  "collapse": [buildLayoutDeclaration],
};

/**
 * Extract the prefix from a utility class token
 * @param {string} token - Utility token (e.g., "bg-blue-500", "text-xl", "mt-4")
 * @returns {string} - Extracted prefix
 */
function extractPrefix(token) {
  const dashIndex = token.indexOf("-");
  if (dashIndex === -1) return token;
  
  const prefix = token.slice(0, dashIndex);
  
  // Check for two-part prefixes (min-w, max-h, etc.)
  const secondDashIndex = token.indexOf("-", dashIndex + 1);
  if (secondDashIndex !== -1) {
    const twoPartPrefix = token.slice(0, secondDashIndex);
    if (LITE_PREFIX_ROUTER[twoPartPrefix]) return twoPartPrefix;
  }
  
  return prefix;
}

/**
 * Check core builders for lite build (fallback when prefix not in router)
 * Only includes core utilities, excludes extended features
 * @param {string} baseToken - Base utility token
 * @param {object} theme - Theme configuration
 * @returns {string|undefined} - CSS declaration or undefined
 */
function checkCoreBuilders(baseToken, theme) {
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
    buildDivideDeclaration(baseToken, theme) ||
    buildOpacityDeclaration(baseToken, theme) ||
    buildShadowDeclaration(baseToken, theme) ||
    buildInsetShadowDeclaration(baseToken, theme) ||
    buildInsetRingDeclaration(baseToken, theme) ||
    buildRingDeclaration(baseToken, theme) ||
    buildColorDeclaration(baseToken, theme) ||
    buildTypographyDeclaration(baseToken, theme)
  );
}

/**
 * Check if a utility is excluded from lite mode
 * @param {string} baseToken - Base utility token
 * @returns {{ excluded: boolean, category?: string }} - Exclusion info
 */
function checkLiteExclusion(baseToken) {
  // Transforms
  if (/^(rotate|scale|translate|skew|origin|perspective|transform)/.test(baseToken)) {
    return { excluded: true, category: 'transforms' };
  }
  
  // Filters
  if (/^(blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia|drop-shadow|backdrop-)/.test(baseToken)) {
    return { excluded: true, category: 'filters' };
  }
  
  // Transitions
  if (/^(transition|duration|delay|ease)/.test(baseToken)) {
    return { excluded: true, category: 'transitions' };
  }
  
  // Animations
  if (/^(animate-)/.test(baseToken)) {
    return { excluded: true, category: 'animations' };
  }
  
  return { excluded: false };
}

/**
 * Compile base token with lite builder registry
 * Returns undefined for utilities not available in lite mode
 * @param {string} baseToken - Base utility token
 * @param {object} theme - Theme configuration
 * @param {PluginRegistry} pluginRegistry - Plugin registry
 * @param {object} context - Optional context with __LITE_MODE__ flag
 * @returns {string|undefined|object} - CSS declaration, undefined, or error context
 */
function compileBaseTokenLite(baseToken, theme, pluginRegistry, context) {
  // Check for excluded utilities first
  const exclusionCheck = checkLiteExclusion(baseToken);
  if (exclusionCheck.excluded) {
    // Return error context if __LITE_MODE__ flag is set
    if (context && context.__LITE_MODE__) {
      return {
        __error: true,
        reason: 'lite-mode-excluded',
        category: exclusionCheck.category,
        baseToken,
      };
    }
    return undefined;
  }
  
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
        console.warn(`[Windrunner Lite] Plugin utility handler error for "${baseToken}":`, error);
      }
    }
  }
  
  // Fast path: use lite prefix router
  const prefix = extractPrefix(baseToken);
  const builders = LITE_PREFIX_ROUTER[prefix];
  
  if (builders) {
    for (let i = 0; i < builders.length; i += 1) {
      const result = builders[i](baseToken, theme);
      if (result) return result;
    }
  }
  
  // Fallback: check core builders for edge cases
  return checkCoreBuilders(baseToken, theme);
}

// ─── Lite Variant Map ─────────────────────────────────────────────────────────

/**
 * Lite variant map: Only basic variants included
 * Excludes: group-*, peer-*, has-*, data-*, aria-*, arbitrary variants, named groups
 * @type {Map<string, (selector: string) => string>}
 */
const LITE_VARIANT_MAP = new Map([
  // Dark mode
  ["dark", (s) => `.dark ${s}`],
  
  // Basic pseudo-classes (interactive)
  ["hover", (s) => `${s}:hover`],
  ["focus", (s) => `${s}:focus`],
  ["focus-visible", (s) => `${s}:focus-visible`],
  ["focus-within", (s) => `${s}:focus-within`],
  ["active", (s) => `${s}:active`],
  ["disabled", (s) => `${s}:disabled`],
  ["visited", (s) => `${s}:visited`],
  ["checked", (s) => `${s}:checked`],
  ["enabled", (s) => `${s}:enabled`],
  ["required", (s) => `${s}:required`],
  ["valid", (s) => `${s}:valid`],
  ["invalid", (s) => `${s}:invalid`],
  
  // Basic pseudo-elements
  ["placeholder", (s) => `${s}::placeholder`],
  ["before", (s) => `${s}::before`],
  ["after", (s) => `${s}::after`],
  ["first-letter", (s) => `${s}::first-letter`],
  ["first-line", (s) => `${s}::first-line`],
  ["marker", (s) => `${s}::marker`],
  ["selection", (s) => `${s}::selection`],
  
  // Structural pseudo-classes
  ["first", (s) => `${s}:first-child`],
  ["last", (s) => `${s}:last-child`],
  ["odd", (s) => `${s}:nth-child(odd)`],
  ["even", (s) => `${s}:nth-child(even)`],
  ["first-of-type", (s) => `${s}:first-of-type`],
  ["last-of-type", (s) => `${s}:last-of-type`],
  ["only", (s) => `${s}:only-child`],
  ["only-of-type", (s) => `${s}:only-of-type`],
  ["empty", (s) => `${s}:empty`],
]);

/**
 * Check if a variant is excluded from lite mode (advanced variants)
 * @param {string} variant - Variant name
 * @returns {{ excluded: boolean, category?: string }} - Exclusion info
 */
function checkLiteVariantExclusion(variant) {
  // Group variants (group-*, group/name patterns)
  if (/^group(-|\/|$)/.test(variant)) {
    return { excluded: true, category: 'advanced-variants' };
  }
  
  // Peer variants (peer-*, peer/name patterns)
  if (/^peer(-|\/|$)/.test(variant)) {
    return { excluded: true, category: 'advanced-variants' };
  }
  
  // has-* pseudo-class variants
  if (/^has-\[/.test(variant)) {
    return { excluded: true, category: 'advanced-variants' };
  }
  
  // data-* attribute variants
  if (/^data-\[/.test(variant)) {
    return { excluded: true, category: 'advanced-variants' };
  }
  
  // aria-* attribute variants
  if (/^aria-\[/.test(variant)) {
    return { excluded: true, category: 'advanced-variants' };
  }
  
  // Arbitrary variants [&...] or [@...]
  if (/^\[/.test(variant)) {
    return { excluded: true, category: 'advanced-variants' };
  }
  
  return { excluded: false };
}

/**
 * Apply variants using lite variant map
 * Returns undefined for advanced variants not available in lite mode
 * @param {string} selector - Base selector
 * @param {string[]} variants - Array of variants to apply
 * @param {PluginRegistry} pluginRegistry - Plugin registry
 * @param {object} context - Optional context with __LITE_MODE__ flag
 * @returns {string|undefined|object} - Transformed selector, undefined, or error context
 */
function applyVariantsLite(selector, variants, pluginRegistry, context) {
  let currentSelector = selector;

  for (const variant of variants) {
    // Check for excluded variants first
    const exclusionCheck = checkLiteVariantExclusion(variant);
    if (exclusionCheck.excluded) {
      // Return error context if __LITE_MODE__ flag is set
      if (context && context.__LITE_MODE__) {
        return {
          __error: true,
          reason: 'lite-mode-excluded',
          category: exclusionCheck.category,
          variant,
        };
      }
      return undefined;
    }
    
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
          console.warn(`[Windrunner Lite] Plugin variant handler error for "${variant}":`, error);
        }
      }
    }

    // Built-in lite variant lookup
    const builtinHandler = LITE_VARIANT_MAP.get(variant);
    if (builtinHandler) {
      currentSelector = builtinHandler(currentSelector);
    } else {
      // Variant not available in lite mode
      if (context && context.__LITE_MODE__) {
        return {
          __error: true,
          reason: 'lite-mode-excluded',
          category: 'advanced-variants',
          variant,
        };
      }
      return undefined;
    }
  }

  return currentSelector;
}

// ─── Parse Cache ──────────────────────────────────────────────────────────────

const parseCache = new Map();
const PARSE_CACHE_MAX_SIZE = 2000;

function getConfigHash(screens, containers) {
  const screensEmpty = !screens || Object.keys(screens).length === 0;
  const containersEmpty = !containers || Object.keys(containers).length === 0;
  
  if (screensEmpty && containersEmpty) return "default";
  
  return `${Object.keys(screens || {}).join(",")}|${Object.keys(containers || {}).join(",")}`;
}

/**
 * Parse class name into components (same as full version)
 * @param {string} className - Class name to parse
 * @param {object} screens - Screen breakpoints
 * @param {object} containers - Container breakpoints
 * @returns {object|null} - Parsed class object or null
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
    const firstKey = parseCache.keys().next().value;
    parseCache.delete(firstKey);
  }
  parseCache.set(cacheKey, result);
  
  return result;
}

// ─── Runtime Context ──────────────────────────────────────────────────────────

/**
 * Resolve runtime context for lite build
 * Same as full version but with lite compiler reference
 */
export function resolveRuntimeContextLite(options = {}) {
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
          console.error('[Windrunner Lite] Plugin initialization error:', error);
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
    __LITE_MODE__: true, // Flag to identify lite compilation context
  };
}

// ─── Core Compile Function ────────────────────────────────────────────────────

/**
 * Compile class name with lite context
 * Returns empty string for utilities/variants not available in lite mode
 */
export function compileRuntimeClassNameWithContext(className, context) {
  const parsed = parseClass(className, context.screens, context.containers);
  if (!parsed) return "";

  const declarationResult = compileBaseTokenLite(parsed.baseToken, context.theme, context.plugins, context);
  
  // Check if we got an error context object
  if (declarationResult && typeof declarationResult === 'object' && declarationResult.__error) {
    // Return empty string but the error info is lost - handled at runtime level
    return "";
  }
  
  if (!declarationResult) return "";

  const selector = `.${escapeCssIdentifier(parsed.original)}`;
  const variantSelectorResult = applyVariantsLite(selector, parsed.variants, context.plugins, context);
  
  // Check if we got an error context object from variant
  if (variantSelectorResult && typeof variantSelectorResult === 'object' && variantSelectorResult.__error) {
    // Return empty string but the error info is lost - handled at runtime level
    return "";
  }
  
  if (!variantSelectorResult) return "";

  const finalDeclaration = appendImportant(
    isChildScoped(declarationResult) ? declarationResult.declaration : declarationResult,
    parsed.important,
  );
  const scopedSelector = isChildScoped(declarationResult)
    ? `${variantSelectorResult} > :not(:first-child)`
    : variantSelectorResult;
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

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compile single class with lite build (excludes extended utilities)
 */
export function compileClass(className, options = {}) {
  return compileRuntimeClassNameWithContext(className, resolveRuntimeContextLite(options));
}

/**
 * Compile multiple classes to critical CSS (lite version)
 */
export function compileCriticalCss(classNames, options = {}) {
  const classList = typeof classNames === 'string'
    ? classNames.split(/\s+/).filter(Boolean)
    : Array.isArray(classNames)
      ? classNames.flatMap(item => {
          if (typeof item === 'string') {
            return item.split(/\s+/).filter(Boolean);
          } else if (Array.isArray(item)) {
            return item.flatMap(str => 
              typeof str === 'string' ? str.split(/\s+/).filter(Boolean) : []
            );
          }
          return [];
        })
      : [];

  const context = resolveRuntimeContextLite(options);
  const cssRules = new Set();
  
  classList.forEach((className) => {
    const css = compileRuntimeClassNameWithContext(className, context);
    if (css) {
      cssRules.add(css);
    }
  });

  return Array.from(cssRules).join('\n');
}

/**
 * Extract class names from HTML (reuse from full compiler)
 */
export function extractClassNames(html) {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const classSet = new Set();
  
  // Pattern 1: class="..." or className="..."
  const classAttrPattern = /class(?:Name)?=["']([^"']+)["']/gi;
  let match;
  
  while ((match = classAttrPattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 2: classList.add/remove/toggle
  const classListPattern = /classList\.(?:add|remove|toggle|contains|replace)\(\s*([^)]+)\s*\)/gi;
  
  while ((match = classListPattern.exec(html)) !== null) {
    const args = match[1];
    const quotedStringPattern = /["']([^"']+)["']/g;
    let quotedMatch;
    
    while ((quotedMatch = quotedStringPattern.exec(args)) !== null) {
      const classList = quotedMatch[1].trim();
      if (classList) {
        classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
      }
    }
  }
  
  // Pattern 3: setAttribute
  const setAttributePattern = /setAttribute\(\s*["']class(?:Name)?["']\s*,\s*["']([^"']+)["']\s*\)/gi;
  
  while ((match = setAttributePattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 4: JSX template literals
  const templateLiteralPattern = /className\s*=\s*\{`([^`]*)`\}/gi;
  
  while ((match = templateLiteralPattern.exec(html)) !== null) {
    const template = match[1];
    const staticParts = template.split(/\$\{[^}]*\}/);
    staticParts.forEach(part => {
      const classList = part.trim();
      if (classList) {
        classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
      }
    });
  }
  
  // Pattern 5: JSX with braces
  const jsxBracesPattern = /className\s*=\s*\{\s*["']([^"']+)["']\s*\}/gi;
  
  while ((match = jsxBracesPattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 6: clsx/classnames
  const clsxPattern = /(?:clsx|classnames|cn|classNames)\(\s*["']([^"']+)["']/gi;
  
  while ((match = clsxPattern.exec(html)) !== null) {
    const classList = match[1].trim();
    if (classList) {
      classList.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
    }
  }
  
  // Pattern 7: Vue :class
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
 * Compile critical CSS from HTML (lite version)
 */
export function compileCriticalCssFromHtml(html, options = {}) {
  const classNames = extractClassNames(html);
  return compileCriticalCss(classNames, options);
}

/**
 * Compile critical CSS from files (lite version, Node.js only)
 */
export async function compileCriticalCssFromFiles(filePaths, options = {}) {
  const sources = Array.isArray(filePaths) ? filePaths : [filePaths];
  
  if (sources.length === 0) {
    return '';
  }
  
  if (sources.some(path => !path || typeof path !== 'string')) {
    throw new Error("compileCriticalCssFromFiles() requires valid file path(s).");
  }
  
  let fs;
  try {
    fs = await import("fs/promises");
  } catch (error) {
    throw new Error(
      "compileCriticalCssFromFiles() is only supported in Node.js environments. " +
      "Use compileCriticalCssFromHtml() in browser environments."
    );
  }

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

    const combinedHtml = contents.join("\n");
    const classNames = extractClassNames(combinedHtml);
    
    return compileCriticalCss(classNames, options);
  } catch (error) {
    if (error.message.startsWith("Failed to read file:")) {
      throw error;
    }
    throw new Error(`compileCriticalCssFromFiles() failed: ${error.message}`);
  }
}

// ─── Export Lite-Specific Items ───────────────────────────────────────────────

export {
  compileBaseTokenLite,
  LITE_PREFIX_ROUTER,
  LITE_VARIANT_MAP,
  applyVariantsLite,
  checkLiteExclusion,
  checkLiteVariantExclusion,
};
