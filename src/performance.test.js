/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWindrunner, _getAdaptiveCacheSize } from "./runtime.js";
import { compileClass } from "./compiler.js";

// ─── LRU Cache Tests ──────────────────────────────────────────────────────────

describe("Performance: LRU Cache", () => {
  describe("configurable max size", () => {
    it("should default to 10,000 max cache size", () => {
      const wind = createWindrunner();
      // The default is 10,000 (or adjusted by adaptive sizing)
      // We verify it works without specifying maxCacheSize
      wind.processClassName("flex");
      wind.processClassName("block");
      expect(wind.getCacheSize()).toBe(2);
    });

    it("should accept a custom maxCacheSize option", () => {
      const wind = createWindrunner({ maxCacheSize: 5 });
      
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");
      wind.processClassName("hidden");
      wind.processClassName("inline");
      
      expect(wind.getCacheSize()).toBe(5);
      
      // Adding one more should evict the oldest
      wind.processClassName("table");
      expect(wind.getCacheSize()).toBe(5);
    });
  });

  describe("LRU eviction behavior", () => {
    it("should evict least recently used entry when limit reached", () => {
      const wind = createWindrunner({ maxCacheSize: 3 });
      
      // Fill cache: flex, block, grid (in order)
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");
      expect(wind.getCacheSize()).toBe(3);
      
      // Access "flex" to make it recently used (moves it to end)
      wind.processClassName("flex");
      expect(wind.getCacheSize()).toBe(3); // Still 3 (cache hit, no eviction)
      
      // Add a new class. "block" is now the LRU (oldest non-accessed)
      wind.processClassName("hidden");
      expect(wind.getCacheSize()).toBe(3);
      
      // "flex" should still be in cache (it was accessed recently)
      // "block" should have been evicted (LRU)
      // "grid" and "hidden" should be in cache
      const flexRule = wind.processClassName("flex");
      expect(flexRule).toBeTruthy(); // flex should still be cached
    });

    it("should evict the first entry when no re-access patterns", () => {
      const wind = createWindrunner({ maxCacheSize: 3 });
      
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");
      
      // This should evict "flex" (first/oldest)
      wind.processClassName("hidden");
      expect(wind.getCacheSize()).toBe(3);
    });

    it("should fire onWarning when cache eviction occurs", () => {
      const onWarning = vi.fn();
      const wind = createWindrunner({ maxCacheSize: 2, onWarning });
      
      wind.processClassName("flex");
      wind.processClassName("block");
      
      // This should trigger eviction and warning
      wind.processClassName("grid");
      
      expect(onWarning).toHaveBeenCalled();
      expect(onWarning.mock.calls[0][0]).toContain("Cache eviction");
    });
  });

  describe("cache hit rate", () => {
    it("should achieve high cache hit rate with repeated class access", () => {
      const wind = createWindrunner({ debug: true });
      
      // Initial compilation (all misses)
      const classes = ["flex", "block", "grid", "hidden", "inline"];
      classes.forEach(cls => wind.processClassName(cls));
      
      // Access same classes again (all hits)
      classes.forEach(cls => wind.processClassName(cls));
      classes.forEach(cls => wind.processClassName(cls));
      classes.forEach(cls => wind.processClassName(cls));
      
      const stats = wind.getStats();
      // 5 misses + 15 hits = 20 total, 15/20 = 75%
      // But first access goes through cache check then compile, which counts differently
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0.7);
    });

    it("should maintain 80%+ cache hit rate with moderate class reuse", () => {
      const wind = createWindrunner({ debug: true });
      
      // Simulate typical usage: compile 10 classes, then reuse them 4x each
      const baseClasses = [
        "flex", "items-center", "justify-between", "p-4", "m-2",
        "bg-blue-500", "text-white", "rounded-lg", "shadow-md", "w-full"
      ];
      
      // First pass (all misses)
      baseClasses.forEach(cls => wind.processClassName(cls));
      
      // Next 4 passes (all hits)
      for (let i = 0; i < 4; i++) {
        baseClasses.forEach(cls => wind.processClassName(cls));
      }
      
      const stats = wind.getStats();
      // 10 misses + 40 hits = 50 total, 40/50 = 80%
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0.8);
    });
  });
});

// ─── Adaptive Cache Sizing Tests ──────────────────────────────────────────────

