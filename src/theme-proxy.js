/**
 * Theme Proxy Layer for Lazy Resolution
 * 
 * This module provides lazy theme materialization using JavaScript Proxy objects.
 * Theme values (especially large color palettes) are only resolved when first accessed,
 * reducing initial bundle parse time and memory footprint.
 * 
 * @module theme-proxy
 */

/**
 * Create a lazy theme proxy that materializes theme values on first access
 * 
 * @param {Object} themeDefinition - Raw theme definition with function values
 * @returns {Proxy} - Proxied theme object
 * 
 * @example
 * const theme = createLazyTheme({
 *   colors: { blue: { 500: 'oklch(...)' } },
 *   backgroundColor: ({ theme }) => theme('colors')
 * });
 * 
 * // colors not materialized yet
 * const bgColors = theme.backgroundColor; // Materializes backgroundColor and colors
 */
export function createLazyTheme(themeDefinition) {
  const materializedCache = new Map();
  const resolving = new Set(); // Circular dependency detection
  const handlerSymbol = Symbol.for('windrunner.theme.handler');
  
  /**
   * Resolve a theme value, handling function references
   * 
   * @param {string} key - Theme property key
   * @param {*} value - Raw theme value (may be function or primitive)
   * @param {Proxy} theme - The proxied theme object for recursive lookups
   * @returns {*} - Resolved theme value
   */
  function resolveThemeValue(key, value, theme) {
    // Primitive values don't need resolution
    if (typeof value !== 'function') return value;
    
    // Detect circular dependencies
    if (resolving.has(key)) {
      throw new Error(`Circular theme dependency detected: ${key}`);
    }
    
    resolving.add(key);
    try {
      // Resolve function with theme accessor
      const resolved = value({ 
        theme: (path) => {
          // Handle nested path access (e.g., 'colors' or 'spacing.4')
          const parts = path.split('.');
          let result = theme[parts[0]];
          for (let i = 1; i < parts.length; i++) {
            result = result?.[parts[i]];
          }
          return result;
        }
      });
      resolving.delete(key);
      return resolved;
    } catch (error) {
      resolving.delete(key);
      throw error;
    }
  }
  
  const handler = {
    get(target, prop) {
      // Handle Symbol property for stats introspection
      if (prop === handlerSymbol) {
        return { cache: materializedCache, resolving, target: themeDefinition };
      }
      
      // Return from cache if already materialized
      if (materializedCache.has(prop)) {
        return materializedCache.get(prop);
      }
      
      // Materialize on first access
      if (prop in target) {
        const value = resolveThemeValue(prop, target[prop], proxy);
        materializedCache.set(prop, value);
        return value;
      }
      
      return undefined;
    },
    
    has(target, prop) {
      return prop in target;
    },
    
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    
    getOwnPropertyDescriptor(target, prop) {
      // Make properties appear enumerable for Object.keys() and spreading
      if (prop in target) {
        return {
          enumerable: true,
          configurable: true
        };
      }
      return undefined;
    }
  };
  
  const proxy = new Proxy(themeDefinition, handler);
  
  return proxy;
}

/**
 * Create a lazy color palette that tracks loaded color families
 * 
 * This provides observability into which color families are actually used,
 * enabling potential future tree-shaking optimizations.
 * 
 * @param {Object} colorDefinition - Raw color palette object
 * @returns {Proxy} - Proxied color palette
 * 
 * @example
 * const colors = createLazyColorPalette({
 *   blue: { 500: 'oklch(...)' },
 *   red: { 500: 'oklch(...)' }
 * });
 * 
 * const blue500 = colors.blue[500]; // Marks 'blue' as loaded
 */
export function createLazyColorPalette(colorDefinition) {
  const loadedFamilies = new Set();
  const familiesSymbol = Symbol.for('windrunner.colors.loadedFamilies');
  const targetSymbol = Symbol.for('windrunner.colors.target');
  
  const handler = {
    get(target, prop) {
      // Handle Symbol properties for stats introspection
      if (prop === familiesSymbol) {
        return loadedFamilies;
      }
      if (prop === targetSymbol) {
        return colorDefinition;
      }
      
      if (prop in target) {
        // Mark this color family as loaded for analytics
        if (!loadedFamilies.has(prop) && typeof target[prop] === 'object' && target[prop] !== null) {
          loadedFamilies.add(prop);
        }
        return target[prop];
      }
      return undefined;
    },
    
    has(target, prop) {
      return prop in target;
    },
    
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    }
  };
  
  return new Proxy(colorDefinition, handler);
}

/**
 * Get statistics about theme materialization
 * 
 * @param {Proxy} theme - The proxied theme object
 * @returns {Object|null} - Stats object or null if not a proxy
 * @returns {number} returns.materializedKeys - Number of theme keys materialized
 * @returns {number} returns.totalKeys - Total number of theme keys
 * @returns {number} returns.materializationRate - Percentage of keys materialized (0-1)
 * 
 * @example
 * const stats = getThemeStats(theme);
 * console.log(`Materialized ${stats.materializedKeys}/${stats.totalKeys} theme keys`);
 * console.log(`Materialization rate: ${(stats.materializationRate * 100).toFixed(1)}%`);
 */
export function getThemeStats(theme) {
  if (!theme || typeof theme !== 'object') return null;
  
  // Access internal cache via symbol
  const handlerSymbol = Symbol.for('windrunner.theme.handler');
  const handler = theme[handlerSymbol];
  
  if (handler && handler.cache && handler.target) {
    // Count only string keys from the original target, not the symbol
    const totalKeys = Object.keys(handler.target).length;
    const materializedKeys = handler.cache.size;
    
    return {
      materializedKeys,
      totalKeys,
      materializationRate: totalKeys > 0 ? materializedKeys / totalKeys : 0
    };
  }
  
  return null;
}

/**
 * Get statistics about color palette usage
 * 
 * @param {Proxy} colors - The proxied colors object
 * @returns {Object|null} - Stats object or null if not a proxy
 * @returns {string[]} returns.loadedFamilies - Array of color family names that were accessed
 * @returns {number} returns.totalFamilies - Total number of color families available
 * @returns {number} returns.usageRate - Percentage of families accessed (0-1)
 * 
 * @example
 * const stats = getColorStats(theme.colors);
 * console.log(`Used ${stats.loadedFamilies.length}/${stats.totalFamilies} color families`);
 * console.log(`Families used: ${stats.loadedFamilies.join(', ')}`);
 */
export function getColorStats(colors) {
  if (!colors || typeof colors !== 'object') return null;
  
  // Access internal loaded families via symbol
  const familiesSymbol = Symbol.for('windrunner.colors.loadedFamilies');
  const targetSymbol = Symbol.for('windrunner.colors.target');
  const loadedFamilies = colors[familiesSymbol];
  const target = colors[targetSymbol];
  
  if (loadedFamilies && target) {
    const totalFamilies = Object.keys(target).length;
    
    return {
      loadedFamilies: Array.from(loadedFamilies),
      totalFamilies,
      usageRate: totalFamilies > 0 ? loadedFamilies.size / totalFamilies : 0
    };
  }
  
  return null;
}
