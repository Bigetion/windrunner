// ─── Plugin Types ─────────────────────────────────────────────────────────────

export interface PluginAPI {
  addUtility(pattern: string | RegExp, handler: string | ((match: RegExpMatchArray, theme: any) => string)): void;
  addUtilities(utilities: Record<string, string | ((match: RegExpMatchArray, theme: any) => string)>): void;
  addVariant(name: string, handler: (selector: string) => string): void;
  addVariants(variants: Record<string, (selector: string) => string>): void;
  theme(key?: string): any;
  config(): any;
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
  id?: string;
  autoStart?: boolean;
  preflight?: boolean;
  compatMode?: "none" | "full";
  compatStyleId?: string;
  compatGenerateCss?: (options: Record<string, any>) => string;
  theme?: Record<string, any>;
  plugins?: Plugin[];
  maxCacheSize?: number;
  onReady?: () => void;
  onError?: (className: string) => void;
  onCompile?: (className: string, cssRule: string) => void;
  [key: string]: any;
}

export interface RuntimeStats {
  cacheSize: number;
  insertedRuleCount: number;
  pendingElementCount: number;
  isObserving: boolean;
  isCompatLoaded: boolean;
}

export interface Runtime {
  processClassName(className: string): string | undefined;
  processClassList(classList: string | string[] | ArrayLike<string>): string[];
  processElement(el: Element | null): void;
  scan(root?: Document | Element): void;
  observe(root?: Element): void;
  flush(): void;
  start(): void;
  disconnect(): void;
  clearCache(): void;
  getStats(): RuntimeStats;
  isCompatLoaded(): boolean;
  getCacheSize(): number;
  getInsertedRuleCount(): number;
}

export function createWindrunner(options?: WindrunnerOptions): Runtime;
export function compileRuntimeClassNameWithContext(className: string, context: any): string;
export function compileClass(className: string, options?: any): string;
export function parseClass(className: string, screens?: Record<string,string>, containers?: Record<string,string>): { original: string; baseToken: string; variants: string[]; breakpoint: string | null; containerBreakpoint: string | null; important: boolean; starting: boolean } | null;

declare function windrunner(options?: WindrunnerOptions): Runtime;
export default windrunner;
