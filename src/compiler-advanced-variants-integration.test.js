import { describe, it, expect } from "vitest";
import { compileRuntimeClassNameWithContext, compileClass } from "./compiler.js";

/**
 * Integration tests for Task 18/19: Advanced variant integration into compilation pipeline
 * 
 * These tests verify that advanced variants (has-*, data-*, aria-*) work correctly
 * throughout the full compilation pipeline, including:
 * - Correct CSS generation with :has() pseudo-class
 * - Correct attribute selector generation for data-* and aria-*
 * - Proper integration with responsive breakpoints
 * - Proper integration with important modifier
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9
 */
describe("Advanced variants - compilation pipeline integration", () => {
  const baseContext = {
    theme: {
      colors: {
        blue: { 500: "#3b82f6", 600: "#2563eb" },
        red: { 500: "#ef4444" },
        green: { 500: "#22c55e" },
        gray: { 900: "#111827" },
      },
      spacing: { 4: "1rem", 6: "1.5rem" },
      rotate: {
        0: "0deg",
        45: "45deg",
        90: "90deg",
        180: "180deg",
      },
      opacity: {
        0: "0",
        50: "0.5",
      },
    },
    screens: { md: "768px", lg: "1024px" },
    containers: {},
    plugins: null,
  };

  describe("has-* pseudo-class variants", () => {
    it("compiles has-[:checked]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("has-[:checked]:bg-blue-500", baseContext);
      
      // Should generate: .has-\[\:checked\]\:bg-blue-500:has(:checked) { background-color: #3b82f6; }
      expect(css).toContain(":has(:checked)");
      expect(css).toContain("background-color:");
      expect(css).toContain("#3b82f6");
    });

    it("compiles has-[:focus]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("has-[:focus]:border-red-500", baseContext);
      
      expect(css).toContain(":has(:focus)");
      expect(css).toContain("border-color:");
      expect(css).toContain("#ef4444");
    });

    it("compiles has-[:invalid]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("has-[:invalid]:ring-red-500", baseContext);
      
      expect(css).toContain(":has(:invalid)");
      expect(css).toContain("--tw-ring-color:");
      expect(css).toContain("#ef4444");
    });

    it("compiles has-[...] with attribute selectors", () => {
      const css = compileRuntimeClassNameWithContext("has-[[data-active]]:bg-green-500", baseContext);
      
      expect(css).toContain(":has([data-active])");
      expect(css).toContain("background-color:");
      expect(css).toContain("#22c55e");
    });

    it("compiles has-[...] with descendant selectors", () => {
      const css = compileRuntimeClassNameWithContext("has-[>input:checked]:bg-blue-500", baseContext);
      
      expect(css).toContain(":has(>input:checked)");
      expect(css).toContain("background-color:");
      expect(css).toContain("#3b82f6");
    });

    it("compiles has-[...] with class selectors", () => {
      const css = compileRuntimeClassNameWithContext("has-[.active]:text-blue-600", baseContext);
      
      expect(css).toContain(":has(.active)");
      expect(css).toContain("color:");
      expect(css).toContain("#2563eb");
    });
  });

  describe("group-has-* variants", () => {
    it("compiles group-has-[:checked]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("group-has-[:checked]:bg-green-500", baseContext);
      
      // Should generate: .group:has(:checked) .group-has-\[\:checked\]\:bg-green-500 { background-color: #22c55e; }
      expect(css).toContain(".group:has(:checked)");
      expect(css).toContain("background-color:");
      expect(css).toContain("#22c55e");
    });

    it("compiles group-has-[:focus]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("group-has-[:focus]:ring-blue-500", baseContext);
      
      expect(css).toContain(".group:has(:focus)");
      expect(css).toContain("--tw-ring-color:");
      expect(css).toContain("#3b82f6");
    });

    it("compiles group-has-[...] with attribute selectors", () => {
      const css = compileRuntimeClassNameWithContext("group-has-[[data-state=open]]:text-red-500", baseContext);
      
      expect(css).toContain(".group:has([data-state=open])");
      expect(css).toContain("color:");
      expect(css).toContain("#ef4444");
    });

    it("compiles group-has-[...] with descendant selectors", () => {
      const css = compileRuntimeClassNameWithContext("group-has-[>button:hover]:bg-gray-900", baseContext);
      
      expect(css).toContain(".group:has(>button:hover)");
      expect(css).toContain("background-color:");
      expect(css).toContain("#111827");
    });
  });

  describe("peer-has-* variants", () => {
    it("compiles peer-has-[:checked]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("peer-has-[:checked]:text-green-500", baseContext);
      
      // Should generate: .peer:has(:checked) ~ .peer-has-\[\:checked\]\:text-green-500 { color: #22c55e; }
      expect(css).toContain(".peer:has(:checked) ~");
      expect(css).toContain("color:");
      expect(css).toContain("#22c55e");
    });

    it("compiles peer-has-[:invalid]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("peer-has-[:invalid]:border-red-500", baseContext);
      
      expect(css).toContain(".peer:has(:invalid) ~");
      expect(css).toContain("border-color:");
      expect(css).toContain("#ef4444");
    });

    it("compiles peer-has-[...] with attribute selectors", () => {
      const css = compileRuntimeClassNameWithContext("peer-has-[[aria-expanded=true]]:rotate-180", baseContext);
      
      expect(css).toContain(".peer:has([aria-expanded=true]) ~");
      expect(css).toContain("transform:");
      expect(css).toContain("rotate(180deg)");
    });

    it("compiles peer-has-[...] with descendant selectors", () => {
      const css = compileRuntimeClassNameWithContext("peer-has-[>input:focus]:ring-blue-600", baseContext);
      
      expect(css).toContain(".peer:has(>input:focus) ~");
      expect(css).toContain("--tw-ring-color:");
      expect(css).toContain("#2563eb");
    });
  });

  describe("data-* attribute variants", () => {
    it("compiles data-[attr]:utility without value", () => {
      const css = compileRuntimeClassNameWithContext("data-[loading]:opacity-50", baseContext);
      
      // Should generate: .data-\[loading\]\:opacity-50[data-loading] { opacity: 0.5; }
      expect(css).toContain("[data-loading]");
      expect(css).toContain("opacity:");
    });

    it("compiles data-[attr=value]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("data-[state=open]:block", baseContext);
      
      // Should generate: .data-\[state\=open\]\:block[data-state="open"] { display: block; }
      expect(css).toContain('[data-state="open"]');
      expect(css).toContain("display:");
      expect(css).toContain("block");
    });

    it("compiles data-[attr=value] with hyphenated attributes", () => {
      const css = compileRuntimeClassNameWithContext("data-[dropdown-open=true]:flex", baseContext);
      
      expect(css).toContain('[data-dropdown-open="true"]');
      expect(css).toContain("display:");
      expect(css).toContain("flex");
    });

    it("compiles data-[attr=value] with numeric values", () => {
      const css = compileRuntimeClassNameWithContext("data-[level=2]:bg-blue-500", baseContext);
      
      expect(css).toContain('[data-level="2"]');
      expect(css).toContain("background-color:");
      expect(css).toContain("#3b82f6");
    });

    it("compiles data-[attr=value] with color utilities", () => {
      const css = compileRuntimeClassNameWithContext("data-[active]:bg-green-500", baseContext);
      
      expect(css).toContain("[data-active]");
      expect(css).toContain("background-color:");
      expect(css).toContain("#22c55e");
    });

    it("compiles data-[attr=value] with spacing utilities", () => {
      const css = compileRuntimeClassNameWithContext("data-[expanded=true]:p-6", baseContext);
      
      expect(css).toContain('[data-expanded="true"]');
      expect(css).toContain("padding:");
      expect(css).toContain("1.5rem");
    });
  });

  describe("aria-* attribute variants", () => {
    it("compiles aria-[attr]:utility without value", () => {
      const css = compileRuntimeClassNameWithContext("aria-[hidden]:opacity-0", baseContext);
      
      // Should generate: .aria-\[hidden\]\:opacity-0[aria-hidden] { opacity: 0; }
      expect(css).toContain("[aria-hidden]");
      expect(css).toContain("opacity:");
    });

    it("compiles aria-[attr=value]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("aria-[expanded=true]:rotate-180", baseContext);
      
      // Should generate: .aria-\[expanded\=true\]\:rotate-180[aria-expanded="true"] { transform: rotate(180deg); }
      expect(css).toContain('[aria-expanded="true"]');
      expect(css).toContain("transform:");
      expect(css).toContain("rotate(180deg)");
    });

    it("compiles aria-[attr=value] with false values", () => {
      const css = compileRuntimeClassNameWithContext("aria-[expanded=false]:rotate-0", baseContext);
      
      expect(css).toContain('[aria-expanded="false"]');
      expect(css).toContain("transform:");
      expect(css).toContain("rotate(0deg)");
    });

    it("compiles aria-[attr=value] with hyphenated attributes", () => {
      const css = compileRuntimeClassNameWithContext("aria-[current-page=true]:text-blue-600", baseContext);
      
      expect(css).toContain('[aria-current-page="true"]');
      expect(css).toContain("color:");
      expect(css).toContain("#2563eb");
    });

    it("compiles aria-[attr=value] with color utilities", () => {
      const css = compileRuntimeClassNameWithContext("aria-[disabled=true]:text-gray-900", baseContext);
      
      expect(css).toContain('[aria-disabled="true"]');
      expect(css).toContain("color:");
      expect(css).toContain("#111827");
    });

    it("compiles aria-[attr=value] with display utilities", () => {
      const css = compileRuntimeClassNameWithContext("aria-[selected=true]:block", baseContext);
      
      expect(css).toContain('[aria-selected="true"]');
      expect(css).toContain("display:");
      expect(css).toContain("block");
    });
  });

  describe("Responsive breakpoint combinations", () => {
    it("compiles md:has-[:checked]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("md:has-[:checked]:bg-blue-500", baseContext);
      
      expect(css).toContain("@media (min-width: 768px)");
      expect(css).toContain(":has(:checked)");
      expect(css).toContain("background-color:");
    });

    it("compiles lg:data-[state=open]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("lg:data-[state=open]:flex", baseContext);
      
      expect(css).toContain("@media (min-width: 1024px)");
      expect(css).toContain('[data-state="open"]');
      expect(css).toContain("display:");
      expect(css).toContain("flex");
    });

    it("compiles md:aria-[expanded=true]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("md:aria-[expanded=true]:rotate-180", baseContext);
      
      expect(css).toContain("@media (min-width: 768px)");
      expect(css).toContain('[aria-expanded="true"]');
      expect(css).toContain("transform:");
      expect(css).toContain("rotate(180deg)");
    });

    it("compiles lg:group-has-[:focus]:utility correctly", () => {
      const css = compileRuntimeClassNameWithContext("lg:group-has-[:focus]:ring-blue-500", baseContext);
      
      expect(css).toContain("@media (min-width: 1024px)");
      expect(css).toContain(".group:has(:focus)");
      expect(css).toContain("--tw-ring-color:");
    });
  });

  describe("Important modifier combinations", () => {
    it("compiles data-[state=open]:!block correctly", () => {
      const css = compileRuntimeClassNameWithContext("data-[state=open]:!block", baseContext);
      
      expect(css).toContain('[data-state="open"]');
      expect(css).toContain("display:");
      expect(css).toContain("block");
      expect(css).toContain("!important");
    });

    it("compiles aria-[hidden]:!hidden correctly", () => {
      const css = compileRuntimeClassNameWithContext("aria-[hidden]:!hidden", baseContext);
      
      expect(css).toContain("[aria-hidden]");
      expect(css).toContain("display:");
      expect(css).toContain("none");
      expect(css).toContain("!important");
    });

    it("compiles has-[:checked]:!bg-green-500 correctly", () => {
      const css = compileRuntimeClassNameWithContext("has-[:checked]:!bg-green-500", baseContext);
      
      expect(css).toContain(":has(:checked)");
      expect(css).toContain("background-color:");
      expect(css).toContain("#22c55e");
      expect(css).toContain("!important");
    });
  });

  describe("Complex combinations", () => {
    it("compiles md:data-[state=open]:!flex correctly", () => {
      const css = compileRuntimeClassNameWithContext("md:data-[state=open]:!flex", baseContext);
      
      expect(css).toContain("@media (min-width: 768px)");
      expect(css).toContain('[data-state="open"]');
      expect(css).toContain("display:");
      expect(css).toContain("flex");
      expect(css).toContain("!important");
    });

    it("compiles lg:has-[:focus]:!ring-blue-600 correctly", () => {
      const css = compileRuntimeClassNameWithContext("lg:has-[:focus]:!ring-blue-600", baseContext);
      
      expect(css).toContain("@media (min-width: 1024px)");
      expect(css).toContain(":has(:focus)");
      expect(css).toContain("--tw-ring-color:");
      expect(css).toContain("#2563eb");
      expect(css).toContain("!important");
    });

    it("compiles md:aria-[expanded=true]:!rotate-180 correctly", () => {
      const css = compileRuntimeClassNameWithContext("md:aria-[expanded=true]:!rotate-180", baseContext);
      
      expect(css).toContain("@media (min-width: 768px)");
      expect(css).toContain('[aria-expanded="true"]');
      expect(css).toContain("transform:");
      expect(css).toContain("rotate(180deg)");
      expect(css).toContain("!important");
    });
  });

  describe("Edge cases and special characters", () => {
    it("compiles data attributes with dashes in values", () => {
      const css = compileRuntimeClassNameWithContext("data-[state=open-active]:bg-blue-500", baseContext);
      
      expect(css).toContain('[data-state="open-active"]');
      expect(css).toContain("background-color:");
    });

    it("compiles aria attributes with underscores", () => {
      const css = compileRuntimeClassNameWithContext("aria-[aria_expanded=true]:rotate-180", baseContext);
      
      expect(css).toContain('[aria-aria_expanded="true"]');
      expect(css).toContain("transform:");
    });

    it("compiles has-[...] with spaces in selectors", () => {
      const css = compileRuntimeClassNameWithContext("has-[> .child]:text-blue-500", baseContext);
      
      expect(css).toContain(":has(> .child)");
      expect(css).toContain("color:");
    });

    it("compiles has-[...] with multiple pseudo-classes", () => {
      const css = compileRuntimeClassNameWithContext("has-[:hover:focus]:border-red-500", baseContext);
      
      expect(css).toContain(":has(:hover:focus)");
      expect(css).toContain("border-color:");
    });
  });

  describe("Using compileClass shorthand", () => {
    it("compiles data-[state=open]:block using compileClass", () => {
      const css = compileClass("data-[state=open]:block");
      
      expect(css).toContain('[data-state="open"]');
      expect(css).toContain("display:");
      expect(css).toContain("block");
    });

    it("compiles aria-[expanded=true]:rotate-180 using compileClass", () => {
      const css = compileClass("aria-[expanded=true]:rotate-180");
      
      expect(css).toContain('[aria-expanded="true"]');
      expect(css).toContain("transform:");
      expect(css).toContain("rotate(180deg)");
    });

    it("compiles has-[:checked]:bg-green-500 using compileClass", () => {
      const css = compileClass("has-[:checked]:bg-green-500");
      
      expect(css).toContain(":has(:checked)");
      expect(css).toContain("background-color:");
    });

    it("compiles group-has-[:focus]:ring-blue-500 using compileClass", () => {
      const css = compileClass("group-has-[:focus]:ring-blue-500");
      
      expect(css).toContain(".group:has(:focus)");
      expect(css).toContain("--tw-ring-color:");
    });

    it("compiles peer-has-[:invalid]:text-red-500 using compileClass", () => {
      const css = compileClass("peer-has-[:invalid]:text-red-500");
      
      expect(css).toContain(".peer:has(:invalid) ~");
      expect(css).toContain("color:");
    });
  });
});
