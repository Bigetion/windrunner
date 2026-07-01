import { describe, it, expect, vi } from "vitest";
import { createWindrunner } from "./runtime.js";

// ─── Node.js environment tests (no DOM) ───────────────────────────────────────
// These tests verify logic that works without a browser DOM.

describe("runtime (Node.js / no-DOM)", () => {
  describe("createWindrunner", () => {
    it("should create a runtime instance with all expected methods", () => {
      const wind = createWindrunner();

      expect(typeof wind.processClassName).toBe("function");
      expect(typeof wind.processClassList).toBe("function");
      expect(typeof wind.processElement).toBe("function");
      expect(typeof wind.scan).toBe("function");
      expect(typeof wind.observe).toBe("function");
      expect(typeof wind.flush).toBe("function");
      expect(typeof wind.start).toBe("function");
      expect(typeof wind.disconnect).toBe("function");
      expect(typeof wind.clearCache).toBe("function");
      expect(typeof wind.getStats).toBe("function");
      expect(typeof wind.isCompatLoaded).toBe("function");
      expect(typeof wind.getCacheSize).toBe("function");
      expect(typeof wind.getInsertedRuleCount).toBe("function");
    });
  });

  describe("processClassName", () => {
    it("should compile a valid utility class and return the CSS rule", () => {
      const wind = createWindrunner();
      const rule = wind.processClassName("flex");

      expect(rule).toBe(".flex { display: flex; }");
    });

    it("should return empty string for an unrecognized class", () => {
      const wind = createWindrunner();
      const rule = wind.processClassName("totally-fake-class-xyz");

      expect(rule).toBe("");
    });

    it("should cache compiled results and return identical output", () => {
      const wind = createWindrunner();
      const first = wind.processClassName("flex");
      const second = wind.processClassName("flex");

      expect(first).toBe(second);
      expect(wind.getCacheSize()).toBe(1);
    });

    it("should compile variant classes correctly", () => {
      const wind = createWindrunner();
      const rule = wind.processClassName("hover:opacity-50");

      expect(rule).toContain(":hover");
      expect(rule).toContain("opacity");
    });
  });

  describe("processClassList", () => {
    it("should compile a space-separated string of class names", () => {
      const wind = createWindrunner();
      const rules = wind.processClassList("flex items-center gap-4");

      expect(rules.length).toBe(3);
      expect(rules[0]).toContain("display: flex");
      expect(rules[1]).toContain("align-items: center");
    });

    it("should handle an array of class names", () => {
      const wind = createWindrunner();
      const rules = wind.processClassList(["flex", "block"]);

      expect(rules.length).toBe(2);
    });

    it("should return empty array for null/undefined input", () => {
      const wind = createWindrunner();

      expect(wind.processClassList(null)).toEqual([]);
      expect(wind.processClassList(undefined)).toEqual([]);
    });

    it("should filter out empty strings and non-string items", () => {
      const wind = createWindrunner();
      const rules = wind.processClassList("flex  items-center");

      // double space produces empty string which should be filtered
      expect(rules.length).toBe(2);
    });
  });

  describe("clearCache", () => {
    it("should reset cache size to 0", () => {
      const wind = createWindrunner();
      wind.processClassName("flex");
      wind.processClassName("block");
      expect(wind.getCacheSize()).toBe(2);

      wind.clearCache();
      expect(wind.getCacheSize()).toBe(0);
    });

    it("should allow re-compilation after clearing", () => {
      const wind = createWindrunner();
      const first = wind.processClassName("flex");
      wind.clearCache();
      const second = wind.processClassName("flex");

      expect(first).toBe(second);
      expect(wind.getCacheSize()).toBe(1);
    });
  });

  describe("getStats", () => {
    it("should return correct stats after compilation", () => {
      const wind = createWindrunner();
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("invalid-xyz-999");

      const stats = wind.getStats();
      expect(stats.cacheSize).toBe(3);
      expect(stats.isObserving).toBe(false);
      expect(stats.isCompatLoaded).toBe(false);
      expect(stats.pendingElementCount).toBe(0);
    });
  });

  describe("maxCacheSize", () => {
    it("should evict oldest entries when cache exceeds max size", () => {
      const wind = createWindrunner({ maxCacheSize: 3 });
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");

      expect(wind.getCacheSize()).toBe(3);

      // This should evict 'flex' (oldest)
      wind.processClassName("hidden");
      expect(wind.getCacheSize()).toBe(3);
    });

    it("should use default maxCacheSize of 10000 if not specified", () => {
      const wind = createWindrunner();
      // Just verify it doesn't crash — we can't easily test 10000 entries
      wind.processClassName("flex");
      expect(wind.getCacheSize()).toBe(1);
    });
  });

  describe("onError callback", () => {
    it("should call onError when a class fails to compile", () => {
      const onError = vi.fn();
      const wind = createWindrunner({ onError });

      wind.processClassName("totally-invalid-class-xyz");

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith("totally-invalid-class-xyz");
    });

    it("should NOT call onError for valid classes", () => {
      const onError = vi.fn();
      const wind = createWindrunner({ onError });

      wind.processClassName("flex");

      expect(onError).not.toHaveBeenCalled();
    });

    it("should call onError for each invalid class in a list", () => {
      const onError = vi.fn();
      const wind = createWindrunner({ onError });

      wind.processClassList("flex zzzz-invalid aaaa-fake block");

      // 'zzzz-invalid' and 'aaaa-fake' should trigger onError
      expect(onError).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenCalledWith("zzzz-invalid");
      expect(onError).toHaveBeenCalledWith("aaaa-fake");
    });
  });

  describe("onCompile callback", () => {
    it("should call onCompile when a class is successfully compiled", () => {
      const onCompile = vi.fn();
      const wind = createWindrunner({ onCompile });

      wind.processClassName("flex");

      expect(onCompile).toHaveBeenCalledTimes(1);
      expect(onCompile).toHaveBeenCalledWith("flex", ".flex { display: flex; }");
    });

    it("should NOT call onCompile for invalid classes", () => {
      const onCompile = vi.fn();
      const wind = createWindrunner({ onCompile });

      wind.processClassName("totally-invalid-zzz");

      expect(onCompile).not.toHaveBeenCalled();
    });

    it("should call onCompile for each valid class in a list", () => {
      const onCompile = vi.fn();
      const wind = createWindrunner({ onCompile });

      wind.processClassList("flex block invalid-zzz");

      expect(onCompile).toHaveBeenCalledTimes(2);
    });
  });

  describe("disconnect", () => {
    it("should be callable without errors in Node.js environment", () => {
      const wind = createWindrunner();
      wind.processClassName("flex");

      expect(() => wind.disconnect()).not.toThrow();
    });

    it("should clear pending elements", () => {
      const wind = createWindrunner();
      wind.disconnect();

      const stats = wind.getStats();
      expect(stats.pendingElementCount).toBe(0);
      expect(stats.isObserving).toBe(false);
    });
  });

  describe("processElement", () => {
    it("should handle null element gracefully", () => {
      const wind = createWindrunner();
      expect(() => wind.processElement(null)).not.toThrow();
    });

    it("should handle element without classList gracefully", () => {
      const wind = createWindrunner();
      expect(() => wind.processElement({})).not.toThrow();
    });
  });

  describe("start in non-DOM environment", () => {
    it("should not throw when called without DOM", () => {
      const wind = createWindrunner();
      expect(() => wind.start()).not.toThrow();
    });
  });

  describe("custom theme", () => {
    it("should compile classes using custom theme values", () => {
      const wind = createWindrunner({
        theme: {
          extend: {
            colors: {
              brand: "#ff6b6b",
            },
          },
        },
      });

      const rule = wind.processClassName("text-brand");
      expect(rule).toContain("#ff6b6b");
    });
  });

  describe("plugin integration", () => {
    it("should compile custom plugin utilities via runtime", async () => {
      const { plugin } = await import("./plugins.js");

      const myPlugin = plugin(({ addUtility }) => {
        addUtility("glass", "backdrop-filter: blur(10px); background: rgba(255,255,255,0.1);");
      });

      const wind = createWindrunner({ plugins: [myPlugin] });
      const rule = wind.processClassName("glass");

      expect(rule).toContain("backdrop-filter: blur(10px)");
    });
  });
});
