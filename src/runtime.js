import {
  resolveRuntimeContext,
  getBaseTailwindOptions,
  compileRuntimeClassNameWithContext,
} from "./compiler.js";
import preflightCss from "./preflight.js";

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
  const onError       = typeof options.onError === "function" ? options.onError : null;
  const onCompile     = typeof options.onCompile === "function" ? options.onCompile : null;
  const tailwindOptions = getBaseTailwindOptions(options);
  const context = resolveRuntimeContext(tailwindOptions);

  const cache          = new Map();
  const insertedRules  = new Set();
  const pendingElements = new Set();

  let observer       = null;
  let scheduled      = false;
  let styleElement   = null;
  let domReadyHandler = null;
  let compatLoaded   = false;

  const loadExistingRules = (style) => {
    if (!style || !style.sheet || insertedRules.size > 0) return;
    try {
      const rules = style.sheet.cssRules || [];
      for (let i = 0; i < rules.length; i += 1) {
        insertedRules.add(rules[i].cssText);
      }
    } catch {
      // ignore unavailable stylesheet access
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
      if (onError) onError(className);
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
    if (root.nodeType === 1) processElementTree(root);
    const elements = root.querySelectorAll ? root.querySelectorAll("[class]") : [];
    elements.forEach((element) => processElement(element));
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
          pendingElements.add(mutation.target);
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) pendingElements.add(node);
        });
      });
      scheduleFlush();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
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
    if (preflight) injectPreflight(styleId);

    const fireReady = () => {
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
