/**
 * @module types
 * @description Shared type definitions and documentation for Windrunner's
 * error handling, warning, and observability infrastructure.
 * 
 * This file provides JSDoc interfaces and constant enumerations used across
 * the runtime and compiler modules. TypeScript users should refer to index.d.ts.
 */

// ─── Error Reason Enumeration ─────────────────────────────────────────────────

/**
 * Error reason constants for classification of compilation failures.
 * 
 * @readonly
 * @enum {string}
 */
export const ErrorReasons = Object.freeze({
  /** Class name could not be parsed into tokens */
  PARSE_ERROR: 'parse-error',
  
  /** Base utility token not recognized by any builder */
  UNKNOWN_UTILITY: 'unknown-utility',
  
  /** One or more variants could not be resolved */
  UNKNOWN_VARIANT: 'unknown-variant',
  
  /** Utility was parsed but compilation produced an error */
  COMPILATION_ERROR: 'compilation-error',
  
  /** Utility or variant is not available in the lite build */
  LITE_MODE_EXCLUDED: 'lite-mode-excluded',
});

// ─── Warning Severity Levels ──────────────────────────────────────────────────

/**
 * Warning severity constants indicating the impact level of a recoverable issue.
 * 
 * @readonly
 * @enum {string}
 */
export const WarningSeverity = Object.freeze({
  /** Minor issue that likely won't affect rendering */
  LOW: 'low',
  
  /** Moderate issue that may cause unexpected rendering */
  MEDIUM: 'medium',
  
  /** Significant issue that will likely cause visible problems */
  HIGH: 'high',
});

// ─── ErrorContext Interface ───────────────────────────────────────────────────

/**
 * Rich error context provided to the onError callback.
 * Contains all relevant information for debugging a compilation failure.
 * 
 * @typedef {Object} ErrorContext
 * @property {string} className - The original class name that failed to compile
 * @property {'parse-error'|'unknown-utility'|'unknown-variant'|'compilation-error'|'lite-mode-excluded'} reason - Classification of the failure
 * @property {string} [baseToken] - The parsed base utility token (if parsing succeeded)
 * @property {string[]} [variants] - The parsed variant list (if parsing succeeded)
 * @property {string[]} [unknownVariants] - Specific variants that could not be resolved
 * @property {Object} [parseResult] - Full parse result object for debugging
 * @property {number} [compileAttempt] - How many times this class has been attempted
 * @property {number} timestamp - Unix timestamp (ms) when the error occurred
 * @property {string} [stack] - Stack trace (only in debug mode)
 * @property {string} [category] - Category of excluded utility (lite mode only)
 * @property {string} [details] - Human-readable description of the error
 */

// ─── WarningContext Interface ─────────────────────────────────────────────────

/**
 * Context object provided to the onWarning callback for recoverable issues.
 * 
 * @typedef {Object} WarningContext
 * @property {string} message - Human-readable description of the warning
 * @property {string} [className] - The class name related to the warning (if applicable)
 * @property {'low'|'medium'|'high'} severity - Impact level of the warning
 * @property {number} timestamp - Unix timestamp (ms) when the warning occurred
 * @property {string} [suggestion] - Suggested action to resolve the warning
 */

// ─── RuntimeStats Interface ───────────────────────────────────────────────────

/**
 * Runtime statistics returned by getStats().
 * Provides observability into the runtime's current state and performance.
 * 
 * @typedef {Object} RuntimeStats
 * @property {number} cacheSize - Number of entries currently in the compilation cache
 * @property {number} insertedRuleCount - Number of CSS rules injected into the stylesheet
 * @property {number} pendingElementCount - Number of elements awaiting processing
 * @property {boolean} isObserving - Whether the MutationObserver is currently active
 * @property {boolean} isCompatLoaded - Whether compatibility mode CSS has been loaded
 * @property {number} [cacheHitRate] - Ratio of cache hits to total compile attempts (debug mode only)
 * @property {number} [avgCompileTimeMs] - Rolling average compile time in ms (debug mode only)
 * @property {Array<{className: string, count: number}>} [topFailedClasses] - Most frequently failed class names (debug mode only)
 * @property {{cacheBytes: number, insertedRulesBytes: number}} [memoryUsage] - Estimated memory consumption (debug mode only)
 */

// ─── ScanStats Interface ──────────────────────────────────────────────────────

/**
 * Statistics object passed to the onScanComplete callback.
 * 
 * @typedef {Object} ScanStats
 * @property {number} elementCount - Number of DOM elements scanned
 * @property {number} classCount - Number of unique class names discovered
 * @property {number} ruleCount - Number of new CSS rules generated during this scan
 * @property {number} duration - Time taken in milliseconds
 * @property {{hits: number, misses: number, rate: number}} [cacheStats] - Cache performance during scan (debug mode only)
 */

// ─── Factory Helpers ──────────────────────────────────────────────────────────

/**
 * Create an ErrorContext object with standardized fields.
 * 
 * @param {string} className - The class name that failed
 * @param {'parse-error'|'unknown-utility'|'unknown-variant'|'compilation-error'|'lite-mode-excluded'} reason - Failure classification
 * @param {Object} [extra] - Additional properties to merge into the context
 * @returns {ErrorContext}
 */
export function createErrorContext(className, reason, extra = {}) {
  return {
    className,
    reason,
    timestamp: Date.now(),
    ...extra,
  };
}

/**
 * Create a WarningContext object with standardized fields.
 * 
 * @param {string} message - Human-readable warning message
 * @param {'low'|'medium'|'high'} severity - Warning severity level
 * @param {Object} [extra] - Additional properties to merge into the context
 * @returns {WarningContext}
 */
export function createWarningContext(message, severity, extra = {}) {
  return {
    message,
    severity,
    timestamp: Date.now(),
    ...extra,
  };
}
