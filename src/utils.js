import defaultConfigOptions from "./config.js";

function isFunction(fn) {
  return fn && {}.toString.call(fn) === "[object Function]";
}

// ─── Config Options Cache ─────────────────────────────────────────────────────
// Cache resolved configs to prevent re-resolution on every createWindrunner() call
// Uses WeakMap for automatic garbage collection when options object is released

const configCache = new WeakMap();

// Default context for empty options (most common case in React apps)
let defaultContextCache = null;

// ─── Lazy Theme Resolution with Proxy ─────────────────────────────────────────
// Instead of resolving all theme keys upfront (33KB!), only resolve what's needed

function createLazyTheme(userTheme = {}, userThemeExtend = {}) {
  const resolved = new Map();
  const defaultTheme = defaultConfigOptions.theme;
  
  return new Proxy({}, {
    get(_, key) {
      // Return cached if already resolved
      if (resolved.has(key)) {
        return resolved.get(key);
      }
      
      // Resolve theme key on-demand
      let value = Object.prototype.hasOwnProperty.call(userTheme, key)
        ? userTheme[key]
        : defaultTheme[key];
      
      // If it's a function, call it with theme reference (recursive proxy)
      if (isFunction(value)) {
        value = value({
          theme: (keyRef) => {
            // Recursive lazy lookup
            if (resolved.has(keyRef)) return resolved.get(keyRef);
            // Resolve recursively (will also cache)
            return createLazyTheme(userTheme, userThemeExtend)[keyRef];
          },
        });
      }
      
      // Apply extend if exists
      if (userThemeExtend[key]) {
        value = Object.assign({}, value, userThemeExtend[key]);
      }
      
      // Cache and return
      resolved.set(key, value);
      return value;
    },
    
    has(_, key) {
      return key in defaultTheme || key in userTheme;
    },
    
    ownKeys(_) {
      // For Object.keys() etc - return all possible keys
      return [...new Set([...Object.keys(defaultTheme), ...Object.keys(userTheme)])];
    },
    
    getOwnPropertyDescriptor(_, key) {
      if (key in defaultTheme || key in userTheme) {
        return {
          enumerable: true,
          configurable: true,
        };
      }
    },
  });
}

export function getConfigOptions(options = {}, pluginKeys = []) {
  // Fast path: empty options (most common case)
  if (!options || (typeof options === 'object' && Object.keys(options).length === 0)) {
    if (!defaultContextCache) {
      defaultContextCache = {
        ...defaultConfigOptions,
        theme: createLazyTheme({}, {}),
      };
    }
    return defaultContextCache;
  }
  
  // Check cache for this specific options object
  if (configCache.has(options)) {
    return configCache.get(options);
  }
  
  const { theme = {} } = options;
  const { extend: themeExtend = {} } = theme;

  // Use lazy theme proxy instead of eager resolution
  const lazyTheme = createLazyTheme(theme, themeExtend);

  const config = {
    ...defaultConfigOptions,
    ...options,
    theme: lazyTheme,
  };
  
  // Cache for future calls
  configCache.set(options, config);
  
  return config;
}
