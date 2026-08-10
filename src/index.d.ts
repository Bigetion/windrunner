// ══════════════════════════════════════════════════════════════════════════════
// Windrunner v2.0 TypeScript Definitions
// Strict mode compatible - no `any` types in public API
// ══════════════════════════════════════════════════════════════════════════════

// ─── Theme Configuration Types ────────────────────────────────────────────────

export type ThemeValue = string | number | ThemeScale | ThemeFunction;

export type ThemeScale = Record<string, string | number>;

export type ThemeFunction = (helpers: { theme: ThemeResolver }) => ThemeScale;

export interface ThemeColors {
  [key: string]: string | Record<string, string>;
}

/**
 * Generic theme resolver type that returns correct type based on path.
 * Used for type-safe theme value lookups within plugins and theme functions.
 */
export interface ThemeResolver {
  <K extends keyof ThemeConfig>(key: K): ThemeConfig[K];
  (key: string): ThemeScale | ThemeColors | string[] | undefined;
}

/**
 * Utility type for resolving nested theme paths.
 * Supports dot-notation path access with type inference.
 * 
 * @example
 * type ColorValue = ThemeLookup<'colors.blue.500'>; // string
 * type SpacingValue = ThemeLookup<'spacing'>; // ThemeScale | undefined
 */
export type ThemeLookup<
  TPath extends string,
  TConfig = ThemeConfig
> = TPath extends `${infer TKey}.${infer TRest}`
  ? TKey extends keyof TConfig
    ? TConfig[TKey] extends Record<string, infer TValue>
      ? TRest extends string
        ? ThemeLookup<TRest, Record<string, TValue>>
        : TValue
      : TConfig[TKey]
    : undefined
  : TPath extends keyof TConfig
    ? TConfig[TPath]
    : undefined;

/**
 * Comprehensive theme configuration interface covering all theme properties.
 * All properties are optional and accept ThemeScale or specific types.
 */
export interface ThemeConfig {
  // Colors
  colors?: ThemeColors;
  accentColor?: ThemeColors | ThemeFunction;
  backgroundColor?: ThemeColors | ThemeFunction;
  borderColor?: ThemeColors | ThemeFunction;
  caretColor?: ThemeColors | ThemeFunction;
  fill?: ThemeColors | ThemeFunction;
  gradientColorStops?: ThemeColors | ThemeFunction;
  outlineColor?: ThemeColors | ThemeFunction;
  placeholderColor?: ThemeColors | ThemeFunction;
  ringColor?: ThemeColors | ThemeFunction;
  ringOffsetColor?: ThemeColors | ThemeFunction;
  stroke?: ThemeColors | ThemeFunction;
  textColor?: ThemeColors | ThemeFunction;
  textDecorationColor?: ThemeColors | ThemeFunction;

  // Spacing
  spacing?: ThemeScale;
  padding?: ThemeScale | ThemeFunction;
  margin?: ThemeScale | ThemeFunction;
  gap?: ThemeScale | ThemeFunction;
  space?: ThemeScale | ThemeFunction;
  inset?: ThemeScale | ThemeFunction;

  // Sizing
  width?: ThemeScale | ThemeFunction;
  height?: ThemeScale | ThemeFunction;
  minWidth?: ThemeScale | ThemeFunction;
  maxWidth?: ThemeScale | ThemeFunction;
  minHeight?: ThemeScale | ThemeFunction;
  maxHeight?: ThemeScale | ThemeFunction;
  size?: ThemeScale | ThemeFunction;

  // Typography
  fontFamily?: Record<string, string[]>;
  fontSize?: ThemeScale;
  fontWeight?: ThemeScale;
  lineHeight?: ThemeScale;
  letterSpacing?: ThemeScale;
  textShadow?: ThemeScale;

  // Borders
  borderRadius?: ThemeScale;
  borderWidth?: ThemeScale;
  borderSpacing?: ThemeScale | ThemeFunction;
  divideWidth?: ThemeScale | ThemeFunction;
  divideColor?: ThemeColors | ThemeFunction;
  ringWidth?: ThemeScale;
  ringOffsetWidth?: ThemeScale;
  outlineWidth?: ThemeScale;
  outlineOffset?: ThemeScale;

  // Effects
  boxShadow?: ThemeScale;
  boxShadowColor?: ThemeColors | ThemeFunction;
  opacity?: ThemeScale;
  dropShadow?: ThemeScale;

  // Transforms
  scale?: ThemeScale;
  rotate?: ThemeScale;
  translate?: ThemeScale | ThemeFunction;
  skew?: ThemeScale;
  transformOrigin?: ThemeScale;

