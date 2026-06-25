export interface WindrunnerOptions {
  id?: string;
  autoStart?: boolean;
  preflight?: boolean;
  compatMode?: "none" | "full";
  compatStyleId?: string;
  compatGenerateCss?: (options: Record<string, any>) => string;
  theme?: Record<string, any>;
  onReady?: () => void;
  [key: string]: any;
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
