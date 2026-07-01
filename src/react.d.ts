/**
 * React integration types for Windrunner
 */

import type { RefObject, Context, ReactNode } from 'react';
import type { WindrunnerOptions, Runtime } from './index';

// ─── Hook Types ───────────────────────────────────────────────────────────────

/**
 * Main hook for Windrunner runtime in React apps
 * Creates and manages a Windrunner instance with automatic lifecycle handling
 */
export function useWindrunner(options?: WindrunnerOptions): Runtime | null;

/**
 * Hook for compiling individual class names to CSS
 * Useful for dynamic class generation or server-side rendering prep
 */
export function useCompileClass(options?: WindrunnerOptions): (className: string) => string;

/**
 * Hook for processing and compiling a list of class names
 * Automatically triggers compilation for all classes in the list
 */
export function useClassList(
  classList: string | string[],
  options?: WindrunnerOptions
): string[];

/**
 * Hook for scanning a specific element and its children for class names
 * Useful for portals, dynamic content, or third-party components
 */
export function useScanElement(
  elementRef: RefObject<HTMLElement>,
  options?: WindrunnerOptions
): void;

// ─── Context Provider Types ───────────────────────────────────────────────────

export interface WindrunnerProviderProps extends WindrunnerOptions {
  children: ReactNode;
}

/**
 * Optional context provider for Windrunner
 * Useful if you want to share a single Windrunner instance across your app
 */
export function WindrunnerProvider(props: WindrunnerProviderProps): JSX.Element;

/**
 * Hook to access Windrunner instance from context
 * Only works inside WindrunnerProvider
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
