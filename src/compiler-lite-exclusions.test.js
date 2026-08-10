import { describe, it, expect } from "vitest";
import {
  compileClass,
  compileBaseTokenLite,
  applyVariantsLite,
  checkLiteExclusion,
  checkLiteVariantExclusion,
  LITE_PREFIX_ROUTER,
  LITE_VARIANT_MAP,
  resolveRuntimeContextLite,
} from "./compiler-lite.js";

describe("Lite Build Exclusions", () => {
  // Test context for lite mode
  const liteContext = resolveRuntimeContextLite({});

  describe("Excluded Utility Categories", () => {
    describe("Transforms", () => {
      it("should exclude rotate utilities", () => {
        expect(checkLiteExclusion("rotate-45")).toEqual({
          excluded: true,
          category: "transforms",
        });
        
        const result = compileBaseTokenLite("rotate-45", {}, null, liteContext);
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "transforms",
          baseToken: "rotate-45",
        });
      });

      it("should exclude scale utilities", () => {
        expect(checkLiteExclusion("scale-150")).toEqual({
          excluded: true,
          category: "transforms",
        });
        
        const result = compileBaseTokenLite("scale-150", {}, null, liteContext);
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "transforms",
          baseToken: "scale-150",
        });
      });

      it("should exclude translate utilities", () => {
        expect(checkLiteExclusion("translate-x-4")).toEqual({
          excluded: true,
          category: "transforms",
        });
        
        const result = compileBaseTokenLite("translate-x-4", {}, null, liteContext);
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "transforms",
          baseToken: "translate-x-4",
        });
      });

      it("should exclude skew utilities", () => {
        expect(checkLiteExclusion("skew-x-12")).toEqual({
          excluded: true,
          category: "transforms",
        });
        
        const result = compileBaseTokenLite("skew-x-12", {}, null, liteContext);
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "transforms",
          baseToken: "skew-x-12",
        });
      });

      it("should exclude origin utilities", () => {
        expect(checkLiteExclusion("origin-center")).toEqual({
          excluded: true,
          category: "transforms",
        });
      });

      it("should exclude perspective utilities", () => {
        expect(checkLiteExclusion("perspective-1000")).toEqual({
          excluded: true,
          category: "transforms",
        });
      });

      it("should exclude transform utilities", () => {
        expect(checkLiteExclusion("transform-gpu")).toEqual({
          excluded: true,
          category: "transforms",
        });
      });
    });

    describe("Filters", () => {
      it("should exclude blur utilities", () => {
        expect(checkLiteExclusion("blur-sm")).toEqual({
          excluded: true,
          category: "filters",
        });
        
        const result = compileBaseTokenLite("blur-sm", {}, null, liteContext);
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "filters",
          baseToken: "blur-sm",
        });
      });

      it("should exclude brightness utilities", () => {
        expect(checkLiteExclusion("brightness-150")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude contrast utilities", () => {
        expect(checkLiteExclusion("contrast-200")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude grayscale utilities", () => {
        expect(checkLiteExclusion("grayscale")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude hue-rotate utilities", () => {
        expect(checkLiteExclusion("hue-rotate-90")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude invert utilities", () => {
        expect(checkLiteExclusion("invert")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude saturate utilities", () => {
        expect(checkLiteExclusion("saturate-200")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude sepia utilities", () => {
        expect(checkLiteExclusion("sepia")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude drop-shadow utilities", () => {
        expect(checkLiteExclusion("drop-shadow-lg")).toEqual({
          excluded: true,
          category: "filters",
        });
      });

      it("should exclude backdrop-* utilities", () => {
        expect(checkLiteExclusion("backdrop-blur")).toEqual({
          excluded: true,
          category: "filters",
        });
        
        expect(checkLiteExclusion("backdrop-brightness-50")).toEqual({
          excluded: true,
          category: "filters",
        });
      });
    });

    describe("Transitions", () => {
      it("should exclude transition utilities", () => {
        expect(checkLiteExclusion("transition")).toEqual({
          excluded: true,
          category: "transitions",
        });
        
        const result = compileBaseTokenLite("transition", {}, null, liteContext);
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "transitions",
          baseToken: "transition",
        });
      });

      it("should exclude duration utilities", () => {
        expect(checkLiteExclusion("duration-300")).toEqual({
          excluded: true,
          category: "transitions",
        });
      });

      it("should exclude delay utilities", () => {
        expect(checkLiteExclusion("delay-150")).toEqual({
          excluded: true,
          category: "transitions",
        });
      });

      it("should exclude ease utilities", () => {
        expect(checkLiteExclusion("ease-in-out")).toEqual({
          excluded: true,
          category: "transitions",
        });
      });
    });

    describe("Animations", () => {
      it("should exclude animate-spin", () => {
        expect(checkLiteExclusion("animate-spin")).toEqual({
          excluded: true,
          category: "animations",
        });
        
        const result = compileBaseTokenLite("animate-spin", {}, null, liteContext);
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "animations",
          baseToken: "animate-spin",
        });
      });

      it("should exclude animate-ping", () => {
        expect(checkLiteExclusion("animate-ping")).toEqual({
          excluded: true,
          category: "animations",
        });
      });

      it("should exclude animate-pulse", () => {
        expect(checkLiteExclusion("animate-pulse")).toEqual({
          excluded: true,
          category: "animations",
        });
      });

      it("should exclude animate-bounce", () => {
        expect(checkLiteExclusion("animate-bounce")).toEqual({
          excluded: true,
          category: "animations",
        });
      });
    });
  });

  describe("Included Utilities (Core)", () => {
    it("should include layout utilities", () => {
      expect(checkLiteExclusion("flex")).toEqual({ excluded: false });
      expect(checkLiteExclusion("block")).toEqual({ excluded: false });
      expect(checkLiteExclusion("hidden")).toEqual({ excluded: false });
      
      // Should compile successfully
      const css = compileClass("flex", {});
      expect(css).toContain("display: flex");
    });

    it("should include spacing utilities", () => {
      expect(checkLiteExclusion("m-4")).toEqual({ excluded: false });
      expect(checkLiteExclusion("p-8")).toEqual({ excluded: false });
      
      // Should compile successfully
      const css = compileClass("p-4", { theme: { spacing: { 4: "1rem" } } });
      expect(css).toContain("padding: 1rem");
    });

    it("should include sizing utilities", () => {
      expect(checkLiteExclusion("w-full")).toEqual({ excluded: false });
      expect(checkLiteExclusion("h-screen")).toEqual({ excluded: false });
    });

    it("should include typography utilities", () => {
      expect(checkLiteExclusion("text-xl")).toEqual({ excluded: false });
      expect(checkLiteExclusion("font-bold")).toEqual({ excluded: false });
    });

    it("should include color utilities", () => {
      expect(checkLiteExclusion("bg-blue-500")).toEqual({ excluded: false });
      expect(checkLiteExclusion("text-red-600")).toEqual({ excluded: false });
    });

    it("should include border utilities", () => {
      expect(checkLiteExclusion("border")).toEqual({ excluded: false });
      expect(checkLiteExclusion("rounded-lg")).toEqual({ excluded: false });
    });

    it("should include basic effect utilities", () => {
      expect(checkLiteExclusion("shadow-lg")).toEqual({ excluded: false });
      expect(checkLiteExclusion("opacity-50")).toEqual({ excluded: false });
      expect(checkLiteExclusion("ring-2")).toEqual({ excluded: false });
      
      // Should compile successfully
      const css = compileClass("opacity-50", { theme: { opacity: { 50: "0.5" } } });
      expect(css).toContain("opacity: 0.5");
    });
  });

  describe("Excluded Variant Categories", () => {
    describe("Group Variants", () => {
      it("should exclude basic group variants", () => {
        expect(checkLiteVariantExclusion("group")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should exclude group-* state variants", () => {
        expect(checkLiteVariantExclusion("group-hover")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("group-focus")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should exclude named group variants", () => {
        expect(checkLiteVariantExclusion("group/sidebar")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("group-hover/nav")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should return error context when applying group variants", () => {
        const selector = ".test";
        const result = applyVariantsLite(selector, ["group-hover"], null, liteContext);
        
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "advanced-variants",
          variant: "group-hover",
        });
      });
    });

    describe("Peer Variants", () => {
      it("should exclude basic peer variants", () => {
        expect(checkLiteVariantExclusion("peer")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should exclude peer-* state variants", () => {
        expect(checkLiteVariantExclusion("peer-checked")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("peer-focus")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should exclude named peer variants", () => {
        expect(checkLiteVariantExclusion("peer/toggle")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("peer-checked/input")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should return error context when applying peer variants", () => {
        const selector = ".test";
        const result = applyVariantsLite(selector, ["peer-checked"], null, liteContext);
        
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "advanced-variants",
          variant: "peer-checked",
        });
      });
    });

    describe("has-* Variants", () => {
      it("should exclude has-* pseudo-class variants", () => {
        expect(checkLiteVariantExclusion("has-[:checked]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("has-[:focus]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should return error context when applying has-* variants", () => {
        const selector = ".test";
        const result = applyVariantsLite(selector, ["has-[:checked]"], null, liteContext);
        
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "advanced-variants",
          variant: "has-[:checked]",
        });
      });
    });

    describe("data-* Variants", () => {
      it("should exclude data-* attribute variants", () => {
        expect(checkLiteVariantExclusion("data-[state=open]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("data-[loading]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should return error context when applying data-* variants", () => {
        const selector = ".test";
        const result = applyVariantsLite(selector, ["data-[state=open]"], null, liteContext);
        
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "advanced-variants",
          variant: "data-[state=open]",
        });
      });
    });

    describe("aria-* Variants", () => {
      it("should exclude aria-* attribute variants", () => {
        expect(checkLiteVariantExclusion("aria-[expanded=true]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("aria-[hidden]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should return error context when applying aria-* variants", () => {
        const selector = ".test";
        const result = applyVariantsLite(selector, ["aria-[expanded=true]"], null, liteContext);
        
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "advanced-variants",
          variant: "aria-[expanded=true]",
        });
      });
    });

    describe("Arbitrary Variants", () => {
      it("should exclude arbitrary selector variants", () => {
        expect(checkLiteVariantExclusion("[&>span]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
        
        expect(checkLiteVariantExclusion("[&_p]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should exclude arbitrary media query variants", () => {
        expect(checkLiteVariantExclusion("[@media(hover:hover)]")).toEqual({
          excluded: true,
          category: "advanced-variants",
        });
      });

      it("should return error context when applying arbitrary variants", () => {
        const selector = ".test";
        const result = applyVariantsLite(selector, ["[&>span]"], null, liteContext);
        
        expect(result).toEqual({
          __error: true,
          reason: "lite-mode-excluded",
          category: "advanced-variants",
          variant: "[&>span]",
        });
      });
    });
  });

  describe("Included Variants (Basic)", () => {
    it("should include responsive breakpoint variants", () => {
      expect(checkLiteVariantExclusion("sm")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("md")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("lg")).toEqual({ excluded: false });
    });

    it("should include basic state variants", () => {
      expect(checkLiteVariantExclusion("hover")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("focus")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("active")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("disabled")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("focus-visible")).toEqual({ excluded: false });
      
      // Should apply successfully
      const selector = ".test";
      const result = applyVariantsLite(selector, ["hover"], null, liteContext);
      expect(result).toBe(".test:hover");
    });

    it("should include basic pseudo-element variants", () => {
      expect(checkLiteVariantExclusion("before")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("after")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("placeholder")).toEqual({ excluded: false });
    });

    it("should include structural pseudo-class variants", () => {
      expect(checkLiteVariantExclusion("first")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("last")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("odd")).toEqual({ excluded: false });
      expect(checkLiteVariantExclusion("even")).toEqual({ excluded: false });
    });

    it("should include dark mode variant", () => {
      expect(checkLiteVariantExclusion("dark")).toEqual({ excluded: false });
      
      const selector = ".test";
      const result = applyVariantsLite(selector, ["dark"], null, liteContext);
      expect(result).toBe(".dark .test");
    });
  });

  describe("Complete Class Compilation", () => {
    it("should return empty string for excluded utility classes", () => {
      expect(compileClass("rotate-45", {})).toBe("");
      expect(compileClass("blur-sm", {})).toBe("");
      expect(compileClass("transition", {})).toBe("");
      expect(compileClass("animate-spin", {})).toBe("");
    });

    it("should return empty string for excluded variant classes", () => {
      expect(compileClass("group-hover:bg-blue-500", {})).toBe("");
      expect(compileClass("peer-checked:text-green-500", {})).toBe("");
      expect(compileClass("has-[:checked]:bg-red-500", {})).toBe("");
      expect(compileClass("data-[state=open]:block", {})).toBe("");
      expect(compileClass("aria-[expanded=true]:rotate-180", {})).toBe("");
      expect(compileClass("[&>span]:text-blue-500", {})).toBe("");
    });

    it("should compile included utility classes successfully", () => {
      const css = compileClass("flex", {});
      expect(css).toContain("display: flex");
      
      const css2 = compileClass("p-4", { theme: { spacing: { 4: "1rem" } } });
      expect(css2).toContain("padding: 1rem");
    });

    it("should compile classes with included variants successfully", () => {
      const css = compileClass("hover:bg-blue-500", {
        theme: { colors: { blue: { 500: "#3b82f6" } } },
      });
      expect(css).toContain(":hover");
      expect(css).toContain("background-color");
    });

    it("should handle mixed excluded and included utilities in class list", () => {
      // Included utility should work
      expect(compileClass("flex", {})).toContain("display: flex");
      
      // Excluded utility should return empty string
      expect(compileClass("rotate-45", {})).toBe("");
      
      // Included with included variant should work
      const css = compileClass("hover:flex", {});
      expect(css).toContain(":hover");
      expect(css).toContain("display: flex");
      
      // Included utility with excluded variant should fail
      expect(compileClass("group-hover:flex", {})).toBe("");
    });
  });

  describe("Error Context Category Validation", () => {
    it("should provide correct category for transform exclusions", () => {
      expect(checkLiteExclusion("rotate-90").category).toBe("transforms");
      expect(checkLiteExclusion("scale-50").category).toBe("transforms");
      expect(checkLiteExclusion("translate-y-4").category).toBe("transforms");
    });

    it("should provide correct category for filter exclusions", () => {
      expect(checkLiteExclusion("blur").category).toBe("filters");
      expect(checkLiteExclusion("brightness-50").category).toBe("filters");
      expect(checkLiteExclusion("backdrop-blur-sm").category).toBe("filters");
    });

    it("should provide correct category for transition exclusions", () => {
      expect(checkLiteExclusion("transition-all").category).toBe("transitions");
      expect(checkLiteExclusion("duration-500").category).toBe("transitions");
    });

    it("should provide correct category for animation exclusions", () => {
      expect(checkLiteExclusion("animate-spin").category).toBe("animations");
      expect(checkLiteExclusion("animate-bounce").category).toBe("animations");
    });

    it("should provide correct category for variant exclusions", () => {
      expect(checkLiteVariantExclusion("group-hover").category).toBe("advanced-variants");
      expect(checkLiteVariantExclusion("peer-checked").category).toBe("advanced-variants");
      expect(checkLiteVariantExclusion("has-[:focus]").category).toBe("advanced-variants");
      expect(checkLiteVariantExclusion("data-[open]").category).toBe("advanced-variants");
      expect(checkLiteVariantExclusion("aria-[hidden]").category).toBe("advanced-variants");
      expect(checkLiteVariantExclusion("[&>div]").category).toBe("advanced-variants");
    });
  });
});