  // Filters
  blur?: ThemeScale;
  brightness?: ThemeScale;
  contrast?: ThemeScale;
  grayscale?: ThemeScale;
  hueRotate?: ThemeScale;
  invert?: ThemeScale;
  saturate?: ThemeScale;
  sepia?: ThemeScale;
  backdropBlur?: ThemeScale | ThemeFunction;
  backdropBrightness?: ThemeScale | ThemeFunction;
  backdropContrast?: ThemeScale | ThemeFunction;
  backdropGrayscale?: ThemeScale | ThemeFunction;
  backdropHueRotate?: ThemeScale | ThemeFunction;
  backdropInvert?: ThemeScale | ThemeFunction;
  backdropOpacity?: ThemeScale | ThemeFunction;
  backdropSaturate?: ThemeScale | ThemeFunction;
  backdropSepia?: ThemeScale | ThemeFunction;

  // Backgrounds
  backgroundImage?: ThemeScale;
  backgroundPosition?: ThemeScale;
  backgroundSize?: ThemeScale;

  // Transitions & Animations
  transitionProperty?: ThemeScale;
  transitionDuration?: ThemeScale;
  transitionDelay?: ThemeScale;
  transitionTimingFunction?: ThemeScale;
  animation?: ThemeScale;

  // Layout
  aspectRatio?: ThemeScale;
  columns?: ThemeScale;
  container?: Record<string, string>;
  zIndex?: ThemeScale;

  // Responsive & Containers
  screens?: Record<string, string>;
  containers?: Record<string, string>;

  // Flexbox & Grid
  flex?: ThemeScale;
  flexBasis?: ThemeScale | ThemeFunction;
  flexGrow?: ThemeScale;
  flexShrink?: ThemeScale;
  gridTemplateColumns?: ThemeScale;
  gridTemplateRows?: ThemeScale;
  gridColumn?: ThemeScale;
  gridColumnStart?: ThemeScale;
  gridColumnEnd?: ThemeScale;
  gridRow?: ThemeScale;
  gridRowStart?: ThemeScale;
  gridRowEnd?: ThemeScale;
  gridAutoColumns?: ThemeScale;
  gridAutoRows?: ThemeScale;
  order?: ThemeScale;

  // Misc
  cursor?: ThemeScale;
  content?: ThemeScale;
  listStyleType?: ThemeScale;
  listStyleImage?: ThemeScale;
  objectPosition?: ThemeScale;
  scrollMargin?: ThemeScale | ThemeFunction;
  scrollPadding?: ThemeScale | ThemeFunction;
  willChange?: ThemeScale;

  // Extension point for user-defined theme values
  extend?: Partial<ThemeConfig>;
}

// ─── FOUC Configuration Types ─────────────────────────────────────────────────

export type FOUCStrategy = 'opacity' | 'visibility' | 'none';

export interface FOUCConfig {
  /**
   * FOUC prevention strategy
   * - 'opacity': Fade in from opacity 0
   * - 'visibility': Hide with visibility hidden
   * - 'none': No automatic FOUC prevention (default)
   */
  strategy?: FOUCStrategy;

  /**
   * Transition duration in milliseconds
   * @default 150
   */
  duration?: number;

  /**
   * CSS selector for elements to hide/reveal
   * @default 'html'
   */
  selector?: string;
}

// ─── Error & Warning Context Types ────────────────────────────────────────────

/**
 * All possible error reason values for compilation failures.
 */
export type ErrorReason =
  | 'parse-error'
  | 'unknown-utility'
  | 'unknown-variant'
  | 'compilation-error'
  | 'lite-mode-excluded';

/**
 * Error reason constants for use in application code.
 */
export declare const ErrorReasons: Readonly<{
  PARSE_ERROR: 'parse-error';
  UNKNOWN_UTILITY: 'unknown-utility';
  UNKNOWN_VARIANT: 'unknown-variant';
  COMPILATION_ERROR: 'compilation-error';
  LITE_MODE_EXCLUDED: 'lite-mode-excluded';
}>;

/**
 * Severity levels for warnings.
 */
export type WarningSeverity = 'low' | 'medium' | 'high';

/**
 * Warning severity constants for use in application code.
 */
export declare const WarningSeverityLevels: Readonly<{
  LOW: 'low';
  MEDIUM: 'medium';
  HIGH: 'high';
}>;

/**
 * Rich error context provided to the onError callback.
 * Contains all relevant information for debugging a compilation failure.
 */
