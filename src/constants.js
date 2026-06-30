/**
 * Pre-compiled regex patterns and constants for performance optimization.
 * Creating regex patterns once and reusing them is faster than recreating on every call.
 */

// ─── Arbitrary Value Patterns ─────────────────────────────────────────────────

export const ARBITRARY_VALUE_REGEX = /^\[.+\]$/;

// ─── Time Value Patterns (transitions, animations) ────────────────────────────

export const TIME_VALUE_WITH_UNIT_REGEX = /^\d+(?:\.\d+)?(?:ms|s)$/;
export const TIME_VALUE_NUMERIC_REGEX = /^\d+(?:\.\d+)?$/;

// ─── Numeric Patterns ─────────────────────────────────────────────────────────

export const NUMERIC_REGEX = /^-?\d+(?:\.\d+)?$/;
export const PERCENTAGE_REGEX = /^-?\d+(?:\.\d+)?%$/;

// ─── Color Patterns ───────────────────────────────────────────────────────────

export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
export const RGB_REGEX = /^rgba?\(/;
export const HSL_REGEX = /^hsla?\(/;
export const OKLCH_REGEX = /^oklch\(/;

// ─── Prefix Extraction ────────────────────────────────────────────────────────

export const PREFIX_EXTRACTION_REGEX = /^([a-z]+(?:-[a-z]+)*)-/;

// ─── CSS Identifier Escaping ──────────────────────────────────────────────────

export const CSS_ESCAPE_BACKSLASH_REGEX = /\\/g;
export const CSS_ESCAPE_SPECIAL_CHARS_REGEX = /([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g;
export const CSS_ESCAPE_LEADING_DIGIT_REGEX = /^(\d)/;

// ─── Class Name Parsing ───────────────────────────────────────────────────────

export const IMPORTANT_PREFIX_REGEX = /^!/;
export const CONTAINER_BREAKPOINT_PREFIX_REGEX = /^@/;

// ─── Variant Delimiter (for splitting class names) ───────────────────────────

export const VARIANT_DELIMITER = ":";

// ─── Opacity Modifier ─────────────────────────────────────────────────────────

export const OPACITY_SEPARATOR = "/";

// ─── Common CSS Values ────────────────────────────────────────────────────────

export const CSS_INHERIT = "inherit";
export const CSS_INITIAL = "initial";
export const CSS_UNSET = "unset";
export const CSS_AUTO = "auto";
export const CSS_NONE = "none";
export const CSS_TRANSPARENT = "transparent";
export const CSS_CURRENT_COLOR = "currentColor";
