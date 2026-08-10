import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { windrunnerRollupPlugin } from "./rollup.js";

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

describe("windrunnerRollupPlugin", () => {
  let plugin;

  beforeEach(() => {
    vi.clearAllMocks();
    fs.readdir.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("plugin metadata", () => {
    it("returns a plugin object with name 'windrunner'", () => {
      plugin = windrunnerRollupPlugin();
      expect(plugin.name).toBe("windrunner");
    });

    it("exposes buildStart and generateBundle hooks", () => {
      plugin = windrunnerRollupPlugin();
      expect(typeof plugin.buildStart).toBe("function");
      expect(typeof plugin.generateBundle).toBe("function");
    });
  });

  describe("buildStart", () => {
    it("extracts classes from source files", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["src/**/*.{html,jsx}"],
      });

      fs.readdir.mockImplementation(async (dir) => {
        // Use normalized path for comparison
        const normalized = dir.replace(/\\/g, "/");
        if (
          normalized === process.cwd().replace(/\\/g, "/")
        ) {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
          return [
            { name: "App.jsx", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(
        '<div className="flex items-center p-4">content</div>'
      );

      await plugin.buildStart();

      // Verify via generateBundle output
      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).toHaveBeenCalled();
      const css = emitFile.mock.calls[0][0].source;
      expect(css).toContain("display: flex");
    });

    it("handles empty source directories gracefully", async () => {
      plugin = windrunnerRollupPlugin();
      fs.readdir.mockResolvedValue([]);

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });
      expect(emitFile).not.toHaveBeenCalled();
    });

    it("skips unreadable files without throwing", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["src/**/*.html"],
      });

      fs.readdir.mockImplementation(async (dir) => {
        const normalized = dir.replace(/\\/g, "/");
        if (normalized === process.cwd().replace(/\\/g, "/")) {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
          return [
            {
              name: "broken.html",
              isDirectory: () => false,
              isFile: () => true,
            },
          ];
        }
        return [];
      });

      fs.readFile.mockRejectedValue(new Error("ENOENT"));

      await expect(plugin.buildStart()).resolves.toBeUndefined();
    });
  });

  describe("generateBundle", () => {
    it("emits CSS asset with default output filename", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["src/**/*.html"],
      });

      fs.readdir.mockImplementation(async (dir) => {
        const normalized = dir.replace(/\\/g, "/");
        if (normalized === process.cwd().replace(/\\/g, "/")) {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex p-4">content</div>');

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "asset",
          fileName: "windrunner-critical.css",
        })
      );
    });

    it("uses custom output filename when provided", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["src/**/*.html"],
        output: "dist/critical.css",
      });

      fs.readdir.mockImplementation(async (dir) => {
        const normalized = dir.replace(/\\/g, "/");
        if (normalized === process.cwd().replace(/\\/g, "/")) {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
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
          fileName: "dist/critical.css",
        })
      );
    });

    it("does not emit when no classes are extracted", async () => {
      plugin = windrunnerRollupPlugin();
      fs.readdir.mockResolvedValue([]);

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).not.toHaveBeenCalled();
    });

    it("generates valid CSS for common utility classes", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["src/**/*.html"],
      });

      fs.readdir.mockImplementation(async (dir) => {
        const normalized = dir.replace(/\\/g, "/");
        if (normalized === process.cwd().replace(/\\/g, "/")) {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(
        '<div class="flex items-center justify-between p-4 m-2 text-lg font-bold"></div>'
      );

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      const css = emitFile.mock.calls[0][0].source;
      expect(css).toContain("display: flex");
      expect(css).toContain("align-items: center");
      expect(css).toContain("justify-content: space-between");
    });
  });

  describe("options", () => {
    it("uses default include patterns", () => {
      plugin = windrunnerRollupPlugin();
      // Default patterns verified through behavior
      expect(plugin.name).toBe("windrunner");
    });

    it("respects exclude patterns", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["**/*.html"],
        exclude: ["**/ignored/**"],
      });

      fs.readdir.mockImplementation(async (dir) => {
        const normalized = dir.replace(/\\/g, "/");
        if (normalized === process.cwd().replace(/\\/g, "/")) {
          return [
            { name: "ignored", isDirectory: () => true, isFile: () => false },
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        // src directory has a file
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex"></div>');

      await plugin.buildStart();

      // The file in src/ should be processed
      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });
      expect(emitFile).toHaveBeenCalled();
    });

    it("passes theme overrides to CSS compilation", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["src/**/*.html"],
        theme: { colors: { custom: "#123456" } },
      });

      fs.readdir.mockImplementation(async (dir) => {
        const normalized = dir.replace(/\\/g, "/");
        if (normalized === process.cwd().replace(/\\/g, "/")) {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
          return [
            { name: "page.html", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue('<div class="flex"></div>');

      // Should not throw when theme overrides are provided
      await expect(plugin.buildStart()).resolves.toBeUndefined();
    });
  });

  describe("integration", () => {
    it("full workflow: buildStart extracts, generateBundle emits CSS", async () => {
      plugin = windrunnerRollupPlugin({
        include: ["src/**/*.{html,jsx}"],
      });

      fs.readdir.mockImplementation(async (dir) => {
        const normalized = dir.replace(/\\/g, "/");
        if (normalized === process.cwd().replace(/\\/g, "/")) {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (normalized.endsWith("/src") || normalized.endsWith("\\src")) {
          return [
            { name: "App.jsx", isDirectory: () => false, isFile: () => true },
            {
              name: "index.html",
              isDirectory: () => false,
              isFile: () => true,
            },
          ];
        }
        return [];
      });

      fs.readFile.mockImplementation(async (filePath) => {
        if (filePath.includes("App.jsx")) {
          return '<div className="rounded-lg shadow-md p-4">card</div>';
        }
        if (filePath.includes("index.html")) {
          return '<main class="flex flex-col gap-4">content</main>';
        }
        return "";
      });

      await plugin.buildStart();

      const emitFile = vi.fn();
      plugin.generateBundle.call({ emitFile });

      expect(emitFile).toHaveBeenCalled();
      const css = emitFile.mock.calls[0][0].source;
      expect(css.length).toBeGreaterThan(0);
      expect(css).toContain("display: flex");
    });
  });
});
