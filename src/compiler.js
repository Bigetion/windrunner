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
import { buildSpaceBetweenDeclaration, buildDivideDeclaration } from "./builders/space-divide.js";

// ─── Master compile dispatcher ────────────────────────────────────────────────

function compileBaseToken(baseToken, theme) {
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

// ─── Variant & selector logic ─────────────────────────────────────────────────

function applyVariants(selector, variants) {
  let currentSelector = selector;

  for (const variant of variants) {
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
      case "placeholder":   currentSelector = `${currentSelector}::placeholder`; break;
      case "before":        currentSelector = `${currentSelector}::before`; break;
      case "after":         currentSelector = `${currentSelector}::after`; break;
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
  return {
    config,
    theme: config.theme || {},
    screens: (config.theme && config.theme.screens) || {},
    containers: (config.theme && config.theme.containers) || {},
  };
}

export function getBaseTailwindOptions(options = {}) {
  const { id, autoStart, compatMode, compatStyleId, compatGenerateCss, ...tailwindOptions } = options;
  return tailwindOptions;
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

  return { original: token, baseToken, variants, breakpoint, containerBreakpoint, important, starting };
}

// ─── Core compile function ────────────────────────────────────────────────────

export function compileRuntimeClassNameWithContext(className, context) {
  const parsed = parseClass(className, context.screens, context.containers);
  if (!parsed) return "";

  const declaration = compileBaseToken(parsed.baseToken, context.theme);
  if (!declaration) return "";

  const selector = `.${escapeCssIdentifier(parsed.original)}`;
  const variantSelector = applyVariants(selector, parsed.variants);
  if (!variantSelector) return "";

  const finalDeclaration = appendImportant(declaration, parsed.important);
  const needsSpaceChildSelector = (
    (parsed.baseToken.startsWith("space-x-") && parsed.baseToken !== "space-x-reverse") ||
    (parsed.baseToken.startsWith("space-y-") && parsed.baseToken !== "space-y-reverse")
  );
  const scopedSelector = needsSpaceChildSelector
    ? `${variantSelector} > :not(:first-child)`
    : variantSelector;
  const ruleBody = `${scopedSelector} { ${finalDeclaration} }`;

  if (parsed.breakpoint) {
    return `@media (min-width: ${context.screens[parsed.breakpoint]}) { ${ruleBody} }`;
  }

  if (parsed.containerBreakpoint) {
    return `@container (min-width: ${context.containers[parsed.containerBreakpoint]}) { ${ruleBody} }`;
  }

  return ruleBody;

  // starting: wraps the entire rule (including any media query) in @starting-style
  if (parsed.starting) {
    const wrapped = parsed.breakpoint
      ? `@media (min-width: ${context.screens[parsed.breakpoint]}) { ${rule} }`
      : parsed.containerBreakpoint
        ? `@container (min-width: ${context.containers[parsed.containerBreakpoint]}) { ${rule} }`
        : rule;
    return `@starting-style { ${wrapped} }`;
  }

  if (parsed.breakpoint) {
    return `@media (min-width: ${context.screens[parsed.breakpoint]}) { ${rule} }`;
  }

  if (parsed.containerBreakpoint) {
    return `@container (min-width: ${context.containers[parsed.containerBreakpoint]}) { ${rule} }`;
  }

  return rule;
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