export interface ErrorContext {
  /** The original class name that failed to compile */
  className: string;

  /** Classification of the failure reason */
  reason: ErrorReason;

  /** The parsed base utility token (if parsing succeeded) */
  baseToken?: string;

  /** The parsed variant list (if parsing succeeded) */
  variants?: string[];

  /** Specific variants that could not be resolved */
  unknownVariants?: string[];

  /** Full parse result object for debugging */
  parseResult?: ParsedClass;

  /** How many times this class has been attempted */
  compileAttempt?: number;

  /** Unix timestamp (ms) when the error occurred */
  timestamp: number;

  /** Stack trace (only available in debug mode) */
  stack?: string;

  /** Category of excluded utility (lite mode only) */
  category?: string;

  /** Human-readable description of the error */
  details?: string;
}

/**
 * Context object provided to the onWarning callback for recoverable issues.
 */
export interface WarningContext {
  /** Human-readable description of the warning */
  message: string;

  /** The class name related to the warning (if applicable) */
  className?: string;

  /** Impact level of the warning */
  severity: WarningSeverity;

  /** Unix timestamp (ms) when the warning occurred */
  timestamp: number;

  /** Suggested action to resolve the warning */
  suggestion?: string;
}

/**
 * Create an ErrorContext object with standardized fields.
 */
export function createErrorContext(
  className: string,
  reason: ErrorReason,
  extra?: Partial<Omit<ErrorContext, 'className' | 'reason' | 'timestamp'>>
): ErrorContext;

/**
 * Create a WarningContext object with standardized fields.
 */
export function createWarningContext(
  message: string,
  severity: WarningSeverity,
  extra?: Partial<Omit<WarningContext, 'message' | 'severity' | 'timestamp'>>
): WarningContext;

// ─── Runtime Statistics Types ─────────────────────────────────────────────────

export interface RuntimeStats {
  /** Number of entries in the compilation cache */
  cacheSize: number;

  /** Number of CSS rules injected into the stylesheet */
  insertedRuleCount: number;

  /** Number of elements awaiting processing */
  pendingElementCount: number;

  /** Whether the MutationObserver is currently active */
  isObserving: boolean;

  /** Whether compatibility mode CSS has been loaded */
  isCompatLoaded: boolean;

  /** Ratio of cache hits to total compile attempts (debug mode only) */
  cacheHitRate?: number;

  /** Rolling average compile time in ms (debug mode only) */
  avgCompileTimeMs?: number;

  /** Most frequently failed class names (debug mode only) */
  topFailedClasses?: Array<{ className: string; count: number }>;

  /** Estimated memory consumption (debug mode only) */
  memoryUsage?: {
    cacheBytes: number;
    insertedRulesBytes: number;
  };
}

export interface ScanStats {
  /** Number of elements scanned */
  elementCount: number;

  /** Number of unique classes found */
  classCount: number;

  /** Number of CSS rules generated */
  ruleCount: number;

  /** Time taken in milliseconds */
  duration: number;

  /** Cache performance during this scan (debug mode only) */
  cacheStats?: {
    hits: number;
    misses: number;
    rate: number;
  };
}

// ─── Observer Options ─────────────────────────────────────────────────────────

export interface ObserverOptions {
  /** Observe child list changes (default: true) */
  childList?: boolean;

  /** Observe subtree changes (default: true) */
  subtree?: boolean;

  /** Observe attribute changes (default: true) */
  attributes?: boolean;

  /** Attributes to observe (default: ["class"]) */
  attributeFilter?: string[];
}

// ─── Plugin Types ─────────────────────────────────────────────────────────────

/**
 * Handler function for custom utility plugins.
 * Receives the regex match and theme context, returns a CSS declaration string.
 */
export type UtilityHandler =
  | string
  | ((match: RegExpMatchArray, context: { theme: ThemeResolver }) => string | undefined);

/**
 * Handler function for custom variant plugins.
 * Receives a selector and returns the transformed selector.
 */
export type VariantHandler = (selector: string) => string;

/**
 * Plugin API interface providing all methods available to plugin authors.
 */
export interface PluginAPI {
  /**
   * Register a custom utility
   */
  addUtility(pattern: string | RegExp, handler: UtilityHandler): void;

  /**
   * Register multiple utilities at once
   */
  addUtilities(utilities: Record<string, UtilityHandler>): void;

  /**
   * Register a custom variant
   */
  addVariant(name: string, handler: VariantHandler): void;

  /**
   * Register multiple variants at once
   */
  addVariants(variants: Record<string, VariantHandler>): void;

