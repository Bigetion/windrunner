/**
 * React integration types for Windrunner
 * Provides type-safe hooks and components for React applications.
 */

import type { RefObject, ReactNode } from 'react';
import type { WindrunnerOptions, Runtime } from './index';

// ─── Hook Return Types ────────────────────────────────────────────────────────

/**
 * Return type for the useWindrunner hook.
 * The runtime is always available (created eagerly via useRef).
 */
export type UseWindrunnerReturn = Runtime | null;

/**
 * Compiler function type returned by useCompileClass.
 */
export type CompileClassFn = (className: string) => string;

// ─── Hook Types ───────────────────────────────────────────────────────────────

/**
 * Main hook for Windrunner runtime in React apps.
 * Creates and manages a Windrunner instance with automatic lifecycle handling.
 * Safe for use in React StrictMode (handles double-mounting correctly).
 *
 * @param options - Windrunner configuration options
 * @returns Runtime instance (null only during SSR without DOM)
 *
 * @example
 * ```tsx
 * function App() {
 *   const windrunner = useWindrunner({
 *     theme: { colors: { brand: '#ff0000' } },
 *     onReady: () => console.log('Windrunner ready!')
 *   });
 *   return <div className="flex items-center">Hello</div>;
 * }
 * ```
 */
export function useWindrunner(options?: WindrunnerOptions): UseWindrunnerReturn;

/**
 * Hook for compiling individual class names to CSS.
 * Useful for dynamic class generation or server-side rendering prep.
 *
 * @param options - Windrunner configuration options
 * @returns Compiler function that takes a class name and returns CSS rule string
 */
export function useCompileClass(options?: WindrunnerOptions): CompileClassFn;

/**
 * Hook for processing and compiling a list of class names.
 * Automatically triggers compilation for all classes in the list.
 *
 * @param classList - Class names to process (string or array)
 * @param options - Windrunner configuration options
 * @returns Array of compiled CSS rule strings
 */
export function useClassList(
  classList: string | string[],
  options?: WindrunnerOptions
): string[];

/**
 * Hook for scanning a specific element and its children for class names.
 * Useful for portals, dynamic content, or third-party components.
 *
 * @param elementRef - React ref to the element to scan
 * @param options - Windrunner configuration options
 */
export function useScanElement(
  elementRef: RefObject<HTMLElement | null>,
  options?: WindrunnerOptions
): void;

// ─── Context Provider Types ───────────────────────────────────────────────────

/**
 * Props for the WindrunnerProvider component.
 * Extends WindrunnerOptions with React-specific props.
 */
export interface WindrunnerProviderProps extends WindrunnerOptions {
  /** React children to render within the provider */
  children: ReactNode;
}

/**
 * Optional context provider for Windrunner.
 * Shares a single Windrunner instance across the component tree.
 *
 * @example
 * ```tsx
 * import { WindrunnerProvider } from 'windrunner/react';
 *
 * function App() {
 *   return (
 *     <WindrunnerProvider theme={{ colors: { brand: '#ff0000' } }}>
 *       <YourApp />
 *     </WindrunnerProvider>
 *   );
 * }
 * ```
 */
export function WindrunnerProvider(props: WindrunnerProviderProps): JSX.Element;

/**
 * Hook to access Windrunner instance from context.
 * Must be used within a WindrunnerProvider.
 *
 * @throws Error if used outside WindrunnerProvider
 * @returns The Windrunner runtime instance from context
 */
export function useWindrunnerContext(): Runtime;

// ─── Default Export ───────────────────────────────────────────────────────────

declare const reactIntegration: {
  useWindrunner: typeof useWindrunner;
  useCompileClass: typeof useCompileClass;
  useClassList: typeof useClassList;
  useScanElement: typeof useScanElement;
  WindrunnerProvider: typeof WindrunnerProvider;
  useWindrunnerContext: typeof useWindrunnerContext;
};

export default reactIntegration;
