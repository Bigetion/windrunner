import { describe, it, expect } from "vitest";
import { PluginRegistry, plugin, isPlugin, defineUtilities, defineResponsiveUtilities } from "./plugins.js";
import { compileClass } from "./compiler.js";

describe("Plugin System", () => {
  describe("PluginRegistry", () => {
    it("should register and match static utility", () => {
      const registry = new PluginRegistry();
      registry.addUtility("glass", "backdrop-filter: blur(10px); background: rgba(255,255,255,0.1);");
      
      const match = registry.matchUtility("glass");
      expect(match).toBeTruthy();
      expect(match.handler).toContain("backdrop-filter");
    });

    it("should register and match pattern utility", () => {
      const registry = new PluginRegistry();
      registry.addUtility(/^text-stroke-(\d+)$/, (match) => {
        const width = match[1];
        return `-webkit-text-stroke-width: ${width}px; text-stroke-width: ${width}px;`;
      });
      
      const match = registry.matchUtility("text-stroke-2");
      expect(match).toBeTruthy();
      expect(typeof match.handler).toBe("function");
      
      const css = match.handler(match.match);
      expect(css).toContain("2px");
    });

    it("should register and match custom variant", () => {
      const registry = new PluginRegistry();
      registry.addVariant("parent-hover", (selector) => `.parent:hover ${selector}`);
      
      const handler = registry.matchVariant("parent-hover");
      expect(handler).toBeTruthy();
      expect(handler(".test")).toBe(".parent:hover .test");
    });

    it("should register multiple utilities at once", () => {
      const registry = new PluginRegistry();
      registry.addUtilities({
        glass: "backdrop-filter: blur(10px);",
        frosted: "backdrop-filter: blur(20px);"
      });
      
      expect(registry.matchUtility("glass")).toBeTruthy();
      expect(registry.matchUtility("frosted")).toBeTruthy();
    });

    it("should clear all registered plugins", () => {
      const registry = new PluginRegistry();
      registry.addUtility("test", "color: red;");
      registry.addVariant("test", (s) => s);
      
      expect(registry.getUtilities().length).toBe(1);
      expect(registry.getVariants().length).toBe(1);
      
      registry.clear();
      
      expect(registry.getUtilities().length).toBe(0);
      expect(registry.getVariants().length).toBe(0);
    });
  });

  describe("plugin() helper", () => {
    it("should create a valid plugin object", () => {
      const myPlugin = plugin(({ addUtility }) => {
        addUtility("test", "color: red;");
      });
      
      expect(isPlugin(myPlugin)).toBe(true);
      expect(myPlugin.__isWindrunnerPlugin).toBe(true);
      expect(typeof myPlugin.handler).toBe("function");
    });

    it("should throw error for invalid handler", () => {
      expect(() => plugin("not a function")).toThrow();
    });
  });

  describe("defineUtilities helper", () => {
    it("should convert object utilities to string format", () => {
      const utilities = defineUtilities({
        glass: "backdrop-filter: blur(10px);",
        bordered: {
          border: "1px solid black",
          borderRadius: "0.5rem"
        }
      });
      
      expect(utilities.glass).toBe("backdrop-filter: blur(10px);");
      expect(utilities.bordered).toContain("border: 1px solid black;");
      expect(utilities.bordered).toContain("borderRadius: 0.5rem;");
    });
  });

  describe("defineResponsiveUtilities helper", () => {
    it("should generate utilities from values", () => {
      const utilities = defineResponsiveUtilities(
        "text-stroke",
        { 1: "1px", 2: "2px", DEFAULT: "1px" },
        (key, value) => `-webkit-text-stroke-width: ${value};`
      );
      
      expect(utilities["text-stroke"]).toContain("1px");
      expect(utilities["text-stroke-1"]).toContain("1px");
      expect(utilities["text-stroke-2"]).toContain("2px");
    });
  });

  describe("Integration with compiler", () => {
    it("should compile custom utility class", () => {
      const glassPlugin = plugin(({ addUtility }) => {
        addUtility("glass", "backdrop-filter: blur(10px); background: rgba(255,255,255,0.1);");
      });
      
      const css = compileClass("glass", {
        theme: {},
        screens: {},
        containers: {},
        plugins: [glassPlugin]
      });
      
      expect(css).toContain(".glass");
      expect(css).toContain("backdrop-filter: blur(10px);");
    });

    it("should compile custom variant", () => {
      const customVariantPlugin = plugin(({ addVariant }) => {
        addVariant("parent-hover", (selector) => `.parent:hover ${selector}`);
      });
      
      const css = compileClass("parent-hover:flex", {
        theme: {},
        screens: {},
        containers: {},
        plugins: [customVariantPlugin]
      });
      
      expect(css).toContain(".parent:hover");
      expect(css).toContain("display: flex;");
    });

    it("should support pattern-based utilities", () => {
      const textStrokePlugin = plugin(({ addUtility }) => {
        addUtility(/^text-stroke-(\d+)$/, (match) => {
          const width = match[1];
          return `-webkit-text-stroke-width: ${width}px;`;
        });
      });
      
      const css = compileClass("text-stroke-3", {
        theme: {},
        screens: {},
        containers: {},
        plugins: [textStrokePlugin]
      });
      
      expect(css).toContain(".text-stroke-3");
      expect(css).toContain("3px");
    });

    it("should access theme in plugin", () => {
      const themedPlugin = plugin(({ addUtility, theme }) => {
        const colors = theme("colors");
        addUtility("brand-bg", `background-color: ${colors.brand || "#ff0000"};`);
      });
      
      const css = compileClass("brand-bg", {
        theme: { colors: { brand: "#123456" } },
        screens: {},
        containers: {},
        plugins: [themedPlugin]
      });
      
      expect(css).toContain("#123456");
    });

    it("should prioritize plugins over built-in utilities", () => {
      const overridePlugin = plugin(({ addUtility }) => {
        addUtility("flex", "display: grid;"); // Override built-in flex
      });
      
      const css = compileClass("flex", {
        theme: {},
        screens: {},
        containers: {},
        plugins: [overridePlugin]
      });
      
      // Plugin should override built-in
      expect(css).toContain("display: grid;");
    });
  });
});
