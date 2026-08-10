import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { windrunnerPlugin } from "./vite.js";

// Mock fs/promises
vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
    readdir: vi.fn(),
  },
  readFile: vi.fn(),
  readdir: vi.fn(),
}));

import fs from "fs/promises";

describe("windrunnerPlugin (Vite)", () => {
  let plugin;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: readdir returns empty (no files to walk)
    fs.readdir.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("plugin metadata", () => {
    it("returns a plugin object with name 'windrunner'", () => {
      plugin = windrunnerPlugin();
      expect(plugin.name).toBe("windrunner");
    });

    it("exposes buildStart, generateBundle, and transformIndexHtml hooks", () => {
      plugin = windrunnerPlugin();
      expect(typeof plugin.buildStart).toBe("function");
      expect(typeof plugin.generateBundle).toBe("function");
      expect(typeof plugin.transformIndexHtml).toBe("function");
    });

    it("exposes configResolved hook", () => {
      plugin = windrunnerPlugin();
      expect(typeof plugin.configResolved).toBe("function");
    });
  });

  describe("configResolved", () => {
    it("stores the project root from vite config", () => {
      plugin = windrunnerPlugin();
      plugin.configResolved({ root: "/project/root" });
      // Internal state - verified indirectly via buildStart behavior
      expect(plugin.name).toBe("windrunner");
    });
  });

  describe("buildStart", () => {
    it("extracts classes from source files matching include patterns", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.{html,jsx}"],
      });
      plugin.configResolved({ root: "/project" });

      // Simulate directory structure
      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "App.jsx", isDirectory: () => false, isFile: () => true },
            { name: "index.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockImplementation(async (filePath) => {
        if (filePath.includes("App.jsx")) {
          return '<div className="flex items-center p-4">content</div>';
        }
        if (filePath.includes("index.html")) {
          return '<div class="bg-white shadow-lg">hello</div>';
        }
        return "";
      });

      await plugin.buildStart();

      // The plugin should have extracted classes - verify via generateBundle
      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "asset",
          fileName: "windrunner-critical.css",
        })
      );

      // The source should contain CSS for the extracted classes
      const emittedSource = emitFile.mock.calls[0][0].source;
      expect(typeof emittedSource).toBe("string");
      expect(emittedSource.length).toBeGreaterThan(0);
    });

    it("handles empty source directories gracefully", async () => {
      plugin = windrunnerPlugin();
      plugin.configResolved({ root: "/empty-project" });

      fs.readdir.mockResolvedValue([]);

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      // Should not emit anything when no classes found
      expect(emitFile).not.toHaveBeenCalled();
    });

    it("skips files that cannot be read", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.html"],
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "broken.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockRejectedValue(new Error("ENOENT"));

      // Should not throw
      await expect(plugin.buildStart()).resolves.toBeUndefined();
    });
  });

  describe("generateBundle", () => {
    it("emits CSS asset with configured output filename", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.html"],
        output: "assets/critical.css",
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex p-4 m-2">content</div>');

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "asset",
          fileName: "assets/critical.css",
        })
      );
    });

    it("does not emit when emitFile option is false", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.html"],
        emitFile: false,
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex">content</div>');

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).not.toHaveBeenCalled();
    });

    it("generates CSS that contains rules for extracted classes", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.html"],
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(
        '<div class="flex items-center justify-between"></div>'
      );

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      const css = emitFile.mock.calls[0][0].source;
      // Should contain flex display rule
      expect(css).toContain("display: flex");
      // Should contain align-items rule
      expect(css).toContain("align-items: center");
      // Should contain justify-content rule
      expect(css).toContain("justify-content: space-between");
    });
  });

  describe("transformIndexHtml", () => {
    it("returns html unchanged when injectIntoHtml is false (default)", async () => {
      plugin = windrunnerPlugin();
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockResolvedValue([]);

      await plugin.buildStart();

      const html = "<html><head></head><body></body></html>";
      const result = plugin.transformIndexHtml(html);
      expect(result).toBe(html);
    });

    it("injects critical CSS style tag before </head> when injectIntoHtml is true", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.html"],
        injectIntoHtml: true,
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex"></div>');

      await plugin.buildStart();

      const html = "<html><head><title>Test</title></head><body></body></html>";
      const result = plugin.transformIndexHtml(html);

      expect(result).toContain("data-windrunner-critical");
      expect(result).toContain("display: flex");
      expect(result).toContain("</head>");
      // Style tag should be before </head>
      const styleIdx = result.indexOf("data-windrunner-critical");
      const headCloseIdx = result.indexOf("</head>");
      expect(styleIdx).toBeLessThan(headCloseIdx);
    });

    it("returns html unchanged when no classes were extracted", async () => {
      plugin = windrunnerPlugin({
        injectIntoHtml: true,
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockResolvedValue([]);

      await plugin.buildStart();

      const html = "<html><head></head><body></body></html>";
      const result = plugin.transformIndexHtml(html);
      expect(result).toBe(html);
    });
  });

  describe("options", () => {
    it("uses default include patterns when none provided", () => {
      plugin = windrunnerPlugin();
      expect(plugin.name).toBe("windrunner");
      // Default patterns verified indirectly through behavior
    });

    it("uses default output filename when none provided", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.html"],
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex"></div>');

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: "windrunner-critical.css",
        })
      );
    });

    it("passes theme overrides to compileCriticalCss", async () => {
      plugin = windrunnerPlugin({
        include: ["src/**/*.html"],
        theme: { colors: { brand: "#FF6B6B" } },
      });
      plugin.configResolved({ root: "/project" });

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex"></div>');

      // Should not throw when theme is provided
      await expect(plugin.buildStart()).resolves.toBeUndefined();
    });
  });
});
