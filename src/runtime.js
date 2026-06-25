import {
  resolveRuntimeContext,
  getBaseTailwindOptions,
  compileRuntimeClassNameWithContext,
} from "./compiler.js";

// ─── DOM helpers ──────────────────────────────────────────────────────────────

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
  const compatMode    = options.compatMode    || "none";
  const compatStyleId = options.compatStyleId || `${styleId}-full`;
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
    cache.set(className, cssRule);
    return cssRule;
  };

  const insertRule = (rule) => {
    if (!rule || insertedRules.has(rule)) return;
    insertedRules.add(rule);
    if (typeof document !== "object") return;
    if (!styleElement) styleElement = findOrCreateRuntimeStyle(styleId);
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
    } else {
      insertRule(cssRule);
    }
    return cssRule;
  };

  const processElement = (element) => {
    if (!element || !element.classList) return;
    element.classList.forEach((className) => processClassName(className));
  };

  const processClassList = (classListString) => {
    if (typeof classListString !== "string") return [];
    return classListString
      .split(/\s+/)
      .filter(Boolean)
      .map((item) => processClassName(item))
      .filter(Boolean);
  };

  const scan = (root = document) => {
    if (typeof document !== "object" || !root) return;
    if (root.nodeType === 1 && root.classList) processElement(root);
    const elements = root.querySelectorAll ? root.querySelectorAll("[class]") : [];
    elements.forEach((element) => processElement(element));
  };

  const flushQueue = () => {
    scheduled = false;
    pendingElements.forEach((element) => processElement(element));
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

  const observe = (root = document.body || document.documentElement) => {
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
    const runStart = () => { scan(); observe(); };
    if (document.readyState === "loading") {
      if (!domReadyHandler) {
        domReadyHandler = () => { domReadyHandler = null; runStart(); };
        document.addEventListener("DOMContentLoaded", domReadyHandler, { once: true });
      }
      return;
    }
    runStart();
  };

  return {
    processClassName,
    processClassList,
    processElement,
    scan,
    observe,
    flush,
    start,
    disconnect,
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
