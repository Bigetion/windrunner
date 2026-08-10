import { describe, it, expect } from "vitest";
import { compileRuntimeClassNameWithContext, compileClass } from "./compiler.js";

describe("Named Variant CSS Generation", () => {
  const baseContext = {
    theme: {
      colors: {
        blue: { 500: "#3b82f6", 100: "#dbeafe" },
        green: { 500: "#22c55e" },
        gray: { 100: "#f3f4f6" },
      },
    },
    screens: { md: "768px" },
    containers: {},
  };

  describe("Group marker classes", () => {
    it("generates escaped forward slash for group/[name] marker", () => {
      const css = compileRuntimeClassNameWithContext("group/sidebar", baseContext);
      // Marker classes don't have declarations, they're just markers
      // So we're checking that the escaped selector is generated
      expect(css).toContain(".group\\/sidebar");
    });

    it("generates escaped forward slash for group/[name] with various names", () => {
      expect(compileRuntimeClassNameWithContext("group/nav", baseContext)).toContain(".group\\/nav");
      expect(compileRuntimeClassNameWithContext("group/card", baseContext)).toContain(".group\\/card");
      expect(compileRuntimeClassNameWithContext("group/menu", baseContext)).toContain(".group\\/menu");
    });
  });

  describe("Named group state variants", () => {
    it("generates .group\\/[name]:state .selector for group-hover/[name]:", () => {
      const css = compileRuntimeClassNameWithContext("group-hover/sidebar:bg-blue-500", baseContext);
      
      // Should generate: .group\/sidebar:hover .group-hover\/sidebar\:bg-blue-500 { background-color: #3b82f6; }
      expect(css).toContain(".group\\/sidebar:hover");
      expect(css).toContain("group-hover\\/sidebar\\:bg-blue-500");
      expect(css).toContain("background-color:");
      expect(css).toContain("#3b82f6");
    });

    it("generates correct selector for group-focus/[name]:", () => {
      const css = compileRuntimeClassNameWithContext("group-focus/card:bg-gray-100", baseContext);
      
      expect(css).toContain(".group\\/card:focus");
      expect(css).toContain("group-focus\\/card\\:bg-gray-100");
      expect(css).toContain("background-color:");
    });

    it("generates correct selector for group-active/[name]:", () => {
      const css = compileRuntimeClassNameWithContext("group-active/nav:bg-blue-100", baseContext);
      
      expect(css).toContain(".group\\/nav:active");
      expect(css).toContain("group-active\\/nav\\:bg-blue-100");
      expect(css).toContain("background-color:");
    });

    it("handles multiple named groups with different names", () => {
      const css1 = compileRuntimeClassNameWithContext("group-hover/sidebar:bg-blue-500", baseContext);
      const css2 = compileRuntimeClassNameWithContext("group-hover/menu:bg-green-500", baseContext);
      
      // Should be different selectors
      expect(css1).toContain(".group\\/sidebar:hover");
      expect(css2).toContain(".group\\/menu:hover");
      expect(css1).not.toContain(".group\\/menu");
      expect(css2).not.toContain(".group\\/sidebar");
    });
  });

  describe("Peer marker classes", () => {
    it("generates escaped forward slash for peer/[name] marker", () => {
      const css = compileRuntimeClassNameWithContext("peer/toggle", baseContext);
      
      expect(css).toContain(".peer\\/toggle");
    });

    it("generates escaped forward slash for peer/[name] with various names", () => {
      expect(compileRuntimeClassNameWithContext("peer/input", baseContext)).toContain(".peer\\/input");
      expect(compileRuntimeClassNameWithContext("peer/checkbox", baseContext)).toContain(".peer\\/checkbox");
      expect(compileRuntimeClassNameWithContext("peer/radio", baseContext)).toContain(".peer\\/radio");
    });
  });

  describe("Named peer state variants", () => {
    it("generates .peer\\/[name]:state ~ .selector for peer-checked/[name]:", () => {
      const css = compileRuntimeClassNameWithContext("peer-checked/toggle:bg-green-500", baseContext);
      
      // Should generate: .peer\/toggle:checked ~ .peer-checked\/toggle\:bg-green-500 { background-color: #22c55e; }
      expect(css).toContain(".peer\\/toggle:checked ~");
      expect(css).toContain("peer-checked\\/toggle\\:bg-green-500");
      expect(css).toContain("background-color:");
      expect(css).toContain("#22c55e");
    });

    it("generates correct selector for peer-focus/[name]:", () => {
      const css = compileRuntimeClassNameWithContext("peer-focus/input:bg-blue-100", baseContext);
      
      expect(css).toContain(".peer\\/input:focus ~");
      expect(css).toContain("peer-focus\\/input\\:bg-blue-100");
      expect(css).toContain("background-color:");
    });

    it("generates correct selector for peer-hover/[name]:", () => {
      const css = compileRuntimeClassNameWithContext("peer-hover/checkbox:bg-gray-100", baseContext);
      
      expect(css).toContain(".peer\\/checkbox:hover ~");
      expect(css).toContain("peer-hover\\/checkbox\\:bg-gray-100");
      expect(css).toContain("background-color:");
    });

    it("generates correct selector for peer-disabled/[name]:", () => {
      const css = compileRuntimeClassNameWithContext("peer-disabled/radio:bg-gray-100", baseContext);
      
      expect(css).toContain(".peer\\/radio:disabled ~");
      expect(css).toContain("peer-disabled\\/radio\\:bg-gray-100");
      expect(css).toContain("background-color:");
    });

    it("handles multiple named peers with different names", () => {
      const css1 = compileRuntimeClassNameWithContext("peer-checked/toggle:bg-green-500", baseContext);
      const css2 = compileRuntimeClassNameWithContext("peer-checked/input:bg-blue-500", baseContext);
      
      // Should be different selectors
      expect(css1).toContain(".peer\\/toggle:checked");
      expect(css2).toContain(".peer\\/input:checked");
      expect(css1).not.toContain(".peer\\/input");
      expect(css2).not.toContain(".peer\\/toggle");
    });
  });

  describe("Forward slash escaping", () => {
    it("properly escapes forward slashes in CSS selectors", () => {
      const css = compileRuntimeClassNameWithContext("group-hover/sidebar:bg-blue-500", baseContext);
      
      // Forward slashes should be escaped as \/
      expect(css).toMatch(/\.group\\\/sidebar:hover/);
      expect(css).toMatch(/group-hover\\\/sidebar/);
    });

    it("properly escapes forward slashes in peer selectors", () => {
      const css = compileRuntimeClassNameWithContext("peer-checked/toggle:bg-green-500", baseContext);
      
      // Forward slashes should be escaped as \/
      expect(css).toMatch(/\.peer\\\/toggle:checked/);
      expect(css).toMatch(/peer-checked\\\/toggle/);
    });
  });

  describe("Preserving unnamed group/peer behavior", () => {
    it("still handles unnamed group-hover correctly", () => {
      const css = compileRuntimeClassNameWithContext("group-hover:bg-blue-500", baseContext);
      
      // Should generate: .group:hover .group-hover\:bg-blue-500 { ... }
      expect(css).toContain(".group:hover");
      expect(css).not.toContain(".group\\/"); // No named variant
      expect(css).toContain("background-color:");
    });

    it("still handles unnamed peer-checked correctly", () => {
      const css = compileRuntimeClassNameWithContext("peer-checked:bg-green-500", baseContext);
      
      // Should generate: .peer:checked ~ .peer-checked\:bg-green-500 { ... }
      expect(css).toContain(".peer:checked ~");
      expect(css).not.toContain(".peer\\/"); // No named variant
      expect(css).toContain("background-color:");
    });

    it("still handles unnamed group-focus correctly", () => {
      const css = compileRuntimeClassNameWithContext("group-focus:bg-gray-100", baseContext);
      
      expect(css).toContain(".group:focus");
      expect(css).not.toContain(".group\\/");
      expect(css).toContain("background-color:");
    });
  });

  describe("Combination with other features", () => {
    it("combines named variants with responsive breakpoints", () => {
      const css = compileRuntimeClassNameWithContext("md:group-hover/sidebar:bg-blue-500", baseContext);
      
      // Should wrap in media query
      expect(css).toContain("@media (min-width: 768px)");
      expect(css).toContain(".group\\/sidebar:hover");
      expect(css).toContain("group-hover\\/sidebar\\:bg-blue-500");
      expect(css).toContain("background-color:");
    });

    it("combines named variants with important modifier", () => {
      const css = compileRuntimeClassNameWithContext("!group-hover/sidebar:bg-blue-500", baseContext);
      
      expect(css).toContain(".group\\/sidebar:hover");
      expect(css).toContain("!important");
      expect(css).toContain("background-color:");
    });

    it("combines named peer variants with responsive breakpoints", () => {
      const css = compileRuntimeClassNameWithContext("md:peer-checked/toggle:bg-green-500", baseContext);
      
      expect(css).toContain("@media (min-width: 768px)");
      expect(css).toContain(".peer\\/toggle:checked ~");
      expect(css).toContain("background-color:");
    });

    it("combines named peer variants with important modifier", () => {
      const css = compileRuntimeClassNameWithContext("!peer-checked/toggle:bg-green-500", baseContext);
      
      expect(css).toContain(".peer\\/toggle:checked ~");
      expect(css).toContain("!important");
      expect(css).toContain("background-color:");
    });
  });

  describe("Selector generation correctness", () => {
    it("generates group descendant combinator (space)", () => {
      const css = compileRuntimeClassNameWithContext("group-hover/sidebar:bg-blue-500", baseContext);
      
      // Should have space between parent and child selector (descendant combinator)
      expect(css).toMatch(/\.group\\\/sidebar:hover\s+\.group-hover\\\/sidebar/);
    });

    it("generates peer sibling combinator (~)", () => {
      const css = compileRuntimeClassNameWithContext("peer-checked/toggle:bg-green-500", baseContext);
      
      // Should have ~ between peer and target selector (sibling combinator)
      expect(css).toMatch(/\.peer\\\/toggle:checked\s+~\s+\.peer-checked\\\/toggle/);
    });
  });

  describe("Using compileClass API", () => {
    it("compiles named group variants through compileClass", () => {
      const css = compileClass("group-hover/sidebar:bg-blue-500", {
        theme: baseContext.theme,
        screens: {},
        containers: {},
      });
      
      expect(css).toContain(".group\\/sidebar:hover");
      expect(css).toContain("background-color:");
    });

    it("compiles named peer variants through compileClass", () => {
      const css = compileClass("peer-checked/toggle:bg-green-500", {
        theme: baseContext.theme,
        screens: {},
        containers: {},
      });
      
      expect(css).toContain(".peer\\/toggle:checked ~");
      expect(css).toContain("background-color:");
    });
  });

  describe("Edge cases", () => {
    it("handles names with hyphens", () => {
      const css = compileRuntimeClassNameWithContext("group-hover/sidebar-nav:bg-blue-500", baseContext);
      
      expect(css).toContain(".group\\/sidebar-nav:hover");
      expect(css).toContain("group-hover\\/sidebar-nav\\:bg-blue-500");
    });

    it("handles names with underscores", () => {
      const css = compileRuntimeClassNameWithContext("peer-checked/toggle_input:bg-green-500", baseContext);
      
      expect(css).toContain(".peer\\/toggle_input:checked");
      expect(css).toContain("peer-checked\\/toggle_input\\:bg-green-500");
    });

    it("handles single character names", () => {
      const css1 = compileRuntimeClassNameWithContext("group-hover/a:bg-blue-500", baseContext);
      const css2 = compileRuntimeClassNameWithContext("peer-checked/x:bg-green-500", baseContext);
      
      expect(css1).toContain(".group\\/a:hover");
      expect(css2).toContain(".peer\\/x:checked");
    });
  });
});