  /**
   * Add base styles (like preflight)
   */
  addBase(styles: Record<string, string | Record<string, string>>): void;

  /**
   * Add component utilities
   */
  addComponents(components: Record<string, string | Record<string, string>>): void;

  /**
   * Register dynamic utilities with pattern matching
   */
  matchUtilities(
    utilities: Record<string, UtilityHandler>,
    options?: {
      values?: Record<string, string>;
      type?: string | string[];
      respectPrefix?: boolean;
      respectImportant?: boolean;
    }
  ): void;

  /**
   * Register dynamic components with pattern matching
   */
  matchComponents(
    components: Record<string, UtilityHandler>,
    options?: {
      values?: Record<string, string>;
      type?: string | string[];
    }
  ): void;

  /**
   * Access theme values with type-safe lookups
   */
  theme<K extends keyof ThemeConfig>(key: K): ThemeConfig[K];
  theme(key: string): ThemeScale | ThemeColors | string[] | undefined;

  /**
   * Access full runtime config
   */
  config(): WindrunnerOptions;

  /**
   * Escape CSS identifier (special characters)
   */
  e(value: string): string;
}

export interface Plugin {
  __isWindrunnerPlugin: true;
  handler: (api: PluginAPI) => void;
}

/**
 * Create a Windrunner plugin
 */
export function plugin(handler: (api: PluginAPI) => void): Plugin;

/**
 * Helper to define utilities object
 */
export function defineUtilities(
  definitions: Record<string, string | Record<string, string>>
): Record<string, string>;

/**
 * Helper to define responsive utilities
 */
export function defineResponsiveUtilities<T extends Record<string, string>>(
  base: string,
  values: T,
  toDeclaration: (key: keyof T & string, value: T[keyof T & string]) => string
): Record<string, string>;

// ─── Parsed Class Structure ───────────────────────────────────────────────────

export interface ParsedClass {
  /** The original full class name string */
  original: string;

  /** The base utility token (e.g., 'bg-blue-500') */
  baseToken: string;

  /** Ordered list of applied variants */
  variants: string[];

  /** Responsive breakpoint (e.g., 'md', 'lg') or null */
  breakpoint: string | null;

  /** Container breakpoint or null */
  containerBreakpoint: string | null;

  /** Whether the ! important modifier is applied */
  important: boolean;

  /** Whether @starting-style wrapper applies */
  starting: boolean;
}

// ─── Hybrid Mode ──────────────────────────────────────────────────────────────

export type HybridMode = 'runtime' | 'hybrid';

// ─── Main Options Interface ───────────────────────────────────────────────────

export interface WindrunnerOptions {
  /** Unique ID for the style element (default: "tailwind-runtime-css") */
  id?: string;

  /** Auto-start on initialization (default: true in browser) */
  autoStart?: boolean;

  /** Include CSS preflight/reset (default: true) */
  preflight?: boolean;

  /** Compatibility mode: "none" or "full" (default: "none") */
  compatMode?: 'none' | 'full';

  /** Style element ID for compatibility mode CSS */
  compatStyleId?: string;

  /** Function to generate full CSS for compatibility mode */
  compatGenerateCss?: (options: WindrunnerOptions) => string;

  /** Theme configuration */
  theme?: Partial<ThemeConfig>;

  /** Array of plugins to register */
  plugins?: Plugin[];

  /** Maximum cache size for compiled classes (default: 10000) */
  maxCacheSize?: number;

  /** FOUC (Flash of Unstyled Content) prevention configuration */
  fouc?: FOUCConfig;

  /**
   * Skip recompiling rules already present in stylesheets
   * @default false
   */
  precompiled?: boolean;

  /**
   * Operating mode
   * - 'runtime': Standard runtime compilation (default)
   * - 'hybrid': Coordinate with precompiled critical CSS
   * @default 'runtime'
   */
  mode?: HybridMode;

  /**
   * Enable debug logging and expose window.__WINDRUNNER__ global
   * @default false
   */
  debug?: boolean;

  /**
   * Throw errors on unknown utilities instead of silently skipping
   * @default false
   */
  strict?: boolean;

  /** MutationObserver configuration options */
  observerOptions?: ObserverOptions;

  /** Callback fired when runtime is ready */
  onReady?: () => void;

  /** Callback fired when a class name fails to compile */
  onError?: (className: string, context: ErrorContext) => void;

  /** Callback fired for recoverable issues (cache eviction, deprecated usage, etc.) */
  onWarning?: (message: string, context: WarningContext) => void;

  /** Callback fired when a class is successfully compiled */
  onCompile?: (className: string, cssRule: string) => void;

