import {
  resolveRuntimeContext,
  getBaseTailwindOptions,
  compileRuntimeClassNameWithContext,
  parseClass,
} from "./compiler.js";
import preflightCss from "./preflight.js";
import { FOUCManager } from "./fouc-manager.js";
import { ErrorReasons, createErrorContext, createWarningContext } from "./types.js";

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function injectPreflight(styleId) {
  if (typeof document !== "object") return;
  const prefId = `${styleId}-preflight`;
  const escapedId = prefId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  if (document.querySelector(`style[data-tailwind-preflight="${escapedId}"]`)) return;
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.setAttribute("data-tailwind-preflight", prefId);
  style.appendChild(document.createTextNode(preflightCss));
  const head = document.head || document.getElementsByTagName("head")[0];
  // insert before any other styles so JIT rules take priority
  head.insertBefore(style, head.firstChild);
}

function findOrCreateRuntimeStyle(id) {
  if (typeof document !== "object") return null;

  const escapedId = String(id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const existing = document.querySelector(`style[data-tailwind-runtime="${escapedId}"]`);
  if (existing) return existing;

  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.setAttribute("data-tailwind-runtime", id);
  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(style);
  return style;
}

// ─── Observer Registry (WeakMap-based tracking) ───────────────────────────────
// Global WeakMap to track active observers by DOM root element.
// Prevents duplicate observers when React StrictMode double-mounts components.
// WeakMap allows GC of DOM nodes that are removed from the document.
const observerRegistry = new WeakMap();

// Export for testing purposes
export { observerRegistry as _observerRegistry, getAdaptiveCacheSize as _getAdaptiveCacheSize };

// ─── Runtime factory ──────────────────────────────────────────────────────────

/**
 * Determine adaptive cache size based on device memory.
 * When navigator.deviceMemory is available and reports < 4 GB,
 * reduce default cache sizes by 50%.
 * 
 * @param {number} requestedSize - The user-configured or default max cache size
 * @returns {number} - Adjusted cache size
 */
function getAdaptiveCacheSize(requestedSize) {
  if (typeof navigator !== "undefined" && navigator.deviceMemory && navigator.deviceMemory < 4) {
    return Math.floor(requestedSize / 2);
  }
  return requestedSize;
}

/**
 * Create a windrunner JIT runtime instance with full manual control.
 *
 * @param {{ id?: string, autoStart?: boolean, compatMode?: string, theme?: object } & object} options
 */
export function createWindrunner(options = {}) {
  const styleId       = options.id            || "tailwind-runtime-css";
  const preflight     = options.preflight !== false; // default: true
  const compatMode    = options.compatMode    || "none";
  const compatStyleId = options.compatStyleId || `${styleId}-full`;
  const maxCacheSize  = getAdaptiveCacheSize(options.maxCacheSize || 10000);
  const mode          = options.mode          || "runtime";
  const precompiled   = options.precompiled || mode === "hybrid" || false;
  const debug         = options.debug         || false;
  const strict        = options.strict        || false;
  const onError       = typeof options.onError === "function" ? options.onError : null;
  const onWarning     = typeof options.onWarning === "function" ? options.onWarning : null;
  const onCompile     = typeof options.onCompile === "function" ? options.onCompile : null;
  const tailwindOptions = getBaseTailwindOptions(options);
  const context = resolveRuntimeContext(tailwindOptions);

  const cache          = new Map();
  const insertedRules  = new Set();
  const existingSelectors = new Set();
  const pendingElements = new Set();

  let observer       = null;
  let observerRoot   = null; // DOM root being observed (for registry tracking)
  let scheduled      = false;
  let styleElement   = null;
  let domReadyHandler = null;
  let compatLoaded   = false;
  let precompiledScanned = false;
  
  // ── Observability tracking ─────────────────────────────────────────────────
  const compileAttempts = new Map();  // className -> attempt count
  const failedClasses   = new Map();  // className -> failure count
  const compileTimes    = [];         // Rolling window of compile durations (ms)
  const maxCompileTimes = 100;        // Keep last 100 measurements
  let totalCompiles     = 0;
  let cacheHits         = 0;

  // Initialize FOUC manager with user config
  const foucManager = new FOUCManager(options.fouc, styleId);

  /**
   * Emit a warning via the onWarning callback.
   * Warnings are for recoverable issues that don't prevent compilation.
   * 
   * @param {string} message - Warning description
   * @param {'low'|'medium'|'high'} severity - Severity level
   * @param {Object} [extra] - Additional context properties
   */
  const warn = (message, severity, extra = {}) => {
    if (!onWarning) return;
    const context = createWarningContext(message, severity, extra);
    onWarning(message, context);
  };

  /**
   * Extract selector from a CSS rule string
   * Handles simple selectors, media queries, and container queries
   */
  const extractSelectorFromRule = (rule) => {
    if (!rule || typeof rule !== "string") return null;
    
    // Match first selector before opening brace
    // Handles: .class { ... }, @media(...) { .class { ... } }
    const match = rule.match(/([^{]+)\{/);
    if (!match) return null;
    
    let selector = match[1].trim();
    
    // If rule starts with @media, @container, @supports, extract inner selector
    if (selector.startsWith('@')) {
      const innerMatch = rule.match(/\{[^{]*([^{]+)\{/);
      if (innerMatch) {
        selector = innerMatch[1].trim();
      }
    }
    
    return selector;
  };

  /**
   * Load existing CSS rules from the style element
   * In precompiled mode, also scan all stylesheets for precompiled rules
   */
  const loadExistingRules = (style) => {
    // Load from runtime style element first
    if (style && style.sheet) {
      try {
        const rules = style.sheet.cssRules || [];
        for (let i = 0; i < rules.length; i += 1) {
          const ruleText = rules[i].cssText;
          insertedRules.add(ruleText);
          
          // Extract selector for precompiled mode checking
          if (precompiled) {
            const selector = extractSelectorFromRule(ruleText);
            if (selector) {
              existingSelectors.add(selector);
            }
          }
        }
      } catch {
        // ignore unavailable stylesheet access
      }
    }
    
    // In precompiled mode, scan all stylesheets once for existing rules
    if (precompiled && !precompiledScanned && typeof document === "object") {
      precompiledScanned = true;
      
      try {
        const stylesheets = document.styleSheets;
        for (let i = 0; i < stylesheets.length; i += 1) {
          const stylesheet = stylesheets[i];
          
          // Skip our own runtime stylesheet to avoid duplication
          if (stylesheet.ownerNode && 
              stylesheet.ownerNode.getAttribute &&
              stylesheet.ownerNode.getAttribute('data-tailwind-runtime') === styleId) {
            continue;
          }
          
          try {
            const rules = stylesheet.cssRules || stylesheet.rules || [];
            for (let j = 0; j < rules.length; j += 1) {
              const rule = rules[j];
              
              // Handle regular style rules
              if (rule.selectorText) {
                existingSelectors.add(rule.selectorText);
              }
              
              // Handle media/container queries
              if (rule.cssRules || rule.rules) {
                const nestedRules = rule.cssRules || rule.rules;
                for (let k = 0; k < nestedRules.length; k += 1) {
                  if (nestedRules[k].selectorText) {
                    existingSelectors.add(nestedRules[k].selectorText);
                  }
                }
              }
            }
          } catch {
            // Cross-origin or restricted stylesheet access - skip it
          }
        }
      } catch {
        // If any error occurs during scanning, continue without precompiled mode
      }
    }
  };

  // ── compat fallback ────────────────────────────────────────────────────────

  const ensureCompatStyle = () => {
    if (compatMode !== "full") return false;
    if (compatLoaded) return true;
    if (typeof document !== "object") return false;
    if (typeof options.compatGenerateCss !== "function") return false;

    const escapedCompatId = String(compatStyleId).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const existing = document.querySelector(`style[data-tailwind-runtime-compat="${escapedCompatId}"]`);
    if (existing) { compatLoaded = true; return true; }

    const cssText = options.compatGenerateCss(tailwindOptions);
    if (typeof cssText !== "string" || !cssText.trim()) return false;

    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-tailwind-runtime-compat", compatStyleId);
    style.appendChild(document.createTextNode(cssText));
    const head = document.head || document.getElementsByTagName("head")[0];
    head.appendChild(style);
    compatLoaded = true;
    return true;
  };

  // ── compile + inject ───────────────────────────────────────────────────────

  /**
   * LRU cache get: move entry to end (most recently used) on access
   */
  const cacheGet = (key) => {
    if (!cache.has(key)) return undefined;
    const value = cache.get(key);
    // Move to end by re-inserting (makes it most recently used)
    cache.delete(key);
    cache.set(key, value);
    return value;
  };

  const compileWithCache = (className) => {
    if (cache.has(className)) {
      // LRU: move to end on access
      return cacheGet(className);
    }
    const cssRule = compileRuntimeClassNameWithContext(className, context);
    // LRU eviction: remove least recently used entry when cache exceeds max size
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
      warn(
        `Cache eviction triggered (max size: ${maxCacheSize}). Consider increasing maxCacheSize if this happens frequently.`,
        'low',
        { className }
      );
    }
    cache.set(className, cssRule);
    return cssRule;
  };

  const insertRule = (rule) => {
    if (!rule || insertedRules.has(rule)) return;
    if (typeof document !== "object") return;
    if (!styleElement) styleElement = findOrCreateRuntimeStyle(styleId);
    if (styleElement) loadExistingRules(styleElement);
    if (insertedRules.has(rule)) return;
    
    // In precompiled mode, check if selector already exists in any stylesheet
    if (precompiled && existingSelectors.size > 0) {
      const selector = extractSelectorFromRule(rule);
      if (selector && existingSelectors.has(selector)) {
        // Selector already exists in precompiled CSS, skip insertion
        // But track it in insertedRules to avoid reprocessing
        insertedRules.add(rule);
        return;
      }
    }
    
    insertedRules.add(rule);
    if (!styleElement || !styleElement.sheet) return;
    try {
      styleElement.sheet.insertRule(rule, styleElement.sheet.cssRules.length);
    } catch {
      styleElement.appendChild(document.createTextNode(`${rule}\n`));
    }
  };

  // ── public methods ─────────────────────────────────────────────────────────

  const processClassName = (className) => {
    const startTime = debug && typeof performance !== "undefined" ? performance.now() : 0;
    
    // Track compile attempts
    totalCompiles++;
    compileAttempts.set(className, (compileAttempts.get(className) || 0) + 1);
    
    // Check cache — track hits for observability (LRU: moves to end on access)
    if (cache.has(className)) {
      cacheHits++;
      
      if (debug) {
        const elapsed = typeof performance !== "undefined" ? performance.now() - startTime : 0;
        console.log(`[Windrunner] Cache hit: "${className}" (${elapsed.toFixed(3)}ms)`);
      }
      
      const cached = cacheGet(className);
      if (cached) insertRule(cached);
      return cached;
    }
    
    // Cache miss — compile
    if (debug) {
      console.log(`[Windrunner] Cache miss: "${className}"`);
    }
    
    const cssRule = compileWithCache(className);
    
    if (!cssRule) {
      // Track failure
      failedClasses.set(className, (failedClasses.get(className) || 0) + 1);
      
      if (debug) {
        console.error(`[Windrunner] Compile failed: "${className}"`);
      }
      
      ensureCompatStyle();
      
      // Determine the specific error reason
      const parsed = parseClass(className, context.screens, context.containers);
      let reason = ErrorReasons.PARSE_ERROR;
      let unknownVariants;
      
      if (parsed) {
        reason = ErrorReasons.UNKNOWN_UTILITY;
      }
      
      // Override reason for lite mode excluded utilities
      if (options.__LITE_MODE__) {
        reason = ErrorReasons.LITE_MODE_EXCLUDED;
      }
      
      const errorContext = createErrorContext(className, reason, {
        baseToken: parsed ? parsed.baseToken : className,
        variants: parsed ? parsed.variants : undefined,
        unknownVariants,
        parseResult: parsed || undefined,
        compileAttempt: compileAttempts.get(className),
        stack: debug ? new Error().stack : undefined,
        details: parsed
          ? `Could not compile utility "${parsed.baseToken}"${parsed.variants.length ? ` with variants: ${parsed.variants.join(', ')}` : ''}`
          : `Failed to parse class name "${className}"`,
      });
      
      // In strict mode, throw instead of silently skipping
      if (strict) {
        throw new Error(
          `[Windrunner] Failed to compile class: "${className}" (reason: ${reason})`
        );
      }
      
      if (onError) {
        onError(className, errorContext);
      }
    } else {
      insertRule(cssRule);
      if (onCompile) onCompile(className, cssRule);
      
      if (debug) {
        const elapsed = typeof performance !== "undefined" ? performance.now() - startTime : 0;
        // Track compile time in rolling window
        compileTimes.push(elapsed);
        if (compileTimes.length > maxCompileTimes) {
          compileTimes.shift();
        }
        console.log(`[Windrunner] Compiled: "${className}" (${elapsed.toFixed(3)}ms)`);
      }
    }
    
    return cssRule;
  };

  const processElement = (element) => {
    if (!element || !element.classList) return;
    element.classList.forEach((className) => processClassName(className));
  };

  const processElementTree = (element) => {
    if (!element || element.nodeType !== 1) return;
    processElement(element);
    const children = element.querySelectorAll ? element.querySelectorAll("[class]") : [];
    children.forEach((child) => processElement(child));
  };

  const queueElementForProcessing = (element) => {
    if (!element || element.nodeType !== 1) return;
    if (element.classList && element.classList.length > 0) {
      pendingElements.add(element);
      return;
    }

    if (element.querySelectorAll && element.querySelectorAll("[class]").length > 0) {
      pendingElements.add(element);
    }
  };

  const processClassList = (classList) => {
    if (!classList) return [];

    const values = typeof classList === "string"
      ? classList.split(/\s+/)
      : Array.isArray(classList)
        ? classList
        : typeof classList === "object" && typeof classList.forEach === "function"
          ? Array.from(classList)
          : [];

    return values
      .filter((item) => typeof item === "string" && item.length > 0)
      .map((item) => processClassName(item))
      .filter(Boolean);
  };

  const scan = (root = document) => {
    if (typeof document !== "object" || !root) return;

    // Track scan stats
    const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();
    const scannedElements = new Set();
    const foundClasses = new Set();
    const initialRuleCount = insertedRules.size;

    const elements = [];
    if (root.nodeType === 1 && root.hasAttribute && root.hasAttribute("class")) {
      elements.push(root);
    }

    if (root.querySelectorAll) {
      const matched = root.querySelectorAll("[class]");
      for (let i = 0; i < matched.length; i += 1) {
        if (matched[i] !== root) {
          elements.push(matched[i]);
        }
      }
    }

    elements.forEach((element) => {
      processElement(element);
      scannedElements.add(element);
      if (element.classList) {
        element.classList.forEach((cls) => foundClasses.add(cls));
      }
    });

    // Calculate stats and fire callback
    if (typeof options.onScanComplete === "function") {
      const endTime = typeof performance !== "undefined" ? performance.now() : Date.now();
      const stats = {
        elementCount: scannedElements.size,
        classCount: foundClasses.size,
        ruleCount: insertedRules.size - initialRuleCount,
        duration: endTime - startTime,
      };
      
      // Fire callback asynchronously to not block rendering
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => options.onScanComplete(stats));
      } else {
        setTimeout(() => options.onScanComplete(stats), 0);
      }
    }
  };

  const MICROTASK_BATCH_THRESHOLD = 100;

  const flushQueue = () => {
    scheduled = false;
    
    // If we have more than the threshold, process in microtask batches
    // to avoid blocking the main thread for large DOM mutations
    if (pendingElements.size > MICROTASK_BATCH_THRESHOLD) {
      const elements = Array.from(pendingElements);
      pendingElements.clear();
      
      let index = 0;
      const batchSize = MICROTASK_BATCH_THRESHOLD;
      
      const processBatch = () => {
        const end = Math.min(index + batchSize, elements.length);
        for (let i = index; i < end; i++) {
          processElementTree(elements[i]);
        }
        index = end;
        
        if (index < elements.length) {
          // Schedule next batch as microtask
          Promise.resolve().then(processBatch);
        }
      };
      
      processBatch();
    } else {
      pendingElements.forEach((element) => processElementTree(element));
      pendingElements.clear();
    }
  };

  const flush = () => {
    if (pendingElements.size > 0) flushQueue();
  };

  const scheduleFlush = () => {
    if (scheduled) return;
    scheduled = true;
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(flushQueue);
    } else {
      setTimeout(flushQueue, 0);
    }
  };

  const observe = (root = document.documentElement) => {
    if (typeof MutationObserver !== "function" || !root) return;

    // Check if this root already has an observer for the same styleId
    if (observerRegistry.has(root)) {
      const existing = observerRegistry.get(root);
      if (existing.observer && existing.styleId === styleId) {
        // Reuse existing observer — prevents duplicate observers in React StrictMode
        observer = existing.observer;
        observerRoot = root;
        return;
      }
    }

    // Disconnect any previous observer on this instance
    if (observer) {
      observer.disconnect();
      // Clean up previous registry entry if root changed
      if (observerRoot && observerRegistry.has(observerRoot)) {
        const entry = observerRegistry.get(observerRoot);
        if (entry.observer === observer) {
          observerRegistry.delete(observerRoot);
        }
      }
    }

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.target) {
          queueElementForProcessing(mutation.target);
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            queueElementForProcessing(node);
          }
        });
      });
      scheduleFlush();
    });

    // Register observer in the global registry keyed by DOM root
    observerRegistry.set(root, {
      observer,
      styleId,
      createdAt: Date.now(),
    });

    observerRoot = root;

    // Allow users to customize MutationObserver config
    // Default is aggressive (observe everything), but users can tune for performance
    const observerConfig = options.observerOptions || {};
    const finalConfig = {
      childList: observerConfig.childList !== false,       // default: true
      subtree: observerConfig.subtree !== false,           // default: true
      attributes: observerConfig.attributes !== false,     // default: true
      attributeFilter: observerConfig.attributeFilter || ["class"], // default: ["class"]
    };

    observer.observe(root, finalConfig);
  };

  const disconnect = () => {
    pendingElements.clear();
    scheduled = false;
    if (observer) {
      observer.disconnect();
      
      // Clean up the registry entry for this root
      if (observerRoot && observerRegistry.has(observerRoot)) {
        const entry = observerRegistry.get(observerRoot);
        if (entry.observer === observer) {
          observerRegistry.delete(observerRoot);
        }
      }
      
      observer = null;
      observerRoot = null;
    }
    if (domReadyHandler && typeof document === "object") {
      document.removeEventListener("DOMContentLoaded", domReadyHandler);
      domReadyHandler = null;
    }
  };

  const start = () => {
    if (typeof document !== "object") return;
    
    // Apply FOUC hiding BEFORE preflight injection
    foucManager.hide();
    
    if (preflight) injectPreflight(styleId);

    const fireReady = () => {
      // 1. FOUCManager reveal (handles fouc: { strategy } config)
      foucManager.reveal();

      // 2. Auto-detect: if <html> has opacity:0 from an inline <style> tag,
      //    reveal it automatically — no onReady or fouc config needed.
      //    This is the recommended FOUC pattern: user adds the inline style,
      //    windrunner auto-reveals after first scan.
      if (typeof document === "object") {
        const html = document.documentElement;
        // Check computed opacity — if it's 0, we need to reveal
        // Use getComputedStyle to catch opacity set via <style> tag (not just inline style)
        const computedOpacity = typeof getComputedStyle === "function"
          ? getComputedStyle(html).opacity
          : null;
        
        if (computedOpacity === "0") {
          // Reveal with transition via double rAF
          if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                html.style.opacity = "1";
              });
            });
          } else {
            setTimeout(() => { html.style.opacity = "1"; }, 16);
          }
        }
      }

      if (typeof options.onReady !== "function") return;
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => requestAnimationFrame(() => options.onReady()));
      } else {
        setTimeout(() => options.onReady(), 16);
      }
    };

    const runStart = () => {
      scan();
      observe();
      fireReady();
    };

    if (document.readyState === "loading") {
      if (!domReadyHandler) {
        domReadyHandler = () => { domReadyHandler = null; runStart(); };
        document.addEventListener("DOMContentLoaded", domReadyHandler, { once: true });
      }
      return;
    }
    runStart();
  };

  const clearCache = () => {
    cache.clear();
  };

  const getStats = () => {
    const stats = {
      cacheSize: cache.size,
      insertedRuleCount: insertedRules.size,
      pendingElementCount: pendingElements.size,
      isObserving: observer !== null,
      isCompatLoaded: compatLoaded,
    };
    
    // Add observability stats when debug is enabled
    if (debug) {
      stats.cacheHitRate = totalCompiles > 0 ? cacheHits / totalCompiles : 0;
      stats.avgCompileTimeMs = compileTimes.length > 0
        ? compileTimes.reduce((a, b) => a + b, 0) / compileTimes.length
        : 0;
      
      // Top failed classes (sorted by failure count, top 10)
      const sortedFailures = Array.from(failedClasses.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      stats.topFailedClasses = sortedFailures.map(([className, count]) => ({
        className,
        count,
      }));
      
      // Memory estimates (rough approximation)
      stats.memoryUsage = {
        cacheBytes: cache.size * 200,
        insertedRulesBytes: insertedRules.size * 150,
      };
    }
    
    return stats;
  };
  
  // ── Expose debug global ────────────────────────────────────────────────────
  if (debug && typeof window === "object") {
    window.__WINDRUNNER__ = {
      instance: null, // Will be set after runtime object is created
      version: '2.0.0',
    };
  }

  const runtimeInstance = {
    processClassName,
    processClassList,
    processElement,
    scan,
    observe,
    flush,
    start,
    disconnect,
    clearCache,
    getStats,
    isCompatLoaded:       () => compatLoaded,
    getCacheSize:         () => cache.size,
    getInsertedRuleCount: () => insertedRules.size,
  };
  
  // Populate debug global with runtime instance
  if (debug && typeof window === "object" && window.__WINDRUNNER__) {
    window.__WINDRUNNER__.instance = runtimeInstance;
  }
  
  return runtimeInstance;
}

// ─── Default export: auto-start windrunner ────────────────────────────────────

/**
 * Create and optionally auto-start a windrunner runtime.
 * Drop-in for browser usage: just call windrunner({ autoStart: true }).
 *
 * @param {{ id?: string, autoStart?: boolean, theme?: object } & object} options
 */
export default function windrunner(options = {}) {
  const runtime = createWindrunner(options);
  if (typeof window === "object" && options.autoStart !== false) {
    runtime.start();
  }
  return runtime;
}