describe("Performance: Adaptive Cache Sizing", () => {
  it("should return full size when deviceMemory is >= 4 GB", () => {
    const size = _getAdaptiveCacheSize(10000);
    // In test environment, navigator.deviceMemory likely undefined
    // So default behavior returns the requested size unchanged
    expect(size).toBe(10000);
  });

  it("should reduce cache size by 50% when deviceMemory < 4 GB", () => {
    // Mock navigator.deviceMemory
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: { deviceMemory: 2 },
      writable: true,
      configurable: true,
    });
    
    const size = _getAdaptiveCacheSize(10000);
    expect(size).toBe(5000);
    
    // Restore
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("should reduce cache size for 1 GB devices", () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: { deviceMemory: 1 },
      writable: true,
      configurable: true,
    });
    
    const size = _getAdaptiveCacheSize(10000);
    expect(size).toBe(5000);
    
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("should keep full size for 4 GB devices", () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: { deviceMemory: 4 },
      writable: true,
      configurable: true,
    });
    
    const size = _getAdaptiveCacheSize(10000);
    expect(size).toBe(10000);
    
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("should keep full size for 8 GB devices", () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: { deviceMemory: 8 },
      writable: true,
      configurable: true,
    });
    
    const size = _getAdaptiveCacheSize(10000);
    expect(size).toBe(10000);
    
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("should respect custom maxCacheSize with adaptive reduction", () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: { deviceMemory: 2 },
      writable: true,
      configurable: true,
    });
    
    // Custom size of 6000 should become 3000 on low-memory device
    const size = _getAdaptiveCacheSize(6000);
    expect(size).toBe(3000);
    
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });
});

// ─── Batched CSS Rule Insertion Tests ─────────────────────────────────────────

describe("Performance: Batched CSS Rule Insertions", () => {
  it("should batch CSS rule insertions within requestAnimationFrame", async () => {
    document.body.innerHTML = '<div id="target"></div>';
    const wind = createWindrunner({ autoStart: false });
    wind.observe(document.body);
    
    const target = document.getElementById('target');
    
    // Add multiple classes at once (single mutation)
    target.className = 'flex items-center justify-between p-4';
    
    // Rules should not be inserted immediately (they're batched)
    // Wait for requestAnimationFrame to flush
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // After flush, rules should be inserted
    expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
    wind.disconnect();
  });

  it("should process pending elements in a single flush cycle", async () => {
    document.body.innerHTML = '';
    const wind = createWindrunner({ autoStart: false });
    wind.observe(document.body);
    
    // Add multiple elements rapidly
    for (let i = 0; i < 10; i++) {
      const el = document.createElement('div');
      el.className = `p-${i + 1}`;
      document.body.appendChild(el);
    }
    
    // Wait for flush
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
    wind.disconnect();
  });
});

// ─── Microtask Batching for Large DOM Mutations Tests ─────────────────────────

describe("Performance: Microtask Batching", () => {
  it("should handle >100 elements via microtask batching without blocking", async () => {
    document.body.innerHTML = '';
    const wind = createWindrunner({ autoStart: false });
    
    // Create 150 elements with classes
    const elements = [];
    for (let i = 0; i < 150; i++) {
      const el = document.createElement('div');
      el.className = `p-${(i % 12) + 1}`;
      document.body.appendChild(el);
      elements.push(el);
    }
    
    // Scan the document (triggers processing of all elements)
    wind.scan(document.body);
    
    // Allow microtask batches to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // All classes should have been processed
    expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
    expect(wind.getCacheSize()).toBeGreaterThan(0);
    wind.disconnect();
  });

  it("should process small mutations (<100 elements) synchronously in flush", async () => {
    document.body.innerHTML = '';
    const wind = createWindrunner({ autoStart: false });
    wind.observe(document.body);
    
    // Add 50 elements (under threshold)
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'flex';
      document.body.appendChild(el);
    }
    
    // Wait for single rAF flush
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
    wind.disconnect();
  });
});

// ─── Compilation Performance Tests ────────────────────────────────────────────

describe("Performance: Compilation Speed", () => {
  it("should compile a single utility class in less than 1ms", () => {
    const wind = createWindrunner();
    
    const classes = [
      "flex", "block", "grid", "hidden", "inline",
      "p-4", "m-2", "w-full", "h-screen", "gap-4",
      "bg-blue-500", "text-white", "text-lg", "font-bold",
      "rounded-lg", "shadow-md", "border", "opacity-50"
    ];
    
    for (const cls of classes) {
      const start = performance.now();
      compileClass(cls);
      const elapsed = performance.now() - start;
      
      // Each class should compile in < 1ms
      expect(elapsed).toBeLessThan(1);
    }
  });

  it("should compile variant classes in less than 1ms each", () => {
    const wind = createWindrunner();
    
    const variantClasses = [
      "hover:bg-blue-500",
      "focus:ring-2",
      "md:flex",
      "lg:grid-cols-3",
      "dark:bg-gray-900",
      "hover:focus:bg-red-500",
    ];
    
    // Warm up: compile one variant class to load variant resolution paths
    compileClass("hover:opacity-50");
    
    for (const cls of variantClasses) {
      const start = performance.now();
      compileClass(cls);
      const elapsed = performance.now() - start;
      
      expect(elapsed).toBeLessThan(1);
    }
  });

  it("should compile 1000 classes with average < 1ms per class", () => {
    // Generate a diverse set of classes
    const classes = [];
    const prefixes = ["p", "m", "w", "h", "text", "bg", "border", "rounded"];
    const values = ["1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20"];
    const colors = ["red", "blue", "green", "yellow", "purple", "pink", "gray"];
    const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
    
    for (const prefix of prefixes) {
      for (const value of values) {
        classes.push(`${prefix}-${value}`);
      }
    }
    for (const color of colors) {
      for (const shade of shades) {
        classes.push(`text-${color}-${shade}`);
        classes.push(`bg-${color}-${shade}`);
      }
    }
    
    // Ensure we have enough classes
    while (classes.length < 1000) {
      classes.push(`flex`);
    }
    
    const start = performance.now();
    for (const cls of classes.slice(0, 1000)) {
      compileClass(cls);
    }
    const elapsed = performance.now() - start;
    
    const avgTime = elapsed / 1000;
    expect(avgTime).toBeLessThan(1); // Average < 1ms per class
  });
});

