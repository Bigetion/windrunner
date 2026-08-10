import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WindrunnerWebpackPlugin } from "./webpack.js";

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

/**
 * Create a mock webpack compiler with tapPromise hooks
 */
function createMockCompiler(context = "/project") {
  const hooks = {
    beforeCompile: { tapPromise: vi.fn() },
    emit: { tapPromise: vi.fn() },
  };

  return {
    context,
    hooks,
  };
}

/**
 * Create a mock webpack compilation object
 */
function createMockCompilation() {
  return {
    assets: {},
  };
}

describe("WindrunnerWebpackPlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fs.readdir.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("uses default options when none provided", () => {
      const plugin = new WindrunnerWebpackPlugin();
      expect(plugin.options.include).toEqual([
        "src/**/*.{html,jsx,tsx,vue,svelte}",
      ]);
      expect(plugin.options.exclude).toEqual([
        "**/node_modules/**",
        "**/dist/**",
      ]);
      expect(plugin.options.output).toBe("windrunner-critical.css");
      expect(plugin.options.theme).toEqual({});
    });

    it("merges custom options with defaults", () => {
      const plugin = new WindrunnerWebpackPlugin({
        include: ["src/**/*.jsx"],
        output: "assets/critical.css",
        theme: { colors: { brand: "#FF0000" } },
      });
      expect(plugin.options.include).toEqual(["src/**/*.jsx"]);
      expect(plugin.options.output).toBe("assets/critical.css");
      expect(plugin.options.theme.colors.brand).toBe("#FF0000");
    });
  });

  describe("apply", () => {
    it("registers beforeCompile and emit hooks", () => {
      const plugin = new WindrunnerWebpackPlugin();
      const compiler = createMockCompiler();

      plugin.apply(compiler);

      expect(compiler.hooks.beforeCompile.tapPromise).toHaveBeenCalledWith(
        "WindrunnerWebpackPlugin",
        expect.any(Function)
      );
      expect(compiler.hooks.emit.tapPromise).toHaveBeenCalledWith(
        "WindrunnerWebpackPlugin",
        expect.any(Function)
      );
    });
  });

  describe("beforeCompile hook", () => {
    it("extracts classes from source files", async () => {
      const plugin = new WindrunnerWebpackPlugin({
        include: ["src/**/*.{html,jsx}"],
      });
      const compiler = createMockCompiler("/project");
      plugin.apply(compiler);

      // Get the beforeCompile handler
      const beforeCompileHandler =
        compiler.hooks.beforeCompile.tapPromise.mock.calls[0][1];

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
          return [
            { name: "App.jsx", isDirectory: () => false, isFile: () => true },
          ];
        }
        return [];
      });

      fs.readFile.mockResolvedValue(
        '<div className="flex items-center gap-4">content</div>'
      );

      await beforeCompileHandler();

      expect(plugin.extractedClasses).toContain("flex");
      expect(plugin.extractedClasses).toContain("items-center");
      expect(plugin.extractedClasses).toContain("gap-4");
    });

    it("handles empty directories gracefully", async () => {
      const plugin = new WindrunnerWebpackPlugin();
      const compiler = createMockCompiler("/empty");
      plugin.apply(compiler);

      const beforeCompileHandler =
        compiler.hooks.beforeCompile.tapPromise.mock.calls[0][1];

      fs.readdir.mockResolvedValue([]);

      await beforeCompileHandler();

      expect(plugin.extractedClasses).toEqual([]);
    });

    it("skips files that cannot be read", async () => {
      const plugin = new WindrunnerWebpackPlugin({
        include: ["src/**/*.html"],
      });
      const compiler = createMockCompiler("/project");
      plugin.apply(compiler);

      const beforeCompileHandler =
        compiler.hooks.beforeCompile.tapPromise.mock.calls[0][1];

      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
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

      fs.readFile.mockRejectedValue(new Error("EACCES"));

      await expect(beforeCompileHandler()).resolves.toBeUndefined();
      expect(plugin.extractedClasses).toEqual([]);
    });
  });

  describe("emit hook", () => {
    it("adds critical CSS to compilation assets", async () => {
      const plugin = new WindrunnerWebpackPlugin({
        include: ["src/**/*.html"],
        output: "windrunner-critical.css",
      });
      const compiler = createMockCompiler("/project");
      plugin.apply(compiler);

      // Execute beforeCompile to extract classes
      const beforeCompileHandler =
        compiler.hooks.beforeCompile.tapPromise.mock.calls[0][1];

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

      await beforeCompileHandler();

      // Execute emit hook
      const emitHandler = compiler.hooks.emit.tapPromise.mock.calls[0][1];
      const compilation = createMockCompilation();

      await emitHandler(compilation);

      // Should have added the CSS file to assets
      expect(compilation.assets["windrunner-critical.css"]).toBeDefined();
      const asset = compilation.assets["windrunner-critical.css"];
      const css = asset.source();
      expect(css).toContain("display: flex");
      expect(css).toContain("align-items: center");
      expect(css).toContain("justify-content: space-between");
      expect(asset.size()).toBe(css.length);
    });

    it("does not add asset when no classes were extracted", async () => {
      const plugin = new WindrunnerWebpackPlugin();
      const compiler = createMockCompiler("/empty");
      plugin.apply(compiler);

      const beforeCompileHandler =
        compiler.hooks.beforeCompile.tapPromise.mock.calls[0][1];
      fs.readdir.mockResolvedValue([]);
      await beforeCompileHandler();

      const emitHandler = compiler.hooks.emit.tapPromise.mock.calls[0][1];
      const compilation = createMockCompilation();
      await emitHandler(compilation);

      expect(Object.keys(compilation.assets)).toHaveLength(0);
    });

    it("uses custom output path for the asset", async () => {
      const plugin = new WindrunnerWebpackPlugin({
        include: ["src/**/*.html"],
        output: "css/critical.css",
      });
      const compiler = createMockCompiler("/project");
      plugin.apply(compiler);

      const beforeCompileHandler =
        compiler.hooks.beforeCompile.tapPromise.mock.calls[0][1];

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

      await beforeCompileHandler();

      const emitHandler = compiler.hooks.emit.tapPromise.mock.calls[0][1];
      const compilation = createMockCompilation();
      await emitHandler(compilation);

      expect(compilation.assets["css/critical.css"]).toBeDefined();
      expect(compilation.assets["windrunner-critical.css"]).toBeUndefined();
    });
  });

  describe("integration", () => {
    it("full workflow: beforeCompile extracts classes, emit generates CSS", async () => {
      const plugin = new WindrunnerWebpackPlugin({
        include: ["src/**/*.{html,jsx}"],
      });
      const compiler = createMockCompiler("/project");
      plugin.apply(compiler);

      // Setup mock filesystem
      fs.readdir.mockImplementation(async (dir) => {
        if (dir === "/project") {
          return [
            { name: "src", isDirectory: () => true, isFile: () => false },
          ];
        }
        if (dir.endsWith("src")) {
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
          return '<div className="p-4 rounded-lg shadow-md">card</div>';
        }
        if (filePath.includes("index.html")) {
          return '<main class="container mx-auto">content</main>';
        }
        return "";
      });

      // Run beforeCompile
      const beforeCompileHandler =
        compiler.hooks.beforeCompile.tapPromise.mock.calls[0][1];
      await beforeCompileHandler();

      expect(plugin.extractedClasses.length).toBeGreaterThan(0);

      // Run emit
      const emitHandler = compiler.hooks.emit.tapPromise.mock.calls[0][1];
      const compilation = createMockCompilation();
      await emitHandler(compilation);

      const css = compilation.assets["windrunner-critical.css"].source();
      expect(css.length).toBeGreaterThan(0);
    });
  });
});
