/**
 * Plugin system for Windrunner
 * Allows users to add custom utilities and variants
 */

// ─── Plugin Registry ──────────────────────────────────────────────────────────

export class PluginRegistry {
  constructor() {
    this.utilities = new Map();
    this.variants = new Map();
  }

  /**
   * Register a custom utility
   * @param {string|RegExp} pattern - Class name pattern (e.g., "glass" or /^glass-(.+)$/)
   * @param {Function|string} handler - Function that returns CSS or CSS string
   */
  addUtility(pattern, handler) {
    this.utilities.set(pattern, handler);
  }

  /**
   * Register multiple utilities at once
   * @param {Object} utilities - Object mapping patterns to handlers
   */
  addUtilities(utilities) {
    Object.entries(utilities).forEach(([pattern, handler]) => {
      this.addUtility(pattern, handler);
    });
  }

  /**
   * Register a custom variant
   * @param {string} name - Variant name (e.g., "parent-hover")
   * @param {Function} handler - Function that transforms selector
   */
  addVariant(name, handler) {
    this.variants.set(name, handler);
  }

  /**
   * Register multiple variants at once
   * @param {Object} variants - Object mapping names to handlers
   */
  addVariants(variants) {
    Object.entries(variants).forEach(([name, handler]) => {
      this.addVariant(name, handler);
    });
  }

  /**
   * Check if a token matches any custom utility pattern
   * @param {string} token - The base token to match
   * @returns {Object|null} - { handler, match } or null
   */
  matchUtility(token) {
    for (const [pattern, handler] of this.utilities) {
      if (pattern instanceof RegExp) {
        const match = pattern.exec(token);
        if (match) {
          return { handler, match };
        }
      } else if (pattern === token) {
        return { handler, match: [token] };
      }
    }
    return null;
  }

  /**
   * Check if a variant name matches any custom variant
   * @param {string} variantName - The variant to check
   * @returns {Function|null} - Handler function or null
   */
  matchVariant(variantName) {
    return this.variants.get(variantName) || null;
  }

  /**
   * Get all registered utility patterns (for debugging)
   */
  getUtilities() {
    return Array.from(this.utilities.keys());
  }

  /**
   * Get all registered variant names (for debugging)
   */
  getVariants() {
    return Array.from(this.variants.keys());
  }

  /**
   * Clear all registered plugins
   */
  clear() {
    this.utilities.clear();
    this.variants.clear();
  }
}

// ─── Plugin Helper Functions ──────────────────────────────────────────────────

/**
 * Create a plugin definition
 * @param {Function} handler - Plugin setup function
 * @returns {Object} - Plugin object
 */
export function plugin(handler) {
  if (typeof handler !== 'function') {
    throw new Error('Plugin handler must be a function');
  }
  
  return {
    __isWindrunnerPlugin: true,
    handler,
  };
}

/**
 * Check if an object is a valid plugin
 * @param {*} obj - Object to check
 * @returns {boolean}
 */
export function isPlugin(obj) {
  return obj && obj.__isWindrunnerPlugin === true && typeof obj.handler === 'function';
}

// ─── Utility Builder Helpers ──────────────────────────────────────────────────

/**
 * Helper to create utilities from a simple object
 * @param {Object} definitions - { className: cssDeclaration }
 * @returns {Object} - Utilities object for addUtilities
 */
export function defineUtilities(definitions) {
  const utilities = {};
  
  Object.entries(definitions).forEach(([className, css]) => {
    utilities[className] = typeof css === 'string' 
      ? css 
      : objectToCss(css);
  });
  
  return utilities;
}

/**
 * Helper to create responsive utilities
 * @param {string} base - Base class name
 * @param {Object} values - { key: cssValue }
 * @param {Function} toDeclaration - (key, value) => cssDeclaration
 * @returns {Object} - Utilities object
 */
export function defineResponsiveUtilities(base, values, toDeclaration) {
  const utilities = {};
  
  Object.entries(values).forEach(([key, value]) => {
    const className = key === 'DEFAULT' ? base : `${base}-${key}`;
    utilities[className] = toDeclaration(key, value);
  });
  
  return utilities;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function objectToCss(obj) {
  return Object.entries(obj)
    .map(([prop, value]) => `${prop}: ${value};`)
    .join(' ');
}

// ─── Default Export ───────────────────────────────────────────────────────────

export default {
  PluginRegistry,
  plugin,
  isPlugin,
  defineUtilities,
  defineResponsiveUtilities,
};
