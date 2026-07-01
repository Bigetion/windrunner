/**
 * React integration for Windrunner
 * Provides hooks and utilities for seamless React usage
 * 
 * Usage:
 *   import { useWindrunner, useCompileClass } from 'windrunner/react';
 */

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { createWindrunner } from './runtime.js';
import { compileClass } from './compiler.js';

// ─── useWindrunner Hook ───────────────────────────────────────────────────────

/**
 * Main hook for Windrunner runtime in React apps
 * Creates and manages a Windrunner instance with automatic lifecycle handling
 * 
 * @param {object} options - Windrunner configuration options
 * @returns {object} - Runtime instance with methods
 * 
 * @example
 * function App() {
 *   const windrunner = useWindrunner({
 *     theme: { colors: { brand: '#ff0000' } },
 *     onReady: () => console.log('Windrunner ready!')
 *   });
 *   
 *   return <div className="flex items-center">Hello</div>;
 * }
 */
export function useWindrunner(options = {}) {
  const runtimeRef = useRef(null);
  const isStartedRef = useRef(false);
  
  // Memoize options to prevent unnecessary re-initialization
  // Use JSON.stringify for deep comparison (simple but effective for config objects)
  const optionsKey = useMemo(
    () => JSON.stringify(options),
    [options]
  );
  
  // Initialize runtime once
  useEffect(() => {
    if (!runtimeRef.current) {
      runtimeRef.current = createWindrunner({
        autoStart: false, // We'll start manually
        ...options,
      });
    }
    
    // Start observing on mount
    if (!isStartedRef.current && runtimeRef.current) {
      runtimeRef.current.start();
      isStartedRef.current = true;
    }
    
    // Cleanup on unmount
    return () => {
      if (runtimeRef.current) {
        runtimeRef.current.disconnect();
        isStartedRef.current = false;
      }
    };
  }, [optionsKey]); // Re-initialize if options change
  
  // Return stable reference
  return runtimeRef.current;
}

// ─── useCompileClass Hook ─────────────────────────────────────────────────────

/**
 * Hook for compiling individual class names to CSS
 * Useful for dynamic class generation or server-side rendering prep
 * 
 * @param {object} options - Windrunner configuration options
 * @returns {function} - Compiler function (className: string) => cssRule: string
 * 
 * @example
 * function DynamicComponent({ color }) {
 *   const compile = useCompileClass();
 *   const dynamicClass = `bg-${color}-500`;
 *   const css = compile(dynamicClass);
 *   
 *   return <div className={dynamicClass}>Dynamic color</div>;
 * }
 */
export function useCompileClass(options = {}) {
  // Memoize compiler function
  const compile = useCallback(
    (className) => compileClass(className, options),
    [JSON.stringify(options)]
  );
  
  return compile;
}

// ─── useClassList Hook ────────────────────────────────────────────────────────

/**
 * Hook for processing and compiling a list of class names
 * Automatically triggers compilation for all classes in the list
 * 
 * @param {string|string[]} classList - Class names to process
 * @param {object} options - Windrunner configuration options
 * @returns {string[]} - Array of compiled CSS rules
 * 
 * @example
 * function Component() {
 *   const classes = useClassList(['flex', 'items-center', 'gap-4']);
 *   // Classes are automatically compiled and injected
 *   
 *   return <div className="flex items-center gap-4">Content</div>;
 * }
 */
export function useClassList(classList, options = {}) {
  const windrunner = useWindrunner(options);
  
  const cssRules = useMemo(() => {
    if (!windrunner) return [];
    return windrunner.processClassList(classList);
  }, [windrunner, Array.isArray(classList) ? classList.join(' ') : classList]);
  
  return cssRules;
}

// ─── useScanElement Hook ──────────────────────────────────────────────────────

/**
 * Hook for scanning a specific element and its children for class names
 * Useful for portals, dynamic content, or third-party components
 * 
 * @param {React.RefObject} elementRef - React ref to the element to scan
 * @param {object} options - Windrunner configuration options
 * 
 * @example
 * function Portal() {
 *   const portalRef = useRef(null);
 *   useScanElement(portalRef);
 *   
 *   return (
 *     <div ref={portalRef}>
 *       <div className="flex items-center">Portal content</div>
 *     </div>
 *   );
 * }
 */
export function useScanElement(elementRef, options = {}) {
  const windrunner = useWindrunner(options);
  
  useEffect(() => {
    if (!windrunner || !elementRef.current) return;
    
    // Scan the element immediately
    windrunner.scan(elementRef.current);
    
    // Optionally observe for changes
    windrunner.observe(elementRef.current);
    
    return () => {
      // Cleanup is handled by useWindrunner
    };
  }, [windrunner, elementRef]);
}

// ─── WindrunnerProvider Component (Optional) ──────────────────────────────────

/**
 * Optional context provider for Windrunner
 * Useful if you want to share a single Windrunner instance across your app
 * Note: Most apps don't need this - useWindrunner handles singleton internally
 * 
 * @example
 * import { WindrunnerProvider } from 'windrunner/react';
 * 
 * function App() {
 *   return (
 *     <WindrunnerProvider theme={{ colors: { brand: '#ff0000' } }}>
 *       <YourApp />
 *     </WindrunnerProvider>
 *   );
 * }
 */
import { createContext, useContext } from 'react';

const WindrunnerContext = createContext(null);

export function WindrunnerProvider({ children, ...options }) {
  const runtime = useWindrunner(options);
  
  return (
    <WindrunnerContext.Provider value={runtime}>
      {children}
    </WindrunnerContext.Provider>
  );
}

/**
 * Hook to access Windrunner instance from context
 * Only works inside WindrunnerProvider
 */
export function useWindrunnerContext() {
  const runtime = useContext(WindrunnerContext);
  
  if (!runtime) {
    throw new Error('useWindrunnerContext must be used within WindrunnerProvider');
  }
  
  return runtime;
}

// ─── Export All ───────────────────────────────────────────────────────────────

export default {
  useWindrunner,
  useCompileClass,
  useClassList,
  useScanElement,
  WindrunnerProvider,
  useWindrunnerContext,
};
