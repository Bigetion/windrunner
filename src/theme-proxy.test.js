import { describe, it, expect, beforeEach } from "vitest";
import { createLazyTheme, createLazyColorPalette, getThemeStats, getColorStats } from "./theme-proxy.js";

describe("theme-proxy", () => {
  describe("createLazyTheme", () => {
    it("creates a proxy that materializes values on first access", () => {
      const rawTheme = {
        colors: { blue: { 500: "oklch(0.5 0.2 250)" } },
        spacing: { 4: "1rem" }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      // Access colors - should materialize
      const colors = theme.colors;
      expect(colors).toEqual({ blue: { 500: "oklch(0.5 0.2 250)" } });
      
      // Access spacing - should materialize
      const spacing = theme.spacing;
      expect(spacing).toEqual({ 4: "1rem" });
    });

    it("resolves function-based theme values with theme accessor", () => {
      const rawTheme = {
        colors: { red: "oklch(0.6 0.2 20)" },
        backgroundColor: ({ theme }) => theme("colors")
      };
      
      const theme = createLazyTheme(rawTheme);
      
      // Accessing backgroundColor should resolve the function
      const bgColors = theme.backgroundColor;
      expect(bgColors).toEqual({ red: "oklch(0.6 0.2 20)" });
    });

    it("resolves nested theme references", () => {
      const rawTheme = {
        spacing: { 4: "1rem", 8: "2rem" },
        padding: ({ theme }) => theme("spacing"),
        margin: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing")
        })
      };
      
      const theme = createLazyTheme(rawTheme);
      
      const padding = theme.padding;
      expect(padding).toEqual({ 4: "1rem", 8: "2rem" });
      
      const margin = theme.margin;
      expect(margin).toEqual({
        auto: "auto",
        4: "1rem",
        8: "2rem"
      });
    });

    it("caches materialized values", () => {
      let callCount = 0;
      const rawTheme = {
        colors: () => {
          callCount++;
          return { blue: "oklch(0.5 0.2 250)" };
        }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      // First access - materializes
      const colors1 = theme.colors;
      expect(callCount).toBe(1);
      
      // Second access - from cache
      const colors2 = theme.colors;
      expect(callCount).toBe(1); // Should not increment
      
      // Should return same reference
      expect(colors1).toBe(colors2);
    });

    it("detects circular dependencies", () => {
      const rawTheme = {
        a: ({ theme }) => theme("b"),
        b: ({ theme }) => theme("a")
      };
      
      const theme = createLazyTheme(rawTheme);
      
      expect(() => theme.a).toThrow("Circular theme dependency detected: a");
    });

    it("supports has() trap for 'in' operator", () => {
      const rawTheme = {
        colors: { blue: "oklch(0.5 0.2 250)" },
        spacing: { 4: "1rem" }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      expect("colors" in theme).toBe(true);
      expect("spacing" in theme).toBe(true);
      expect("nonexistent" in theme).toBe(false);
    });

    it("supports ownKeys() trap for Object.keys()", () => {
      const rawTheme = {
        colors: { blue: "oklch(0.5 0.2 250)" },
        spacing: { 4: "1rem" },
        fontSize: { base: "1rem" }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      const keys = Object.keys(theme);
      expect(keys).toContain("colors");
      expect(keys).toContain("spacing");
      expect(keys).toContain("fontSize");
    });

    it("supports getOwnPropertyDescriptor() trap", () => {
      const rawTheme = {
        colors: { blue: "oklch(0.5 0.2 250)" }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      const descriptor = Object.getOwnPropertyDescriptor(theme, "colors");
      expect(descriptor).toBeDefined();
      expect(descriptor.enumerable).toBe(true);
      expect(descriptor.configurable).toBe(true);
    });

    it("returns undefined for non-existent properties", () => {
      const rawTheme = {
        colors: { blue: "oklch(0.5 0.2 250)" }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      expect(theme.nonexistent).toBeUndefined();
    });

    it("handles errors during resolution gracefully", () => {
      const rawTheme = {
        badValue: () => {
          throw new Error("Resolution error");
        }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      expect(() => theme.badValue).toThrow("Resolution error");
    });

    it("cleans up resolving set after error", () => {
      let firstCall = true;
      const rawTheme = {
        errorValue: () => {
          if (firstCall) {
            firstCall = false;
            throw new Error("First error");
          }
          return "success";
        }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      // First access throws
      expect(() => theme.errorValue).toThrow("First error");
      
      // Second access should work (resolving set was cleaned up)
      expect(theme.errorValue).toBe("success");
    });
  });

  describe("createLazyColorPalette", () => {
    it("creates a proxy for color palette", () => {
      const colors = {
        blue: { 500: "oklch(0.5 0.2 250)", 600: "oklch(0.4 0.2 250)" },
        red: { 500: "oklch(0.6 0.2 20)", 600: "oklch(0.5 0.2 20)" }
      };
      
      const palette = createLazyColorPalette(colors);
      
      expect(palette.blue).toEqual({ 500: "oklch(0.5 0.2 250)", 600: "oklch(0.4 0.2 250)" });
      expect(palette.red).toEqual({ 500: "oklch(0.6 0.2 20)", 600: "oklch(0.5 0.2 20)" });
    });

    it("tracks which color families are accessed", () => {
      const colors = {
        blue: { 500: "oklch(0.5 0.2 250)" },
        red: { 500: "oklch(0.6 0.2 20)" },
        green: { 500: "oklch(0.7 0.2 130)" }
      };
      
      const palette = createLazyColorPalette(colors);
      
      // Access only blue and red
      const blue = palette.blue;
      const red = palette.red;
      
      // Get stats
      const stats = getColorStats(palette);
      expect(stats.loadedFamilies).toContain("blue");
      expect(stats.loadedFamilies).toContain("red");
      expect(stats.loadedFamilies).not.toContain("green");
      expect(stats.loadedFamilies.length).toBe(2);
    });

    it("does not track primitive values", () => {
      const colors = {
        transparent: "transparent",
        current: "currentColor",
        blue: { 500: "oklch(0.5 0.2 250)" }
      };
      
      const palette = createLazyColorPalette(colors);
      
      // Access primitives
      const transparent = palette.transparent;
      const current = palette.current;
      
      // Only object families should be tracked
      const stats = getColorStats(palette);
      expect(stats.loadedFamilies).not.toContain("transparent");
      expect(stats.loadedFamilies).not.toContain("current");
    });

    it("tracks families only once on repeated access", () => {
      const colors = {
        blue: { 500: "oklch(0.5 0.2 250)" }
      };
      
      const palette = createLazyColorPalette(colors);
      
      // Access multiple times
      const blue1 = palette.blue;
      const blue2 = palette.blue;
      const blue3 = palette.blue;
      
      const stats = getColorStats(palette);
      expect(stats.loadedFamilies.length).toBe(1);
      expect(stats.loadedFamilies).toContain("blue");
    });
  });

  describe("getThemeStats", () => {
    it("returns stats for proxied theme", () => {
      const rawTheme = {
        colors: { blue: "oklch(0.5 0.2 250)" },
        spacing: { 4: "1rem" },
        fontSize: { base: "1rem" }
      };
      
      const theme = createLazyTheme(rawTheme);
      
      // Initially, nothing materialized
      let stats = getThemeStats(theme);
      expect(stats.materializedKeys).toBe(0);
      expect(stats.totalKeys).toBe(3);
      expect(stats.materializationRate).toBe(0);
      
      // Access colors
      const colors = theme.colors;
      stats = getThemeStats(theme);
      expect(stats.materializedKeys).toBe(1);
      expect(stats.materializationRate).toBeCloseTo(1/3);
      
      // Access spacing
      const spacing = theme.spacing;
      stats = getThemeStats(theme);
      expect(stats.materializedKeys).toBe(2);
      expect(stats.materializationRate).toBeCloseTo(2/3);
      
      // Access fontSize
      const fontSize = theme.fontSize;
      stats = getThemeStats(theme);
      expect(stats.materializedKeys).toBe(3);
      expect(stats.materializationRate).toBe(1);
    });

    it("returns null for non-proxied objects", () => {
      const plainObject = { colors: { blue: "oklch(0.5 0.2 250)" } };
      
      const stats = getThemeStats(plainObject);
      expect(stats).toBeNull();
    });

    it("returns null for null or undefined", () => {
      expect(getThemeStats(null)).toBeNull();
      expect(getThemeStats(undefined)).toBeNull();
    });

    it("returns null for non-object values", () => {
      expect(getThemeStats("string")).toBeNull();
      expect(getThemeStats(123)).toBeNull();
      expect(getThemeStats(true)).toBeNull();
    });

    it("handles empty theme", () => {
      const theme = createLazyTheme({});
      
      const stats = getThemeStats(theme);
      expect(stats.materializedKeys).toBe(0);
      expect(stats.totalKeys).toBe(0);
      expect(stats.materializationRate).toBe(0);
    });
  });

  describe("getColorStats", () => {
    it("returns stats for proxied color palette", () => {
      const colors = {
        blue: { 500: "oklch(0.5 0.2 250)" },
        red: { 500: "oklch(0.6 0.2 20)" },
        green: { 500: "oklch(0.7 0.2 130)" }
      };
      
      const palette = createLazyColorPalette(colors);
      
      // Initially, nothing loaded
      let stats = getColorStats(palette);
      expect(stats.loadedFamilies).toEqual([]);
      expect(stats.totalFamilies).toBe(3);
      expect(stats.usageRate).toBe(0);
      
      // Access blue
      const blue = palette.blue;
      stats = getColorStats(palette);
      expect(stats.loadedFamilies).toEqual(["blue"]);
      expect(stats.usageRate).toBeCloseTo(1/3);
      
      // Access red
      const red = palette.red;
      stats = getColorStats(palette);
      expect(stats.loadedFamilies).toContain("blue");
      expect(stats.loadedFamilies).toContain("red");
      expect(stats.loadedFamilies.length).toBe(2);
      expect(stats.usageRate).toBeCloseTo(2/3);
    });

    it("returns null for non-proxied objects", () => {
      const plainColors = { blue: { 500: "oklch(0.5 0.2 250)" } };
      
      const stats = getColorStats(plainColors);
      expect(stats).toBeNull();
    });

    it("returns null for null or undefined", () => {
      expect(getColorStats(null)).toBeNull();
      expect(getColorStats(undefined)).toBeNull();
    });

    it("handles empty color palette", () => {
      const palette = createLazyColorPalette({});
      
      const stats = getColorStats(palette);
      expect(stats.loadedFamilies).toEqual([]);
      expect(stats.totalFamilies).toBe(0);
      expect(stats.usageRate).toBe(0);
    });
  });

  describe("integration tests", () => {
    it("works with realistic Windrunner theme structure", () => {
      const rawTheme = {
        colors: {
          transparent: "transparent",
          black: "oklch(0% 0 0)",
          white: "oklch(100% 0 0)",
          blue: {
            500: "oklch(0.623 0.214 259.1)",
            600: "oklch(0.546 0.245 262.9)"
          }
        },
        backgroundColor: ({ theme }) => theme("colors"),
        textColor: ({ theme }) => theme("colors"),
        borderColor: ({ theme }) => ({
          ...theme("colors"),
          DEFAULT: "#e5e7eb"
        }),
        spacing: {
          0: "0px",
          1: "0.25rem",
          4: "1rem"
        },
        padding: ({ theme }) => theme("spacing"),
        margin: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing")
        })
      };
      
      const theme = createLazyTheme(rawTheme);
      
      // Access backgroundColor - should materialize both backgroundColor and colors
      const bgColors = theme.backgroundColor;
      expect(bgColors.blue).toEqual({
        500: "oklch(0.623 0.214 259.1)",
        600: "oklch(0.546 0.245 262.9)"
      });
      
      // Check stats
      const stats = getThemeStats(theme);
      expect(stats.materializedKeys).toBe(2); // backgroundColor and colors
      
      // Access borderColor
      const borderColors = theme.borderColor;
      expect(borderColors.DEFAULT).toBe("#e5e7eb");
      expect(borderColors.blue).toEqual(bgColors.blue);
      
      // Access margin
      const margin = theme.margin;
      expect(margin.auto).toBe("auto");
      expect(margin[4]).toBe("1rem");
    });

    it("handles complex nested theme resolution", () => {
      const rawTheme = {
        spacing: { 4: "1rem" },
        padding: ({ theme }) => theme("spacing"),
        inset: ({ theme }) => ({
          auto: "auto",
          ...theme("spacing")
        }),
        top: ({ theme }) => theme("inset"),
        left: ({ theme }) => theme("inset")
      };
      
      const theme = createLazyTheme(rawTheme);
      
      // Access top - should trigger chain: top -> inset -> spacing
      const top = theme.top;
      expect(top).toEqual({
        auto: "auto",
        4: "1rem"
      });
      
      // Check that all dependencies were materialized
      const stats = getThemeStats(theme);
      expect(stats.materializedKeys).toBeGreaterThanOrEqual(3);
    });

    it("prevents infinite loops with self-referencing theme functions", () => {
      const rawTheme = {
        a: ({ theme }) => theme("a")
      };
      
      const theme = createLazyTheme(rawTheme);
      
      expect(() => theme.a).toThrow("Circular theme dependency detected");
    });
  });
});
