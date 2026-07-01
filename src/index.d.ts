// ─── Theme Configuration Types ────────────────────────────────────────────────

export type ThemeValue = string | number | ThemeScale | ThemeFunction;

export type ThemeScale = Record<string, string | number>;

export type ThemeFunction = (helpers: { theme: (key: string) => any }) => ThemeScale;

export interface ThemeColors {
  [key: string]: string | Record<string, string>;
}

export interface ThemeConfig {
  colors?: ThemeColors;
  spacing?: ThemeScale;
  screens?: Record<string, string>;
  containers?: Record<string, string>;
  borderRadius?: ThemeScale;
  borderWidth?: ThemeScale;
  fontSize?: ThemeScale;
  fontFamily?: Record<string, string[]>;
  fontWeight?: ThemeScale;
  lineHeight?: ThemeScale;
  letterSpacing?: ThemeScale;
  opacity?: ThemeScale;
  boxShadow?: ThemeScale;
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
  backgroundColor?: ThemeColors | ThemeFunction;
  backgroundImage?: ThemeScale;
  backgroundPosition?: ThemeScale;
  backgroundSize?: ThemeScale;
  borderColor?: ThemeColors | ThemeFunction;
  textColor?: ThemeColors | ThemeFunction;
  extend?: Partial<ThemeConfig>;
  [key: string]: ThemeValue | undefined;
}

// ─── Plugin Types ─────────────────────────────────────────────────────────────

export interface PluginAPI {
  addUtility(pattern: string | RegExp, handler: string | ((match: RegExpMatchArray, theme: ThemeConfig) => string | undefined)): void;
  addUtilities(utilities: Record<string, string | ((match: RegExpMatchArray, theme: ThemeConfig) => string | undefined)>): void;
  addVariant(name: string, handler: (selector: string) => string): void;
  addVariants(variants: Record<string, (selector: string) => string>): void;
  theme<T = any>(key?: string): T;
  config(): WindrunnerOptions;
}

export interface Plugin {
  __isWindrunnerPlugin: true;
  handler: (api: PluginAPI) => void;
}

export function plugin(handler: (api: PluginAPI) => void): Plugin;

export function defineUtilities(definitions: Record<string, string | Record<string, string>>): Record<string, string>;

export function defineResponsiveUtilities(
  base: string,
  values: Record<string, string>,
  toDeclaration: (key: string, value: string) => string
): Record<string, string>;

// ─── Runtime Options with Plugins ─────────────────────────────────────────────

export interface WindrunnerOptions {
  /** Unique ID for the style element (default: "tailwind-runtime-css") */
  id?: string;
  
  /** Auto-start on initialization (default: true in browser) */
  autoStart?: boolean;
  
  /** Include CSS preflight/reset (default: true) */
  preflight?: boolean;
  
  /** Compatibility mode: "none" or "full" (default: "none") */
  compatMode?: "none" | "full";
  
  /** Style element ID for compatibility mode CSS */
  compatStyleId?: string;
  
  /** Function to generate full CSS for compatibility mode */
  compatGenerateCss?: (options: WindrunnerOptions) => string;
  
  /** Theme configuration */
  theme?: ThemeConfig;
  
  /** Array of plugins to register */
  plugins?: Plugin[];
  
  /** Maximum cache size for compiled classes (default: 10000) */
  maxCacheSize?: number;
  
  /** Callback fired when runtime is ready */
  onReady?: () => void;
  
  /** Callback fired when a class name fails to compile */
  onError?: (className: string, context?: ErrorContext) => void;
  
  /** Callback fired when a class is successfully compiled */
  onCompile?: (className: string, cssRule: string) => void;
  
  /** Callback fired when scan completes */
  onScanComplete?: (stats: ScanStats) => void;
  
  /** MutationObserver configuration options */
  observerOptions?: ObserverOptions;
  
  /** Additional user-defined options */
  [key: string]: any;
}

export interface ErrorContext {
  /** Reason for compilation failure */
  reason: "unknown-utility" | "parse-error" | "invalid-value";
  
  /** Base token that failed to compile */
  baseToken?: string;
  
  /** Parsed variants if available */
  variants?: string[];
  
  /** Additional error details */
  details?: string;
}

export interface ScanStats {
  /** Number of elements scanned */
  elementCount: number;
  
  /** Number of unique classes found */
  classCount: number;
  
  /** Number of CSS rules generated */
  ruleCount: number;
  
  /** Time taken in milliseconds */
  duration?: number;
}

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

export interface RuntimeStats {
  cacheSize: number;
  insertedRuleCount: number;
  pendingElementCount: number;
  isObserving: boolean;
  isCompatLoaded: boolean;
}

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

// ─── Compiler API ─────────────────────────────────────────────────────────────

export interface CompilationContext {
  config: WindrunnerOptions;
  theme: ThemeConfig;
  screens: Record<string, string>;
  containers: Record<string, string>;
  plugins: any;
}

export interface ParsedClass {
  original: string;
  baseToken: string;
  variants: string[];
  breakpoint: string | null;
  containerBreakpoint: string | null;
  important: boolean;
  starting: boolean;
}

export function createWindrunner(options?: WindrunnerOptions): Runtime;

export function resolveRuntimeContext(options?: WindrunnerOptions): CompilationContext;

export function compileRuntimeClassNameWithContext(className: string, context: CompilationContext): string;

export function compileClass(className: string, options?: WindrunnerOptions): string;

export function parseClass(
  className: string,
  screens?: Record<string, string>,
  containers?: Record<string, string>
): ParsedClass | null;

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
 * // Server-side rendering
 * import { compileCriticalCss } from 'windrunner';
 * 
 * const css = compileCriticalCss([
 *   'flex items-center gap-4',
 *   'text-xl font-bold'
 * ]);
 * 
 * // Inject into HTML
 * const html = `<style>${css}</style>`;
 * ```
 */
export function compileCriticalCss(
  classNames: string | string[],
  options?: WindrunnerOptions
): string;

/**
 * Extract unique class names from HTML string.
 * Utility helper for compileCriticalCss.
 * 
 * @param html - HTML content to extract classes from
 * @returns Array of unique class names
 * 
 * @example
 * ```ts
 * import { extractClassNames, compileCriticalCss } from 'windrunner';
 * 
 * const html = '<div class="flex items-center">...</div>';
 * const classes = extractClassNames(html);
 * const css = compileCriticalCss(classes);
 * ```
 */
export function extractClassNames(html: string): string[];

// ─── Default Export ───────────────────────────────────────────────────────────

declare function windrunner(options?: WindrunnerOptions): Runtime;
export default windrunner;