  /** Callback fired when scan completes */
  onScanComplete?: (stats: ScanStats) => void;
}

// ─── Compilation Context ──────────────────────────────────────────────────────

export interface CompilationContext {
  config: WindrunnerOptions;
  theme: ThemeConfig;
  screens: Record<string, string>;
  containers: Record<string, string>;
  plugins: PluginRegistry | null;
}

/**
 * Plugin registry interface (internal, exposed for advanced use)
 */
export interface PluginRegistry {
  matchUtility(token: string): string | undefined;
  matchVariant(variant: string): VariantHandler | undefined;
  getCustomVariants(): Map<string, VariantHandler>;
}

// ─── Runtime Instance Interface ───────────────────────────────────────────────

/**
 * Windrunner runtime instance with all public methods.
 * Alias: `WindrunnerInstance` is provided for backward compatibility.
 */
export interface Runtime {
  /** Compile and inject a single class name */
  processClassName(className: string): string | undefined;

  /** Compile and inject multiple class names */
  processClassList(classList: string | string[] | ArrayLike<string>): string[];

  /** Process all classes on an element */
  processElement(el: Element | null): void;

  /** Scan document or element for classes */
  scan(root?: Document | Element): void;

  /** Start observing for DOM changes */
  observe(root?: Element): void;

  /** Flush pending element queue */
  flush(): void;

  /** Start the runtime (scan + observe) */
  start(): void;

  /** Stop observing and clear queues */
  disconnect(): void;

  /** Clear the compilation cache */
  clearCache(): void;

  /** Get runtime statistics */
  getStats(): RuntimeStats;

  /** Check if compatibility mode is loaded */
  isCompatLoaded(): boolean;

  /** Get current cache size */
  getCacheSize(): number;

  /** Get number of inserted rules */
  getInsertedRuleCount(): number;
}

/** Alias for Runtime interface */
export type WindrunnerInstance = Runtime;

// ─── Main Exports ─────────────────────────────────────────────────────────────

/**
 * Create a Windrunner runtime instance with full manual control
 */
export function createWindrunner(options?: WindrunnerOptions): Runtime;

/**
 * Resolve runtime compilation context from options
 */
export function resolveRuntimeContext(options?: WindrunnerOptions): CompilationContext;

/**
 * Compile a class name using an existing compilation context
 */
export function compileRuntimeClassNameWithContext(className: string, context: CompilationContext): string;

/**
 * Compile a single class name to CSS
 */
export function compileClass(className: string, options?: WindrunnerOptions): string;

/**
 * Parse a class name into its component parts
 */
export function parseClass(
  className: string,
  screens?: Record<string, string>,
  containers?: Record<string, string>
): ParsedClass | null;

/**
 * Get base Tailwind options (strips runtime-only properties)
 */
export function getBaseTailwindOptions(options: WindrunnerOptions): Omit<WindrunnerOptions, 'id' | 'autoStart' | 'compatMode' | 'compatStyleId' | 'compatGenerateCss'>;

// ─── SSR / Critical CSS API ───────────────────────────────────────────────────

/**
 * Compile multiple class names into a single CSS string for SSR / critical CSS.
 * Useful for generating CSS at build time or server-side rendering.
 *
 * @param classNames - Single class string, array of class names, or space-separated string
 * @param options - Windrunner configuration options
 * @returns Combined CSS rules ready for injection
 *
 * @example
 * ```ts
 * import { compileCriticalCss } from 'windrunner';
 *
 * const css = compileCriticalCss([
 *   'flex items-center gap-4',
 *   'text-xl font-bold'
 * ]);
 *
 * const html = `<style>${css}</style>`;
 * ```
 */
export function compileCriticalCss(
  classNames: string | string[],
  options?: WindrunnerOptions
): string;

/**
 * Extract unique class names from HTML string.
 *
 * @param html - HTML content to extract classes from
 * @returns Array of unique class names
 */
export function extractClassNames(html: string): string[];

/**
 * Extract class names from HTML and compile to CSS
 */
export function compileCriticalCssFromHtml(html: string, options?: WindrunnerOptions): string;

/**
 * Read HTML files and compile critical CSS (Node.js only)
 */
export function compileCriticalCssFromFiles(filePaths: string | string[], options?: WindrunnerOptions): Promise<string>;

// ─── Default Export ───────────────────────────────────────────────────────────

/**
 * Create and auto-start a Windrunner runtime instance.
 * Default export for quick setup.
 */
declare function windrunner(options?: WindrunnerOptions): Runtime;
export default windrunner;
