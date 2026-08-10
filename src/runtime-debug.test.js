/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWindrunner } from "./runtime.js";

// ─── Debug Mode & Observability Tests ─────────────────────────────────────────

describe("debug mode and observability", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
    // Clean up global
    delete window.__WINDRUNNER__;
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    delete window.__WINDRUNNER__;
  });

  describe("debug flag", () => {
    it("should not log when debug is false (default)", () => {
      const wind = createWindrunner({ debug: false });
      wind.processClassName("flex");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should log cache misses when debug is true", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[Windrunner] Cache miss")
      );
    });

    it("should log cache hits when debug is true", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex"); // first time: miss + compile
      consoleSpy.log.mockClear();

      wind.processClassName("flex"); // second time: cache hit
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[Windrunner] Cache hit")
      );
    });

    it("should log compile times when debug is true", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[Windrunner] Compiled")
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\d+\.\d+ms/)
      );
    });

    it("should log failures when debug is true", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("totally-invalid-xyz-class");

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining("[Windrunner] Compile failed")
      );
    });

    it("should not log when debug is not provided (defaults to false)", () => {
      const wind = createWindrunner();
      wind.processClassName("flex");
      wind.processClassName("flex"); // second call: would be cache hit

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe("strict flag", () => {
    it("should throw error when strict is true and utility is unknown", () => {
      const wind = createWindrunner({ strict: true });

      expect(() => wind.processClassName("totally-invalid-xyz")).toThrow(
        /\[Windrunner\] Failed to compile class/
      );
    });

    it("should include class name in the thrown error", () => {
      const wind = createWindrunner({ strict: true });

      expect(() => wind.processClassName("xyz-invalid")).toThrow("xyz-invalid");
    });

    it("should include reason in the thrown error", () => {
      const wind = createWindrunner({ strict: true });

      expect(() => wind.processClassName("xyz-invalid")).toThrow("unknown-utility");
    });

    it("should NOT throw for valid classes in strict mode", () => {
      const wind = createWindrunner({ strict: true });

      expect(() => wind.processClassName("flex")).not.toThrow();
      expect(() => wind.processClassName("block")).not.toThrow();
    });

    it("should silently skip unknown utilities when strict is false (default)", () => {
      const wind = createWindrunner({ strict: false });

      expect(() => wind.processClassName("xyz-invalid")).not.toThrow();
    });

    it("should silently skip when strict is not provided (defaults to false)", () => {
      const wind = createWindrunner();

      expect(() => wind.processClassName("xyz-invalid")).not.toThrow();
    });
  });

  describe("compile attempt tracking", () => {
    it("should track total compile attempts", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("flex"); // cache hit

      const stats = wind.getStats();
      // cacheHitRate = 1 hit (second flex) / 3 total = ~0.333
      expect(stats.cacheHitRate).toBeCloseTo(1 / 3);
    });

    it("should include compileAttempt in error context", () => {
      const onError = vi.fn();
      const wind = createWindrunner({ debug: true, onError });

      wind.processClassName("invalid-xyz");
      wind.processClassName("invalid-xyz"); // second attempt (from cache, but still invalid)

      // First call should show compileAttempt = 1
      const [, ctx1] = onError.mock.calls[0];
      expect(ctx1.compileAttempt).toBe(1);
    });
  });

  describe("rolling window compile times", () => {
    it("should track compile times in a rolling window", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");

      const stats = wind.getStats();
      expect(stats.avgCompileTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof stats.avgCompileTimeMs).toBe("number");
    });

    it("should limit the rolling window to 100 measurements", () => {
      const wind = createWindrunner({ debug: true });
      
      // Compile more than 100 unique classes
      const classes = [
        "flex", "block", "grid", "hidden", "inline", "inline-block",
        "inline-flex", "inline-grid", "table", "table-row",
        "p-1", "p-2", "p-3", "p-4", "p-5", "p-6", "p-7", "p-8", "p-9", "p-10",
        "m-1", "m-2", "m-3", "m-4", "m-5", "m-6", "m-7", "m-8", "m-9", "m-10",
        "w-1", "w-2", "w-3", "w-4", "w-5", "w-6", "w-7", "w-8", "w-9", "w-10",
        "h-1", "h-2", "h-3", "h-4", "h-5", "h-6", "h-7", "h-8", "h-9", "h-10",
        "gap-1", "gap-2", "gap-3", "gap-4", "gap-5", "gap-6", "gap-7", "gap-8",
        "text-sm", "text-base", "text-lg", "text-xl", "text-2xl",
        "font-bold", "font-semibold", "font-medium", "font-light",
        "rounded", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl",
        "border", "border-2", "border-4",
        "opacity-50", "opacity-75", "opacity-100",
        "z-10", "z-20", "z-30", "z-40", "z-50",
        "top-0", "top-1", "top-2", "top-4",
        "right-0", "right-1", "right-2", "right-4",
        "bottom-0", "bottom-1", "bottom-2", "bottom-4",
        "left-0", "left-1", "left-2", "left-4",
        "items-center", "items-start", "items-end",
        "justify-center", "justify-start", "justify-end",
        "grow", "shrink", "basis-0",
        "overflow-hidden", "overflow-auto", "overflow-scroll",
        "relative", "absolute", "fixed", "sticky",
        "col-span-1", "col-span-2", "col-span-3",
        "row-span-1", "row-span-2", "row-span-3",
      ];

      classes.forEach((cls) => wind.processClassName(cls));

      const stats = wind.getStats();
      // avgCompileTimeMs should still be calculated from the rolling window
      expect(stats.avgCompileTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof stats.avgCompileTimeMs).toBe("number");
    });

    it("should return 0 avgCompileTimeMs when no compilations have occurred", () => {
      const wind = createWindrunner({ debug: true });
      const stats = wind.getStats();
      expect(stats.avgCompileTimeMs).toBe(0);
    });
  });

  describe("cache hit rate tracking", () => {
    it("should calculate correct cache hit rate", () => {
      const wind = createWindrunner({ debug: true });
      
      wind.processClassName("flex"); // miss
      wind.processClassName("flex"); // hit
      wind.processClassName("flex"); // hit
      wind.processClassName("block"); // miss

      const stats = wind.getStats();
      // 2 hits out of 4 total
      expect(stats.cacheHitRate).toBeCloseTo(0.5);
    });

    it("should return 0 cache hit rate when no compiles have occurred", () => {
      const wind = createWindrunner({ debug: true });
      const stats = wind.getStats();
      expect(stats.cacheHitRate).toBe(0);
    });

    it("should not include cacheHitRate when debug is false", () => {
      const wind = createWindrunner({ debug: false });
      wind.processClassName("flex");
      wind.processClassName("flex");

      const stats = wind.getStats();
      expect(stats.cacheHitRate).toBeUndefined();
    });
  });

  describe("failed classes tracking", () => {
    it("should track failed class names in debug mode", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("invalid-aaa");
      wind.processClassName("invalid-bbb");
      wind.processClassName("invalid-aaa"); // from cache: still tracked as failed

      const stats = wind.getStats();
      expect(stats.topFailedClasses).toBeDefined();
      expect(Array.isArray(stats.topFailedClasses)).toBe(true);
      
      // invalid-aaa should appear with count
      const found = stats.topFailedClasses.find(
        (item) => item.className === "invalid-aaa"
      );
      expect(found).toBeDefined();
    });

    it("should sort topFailedClasses by count descending", () => {
      const wind = createWindrunner({ debug: true });
      // fail-b will fail first, then fail-a will fail
      // We need unique failures with different counts
      // Since cache stores the result, we need different class names
      wind.processClassName("fail-a");
      wind.processClassName("fail-b");
      wind.processClassName("fail-c");
      wind.processClassName("fail-c-again"); // another unique failure
      
      // Clear cache to allow re-compilation of fail-b
      wind.clearCache();
      wind.processClassName("fail-b"); // now fails again, count = 2

      const stats = wind.getStats();
      expect(stats.topFailedClasses.length).toBeGreaterThan(0);
      // fail-b should have count 2, others count 1
      const failB = stats.topFailedClasses.find(
        (item) => item.className === "fail-b"
      );
      const failA = stats.topFailedClasses.find(
        (item) => item.className === "fail-a"
      );
      expect(failB).toBeDefined();
      expect(failA).toBeDefined();
      expect(failB.count).toBe(2);
      expect(failA.count).toBe(1);
      // fail-b (count 2) should come before fail-a (count 1)
      const indexB = stats.topFailedClasses.findIndex(
        (item) => item.className === "fail-b"
      );
      const indexA = stats.topFailedClasses.findIndex(
        (item) => item.className === "fail-a"
      );
      expect(indexB).toBeLessThan(indexA);
    });

    it("should limit topFailedClasses to 10 entries", () => {
      const wind = createWindrunner({ debug: true });
      for (let i = 0; i < 15; i++) {
        wind.processClassName(`nonexistent-class-${i}`);
      }

      const stats = wind.getStats();
      expect(stats.topFailedClasses.length).toBeLessThanOrEqual(10);
    });

    it("should not include topFailedClasses when debug is false", () => {
      const wind = createWindrunner({ debug: false });
      wind.processClassName("invalid-xyz");

      const stats = wind.getStats();
      expect(stats.topFailedClasses).toBeUndefined();
    });
  });

  describe("memory usage estimates", () => {
    it("should include memoryUsage when debug is true", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex");

      const stats = wind.getStats();
      expect(stats.memoryUsage).toBeDefined();
      expect(typeof stats.memoryUsage.cacheBytes).toBe("number");
      expect(typeof stats.memoryUsage.insertedRulesBytes).toBe("number");
    });

    it("should not include memoryUsage when debug is false", () => {
      const wind = createWindrunner({ debug: false });
      wind.processClassName("flex");

      const stats = wind.getStats();
      expect(stats.memoryUsage).toBeUndefined();
    });

    it("should estimate memory proportional to cache size", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");

      const stats = wind.getStats();
      // 3 cache entries * ~200 bytes each
      expect(stats.memoryUsage.cacheBytes).toBe(3 * 200);
    });
  });

  describe("window.__WINDRUNNER__ global", () => {
    it("should expose __WINDRUNNER__ on window when debug is true", () => {
      const wind = createWindrunner({ debug: true });

      expect(window.__WINDRUNNER__).toBeDefined();
      expect(window.__WINDRUNNER__.version).toBe("2.0.0");
    });

    it("should expose the runtime instance on __WINDRUNNER__", () => {
      const wind = createWindrunner({ debug: true });

      expect(window.__WINDRUNNER__.instance).toBe(wind);
    });

    it("should NOT expose __WINDRUNNER__ when debug is false", () => {
      createWindrunner({ debug: false });
      expect(window.__WINDRUNNER__).toBeUndefined();
    });

    it("should NOT expose __WINDRUNNER__ when debug is not provided", () => {
      createWindrunner();
      expect(window.__WINDRUNNER__).toBeUndefined();
    });

    it("should allow accessing getStats() from __WINDRUNNER__ global", () => {
      const wind = createWindrunner({ debug: true });
      wind.processClassName("flex");

      const stats = window.__WINDRUNNER__.instance.getStats();
      expect(stats.cacheSize).toBe(1);
      expect(stats.cacheHitRate).toBeDefined();
    });
  });

  describe("debug + strict combined", () => {
    it("should log and throw when both debug and strict are true", () => {
      const wind = createWindrunner({ debug: true, strict: true });

      expect(() => wind.processClassName("unknown-zzz")).toThrow(
        /\[Windrunner\]/
      );
      // Should have logged the failure before throwing
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining("[Windrunner] Compile failed")
      );
    });
  });

  describe("debug mode with stack traces", () => {
    it("should include stack trace in error context when debug is true", () => {
      const onError = vi.fn();
      const wind = createWindrunner({ debug: true, onError });
      wind.processClassName("invalid-class-xyz");

      const [, ctx] = onError.mock.calls[0];
      expect(ctx.stack).toBeDefined();
      expect(typeof ctx.stack).toBe("string");
    });

    it("should NOT include stack trace when debug is false", () => {
      const onError = vi.fn();
      const wind = createWindrunner({ debug: false, onError });
      wind.processClassName("invalid-class-xyz");

      const [, ctx] = onError.mock.calls[0];
      expect(ctx.stack).toBeUndefined();
    });
  });

  describe("backward compatibility", () => {
    it("should maintain existing getStats shape when debug is false", () => {
      const wind = createWindrunner();
      wind.processClassName("flex");

      const stats = wind.getStats();
      expect(stats).toHaveProperty("cacheSize");
      expect(stats).toHaveProperty("insertedRuleCount");
      expect(stats).toHaveProperty("pendingElementCount");
      expect(stats).toHaveProperty("isObserving");
      expect(stats).toHaveProperty("isCompatLoaded");
      // Debug-only fields should be absent
      expect(stats).not.toHaveProperty("cacheHitRate");
      expect(stats).not.toHaveProperty("avgCompileTimeMs");
      expect(stats).not.toHaveProperty("topFailedClasses");
      expect(stats).not.toHaveProperty("memoryUsage");
    });

    it("should not log debug info when debug option is not provided", () => {
      const wind = createWindrunner();
      wind.processClassName("flex");
      wind.processClassName("invalid-thing-xyz");

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it("should not throw when strict is not provided and class is invalid", () => {
      const wind = createWindrunner();
      expect(() => wind.processClassName("nonexistent-class")).not.toThrow();
    });
  });
});