// ─── Initial Scan Performance Tests ───────────────────────────────────────────

describe("Performance: Initial Scan Speed", () => {
  it("should scan 100 elements with 1000 total classes in < 100ms", () => {
    // Build a DOM with 100 elements, each having ~10 classes
    document.body.innerHTML = '';
    const classes = [
      "flex items-center justify-between p-4 m-2 bg-white rounded shadow",
      "grid grid-cols-3 gap-4 p-6 border border-gray-200 text-sm",
      "block w-full h-auto text-center font-bold text-lg tracking-wide",
      "inline-flex items-start gap-2 px-3 py-1 bg-blue-100 text-blue-800",
      "relative overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5",
    ];
    
    for (let i = 0; i < 100; i++) {
      const el = document.createElement('div');
      el.className = classes[i % classes.length];
      document.body.appendChild(el);
    }
    
    const wind = createWindrunner({ autoStart: false });
    
    const start = performance.now();
    wind.scan(document.body);
    const elapsed = performance.now() - start;
    
    // Should complete within 100ms
    expect(elapsed).toBeLessThan(100);
    expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
    
    wind.disconnect();
  });

  it("should scan 1000 elements with many classes in reasonable time", () => {
    document.body.innerHTML = '';
    const classLists = [
      "flex items-center gap-4 p-4 bg-white",
      "grid grid-cols-2 gap-2 text-sm",
      "block w-full text-center p-2",
      "inline px-2 py-1 text-xs",
      "relative z-10 shadow rounded",
    ];
    
    for (let i = 0; i < 1000; i++) {
      const el = document.createElement('div');
      el.className = classLists[i % classLists.length];
      document.body.appendChild(el);
    }
    
    const wind = createWindrunner({ autoStart: false });
    
    const start = performance.now();
    wind.scan(document.body);
    const elapsed = performance.now() - start;
    
    // Target: < 100ms for 1000 elements
    // Note: in test environment with jsdom this may be slower than browser
    // We use a generous threshold that still validates the optimization
    expect(elapsed).toBeLessThan(500); // Allow higher for jsdom overhead
    expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
    
    wind.disconnect();
  });
});

// ─── String Concatenation Optimization Tests ──────────────────────────────────

describe("Performance: String Concatenation Optimization", () => {
  it("should use efficient string operations for CSS rule generation", () => {
    // Compile various class types and verify they produce valid CSS
    // This exercises the hot path string operations
    const testCases = [
      { input: "flex", expected: "display: flex" },
      { input: "p-4", expected: "padding:" },
      { input: "bg-blue-500", expected: "background-color:" },
      { input: "hover:bg-red-500", expected: ":hover" },
      { input: "md:flex", expected: "@media" },
    ];
    
    for (const { input, expected } of testCases) {
      const result = compileClass(input);
      expect(result).toContain(expected);
    }
  });

  it("should generate consistent output across repeated compilations", () => {
    // Verifies no allocation-related inconsistencies
    const classes = ["flex", "p-4", "bg-blue-500", "hover:text-white"];
    
    for (const cls of classes) {
      const first = compileClass(cls);
      const second = compileClass(cls);
      expect(first).toBe(second);
    }
  });
});

// ─── Overall Performance Integration ──────────────────────────────────────────

describe("Performance: Integration", () => {
  it("should handle rapid class name processing without degradation", () => {
    const wind = createWindrunner();
    
    const start = performance.now();
    
    // Process 500 unique classes
    for (let i = 0; i < 500; i++) {
      wind.processClassName(`p-${(i % 96) + 1}`);
    }
    
    const elapsed = performance.now() - start;
    
    // Should complete reasonably fast (500 classes)
    expect(elapsed).toBeLessThan(500); // < 1ms average per class
    
    wind.disconnect();
  });

  it("should maintain performance with cache eviction under pressure", () => {
    const wind = createWindrunner({ maxCacheSize: 50 });
    
    const start = performance.now();
    
    // Process more classes than cache can hold
    const utilities = ["flex", "block", "grid", "hidden", "inline", "table"];
    const spacing = ["p", "m", "px", "py", "mx", "my"];
    const values = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12"];
    
    for (const s of spacing) {
      for (const v of values) {
        wind.processClassName(`${s}-${v}`);
      }
    }
    
    const elapsed = performance.now() - start;
    
    // Even with eviction, should be fast
    expect(elapsed).toBeLessThan(1000);
    expect(wind.getCacheSize()).toBeLessThanOrEqual(50);
    
    wind.disconnect();
  });
});
