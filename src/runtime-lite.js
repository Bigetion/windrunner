import {
  resolveRuntimeContextLite as resolveRuntimeContext,
  compileRuntimeClassNameWithContext,
  parseClass,
} from "./compiler-lite.js";
import { getBaseTailwindOptions } from "./compiler.js";
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

// ─── Runtime factory ──────────────────────────────────────────────────────────

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
  const maxCacheSize  = options.maxCacheSize  || 10000;
  const mode          = options.mode          || "runtime";
  const precompiled   = options.precompiled || mode === "hybrid" || false;
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
  let scheduled      = false;
  let styleElement   = null;
  let domReadyHandler = null;
  let compatLoaded   = false;
  let precompiledScanned = false;
  
  // Initialize FOUC manager with user config
  const foucManager = new FOUCManager(options.fouc, styleId);

  /**
   * Emit a warning via the onWarning callback.
   */
  const warn = (message, severity, extra = {}) => {
    if (!onWarning) return;
    const ctx = createWarningContext(message, severity, extra);
    onWarning(message, ctx);
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

  const compileWithCache = (className) => {
    if (cache.has(className)) return cache.get(className);
    const cssRule = compileRuntimeClassNameWithContext(className, context);
    // LRU-style eviction: remove oldest entry when cache exceeds max size
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
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
    const cssRule = compileWithCache(className);
    if (!cssRule) {
      ensureCompatStyle();
      // Enhanced error callback with context
      if (onError) {
        const parsed = parseClass(className, context.screens, context.containers);
        
        // Detect if this is a lite mode exclusion by checking the utility/variant
        let reason = parsed ? ErrorReasons.UNKNOWN_UTILITY : ErrorReasons.PARSE_ERROR;
        let category = undefined;
        
        // Check if utility is excluded from lite mode
        if (parsed) {
          const checkUtilityExclusion = (baseToken) => {
            if (/^(rotate|scale|translate|skew|origin|perspective|transform)/.test(baseToken)) {
              return { excluded: true, category: 'transforms' };
            }
            if (/^(blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia|drop-shadow|backdrop-)/.test(baseToken)) {
              return { excluded: true, category: 'filters' };
            }
            if (/^(transition|duration|delay|ease)/.test(baseToken)) {
              return { excluded: true, category: 'transitions' };
            }
            if (/^(animate-)/.test(baseToken)) {
              return { excluded: true, category: 'animations' };
            }
            return { excluded: false };
          };
          
          const checkVariantExclusion = (variant) => {
            if (/^group(-|\/|$)/.test(variant)) return { excluded: true, category: 'advanced-variants' };
            if (/^peer(-|\/|$)/.test(variant)) return { excluded: true, category: 'advanced-variants' };
            if (/^has-\[/.test(variant)) return { excluded: true, category: 'advanced-variants' };
            if (/^data-\[/.test(variant)) return { excluded: true, category: 'advanced-variants' };
            if (/^aria-\[/.test(variant)) return { excluded: true, category: 'advanced-variants' };
            if (/^\[/.test(variant)) return { excluded: true, category: 'advanced-variants' };
            return { excluded: false };
          };
          
          // Check variants FIRST (they should take priority)
          if (parsed.variants && parsed.variants.length > 0) {
            for (const variant of parsed.variants) {
              const variantCheck = checkVariantExclusion(variant);
              if (variantCheck.excluded) {
                reason = ErrorReasons.LITE_MODE_EXCLUDED;
                category = variantCheck.category;
                break;
              }
            }
          }
          
          // Only check utility if no excluded variant was found
          if (reason !== ErrorReasons.LITE_MODE_EXCLUDED && parsed.baseToken) {
            const utilityCheck = checkUtilityExclusion(parsed.baseToken);
            if (utilityCheck.excluded) {
              reason = ErrorReasons.LITE_MODE_EXCLUDED;
              category = utilityCheck.category;
            }
          }
        }
        
        const errorContext = createErrorContext(className, reason, {
          category,
          baseToken: parsed ? parsed.baseToken : className,
          variants: parsed ? parsed.variants : undefined,
          details: reason === ErrorReasons.LITE_MODE_EXCLUDED
            ? `Utility or variant not available in lite build (category: ${category})`
            : parsed 
              ? `Could not compile utility "${parsed.baseToken}"${parsed.variants.length ? ` with variants: ${parsed.variants.join(', ')}` : ''}`
              : `Failed to parse class name "${className}"`,
        });
        onError(className, errorContext);
      }
    } else {
      insertRule(cssRule);
      if (onCompile) onCompile(className, cssRule);
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

  const flushQueue = () => {
    scheduled = false;
    pendingElements.forEach((element) => processElementTree(element));
    pendingElements.clear();
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
    if (observer) observer.disconnect();

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
    if (observer) { observer.disconnect(); observer = null; }
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
      // Reveal content after scan completes
      foucManager.reveal();
      
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

  const getStats = () => ({
    cacheSize: cache.size,
    insertedRuleCount: insertedRules.size,
    pendingElementCount: pendingElements.size,
    isObserving: observer !== null,
    isCompatLoaded: compatLoaded,
  });

  return {
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
