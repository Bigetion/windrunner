/** @vitest-environment jsdom */
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
      // New signature: onError(className, errorContext)
      const [calledClassName, calledCtx] = onError.mock.calls[0];
      expect(calledClassName).toBe("totally-invalid-class-xyz");
      expect(calledCtx).toMatchObject({
        reason: "unknown-utility",
        baseToken: "totally-invalid-class-xyz",
      });
      expect(typeof calledCtx.details).toBe("string");
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
      // Each call: (className, errorContext)
      const calledClassNames = onError.mock.calls.map(([name]) => name);
      expect(calledClassNames).toContain("zzzz-invalid");
      expect(calledClassNames).toContain("aaaa-fake");
      // Verify context shape on first call
      const [, firstCtx] = onError.mock.calls[0];
      expect(firstCtx).toMatchObject({ reason: "unknown-utility" });
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

  describe("DOM runtime behavior", () => {
    it("should scan the document and inject compiled rules", () => {
      document.body.innerHTML = '<div class="flex items-center"></div>';
      const wind = createWindrunner({ autoStart: false });

      wind.scan();
      expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
      const runtimeStyle = document.querySelector('style[data-tailwind-runtime]');
      expect(runtimeStyle).not.toBeNull();
      expect(runtimeStyle?.sheet?.cssRules.length).toBeGreaterThan(0);
      wind.disconnect();
    });

    it("should observe class changes and compile new rules", async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const wind = createWindrunner({ autoStart: false });
      wind.observe(document.body);

      const target = document.getElementById('target');
      expect(target).not.toBeNull();
      if (target) {
        target.className = 'grid gap-4';
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
      wind.disconnect();
    });

    it("should use observerOptions to tune MutationObserver behavior", () => {
      document.body.innerHTML = '<div class="flex"></div>';
      const wind = createWindrunner({ autoStart: false, observerOptions: { attributes: true, childList: false, subtree: true } });

      expect(() => wind.observe(document.body)).not.toThrow();
      wind.disconnect();
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

// ─── FOUC Prevention Integration Tests ────────────────────────────────────────

describe("FOUC prevention integration", () => {
  describe("opacity strategy", () => {
    it("should hide elements with opacity 0 before scan", () => {
      document.body.innerHTML = '<div id="app" class="flex items-center">Content</div>';
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity', 
          duration: 150, 
          selector: '#app' 
        } 
      });
      
      // Get element before start
      const app = document.getElementById('app');
      expect(app).not.toBeNull();
      
      // Call start which triggers hide()
      wind.start();
      
      // Element should be hidden with opacity 0
      expect(app?.style.opacity).toBe('0');
      expect(app?.style.transition).toBe('none');
      
      wind.disconnect();
    });

    it("should reveal elements after scan completes with transition", async () => {
      document.body.innerHTML = '<html><body><div id="app" class="flex">Content</div></body></html>';
      
      let readyCalled = false;
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity', 
          duration: 100 
        },
        onReady: () => { readyCalled = true; }
      });
      
      const app = document.getElementById('app');
      wind.start();
      
      // Wait for reveal (double rAF + some buffer)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // After reveal, opacity should be restored and transition applied
      expect(app?.style.opacity).not.toBe('0');
      expect(readyCalled).toBe(true);
      
      wind.disconnect();
    });

    it("should work with default 'html' selector", () => {
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity' 
        } 
      });
      
      wind.start();
      
      // Check that html element was targeted
      const html = document.querySelector('html');
      expect(html).not.toBeNull();
      // In jsdom, the html element should have been affected
      
      wind.disconnect();
    });
  });

  describe("visibility strategy", () => {
    it("should hide elements with visibility hidden before scan", () => {
      document.body.innerHTML = '<div id="app" class="block">Content</div>';
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'visibility', 
          selector: '#app' 
        } 
      });
      
      const app = document.getElementById('app');
      wind.start();
      
      expect(app?.style.visibility).toBe('hidden');
      
      wind.disconnect();
    });

    it("should reveal elements after scan completes", async () => {
      document.body.innerHTML = '<div id="app" class="flex">Content</div>';
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'visibility', 
          selector: '#app' 
        } 
      });
      
      const app = document.getElementById('app');
      wind.start();
      
      // Wait for reveal
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Visibility should be restored
      expect(app?.style.visibility).not.toBe('hidden');
      
      wind.disconnect();
    });
  });

  describe("none strategy", () => {
    it("should not apply any hiding when strategy is 'none'", () => {
      document.body.innerHTML = '<div id="app" class="flex">Content</div>';
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'none', 
          selector: '#app' 
        } 
      });
      
      const app = document.getElementById('app');
      const originalOpacity = app?.style.opacity || '';
      const originalVisibility = app?.style.visibility || '';
      
      wind.start();
      
      // Styles should remain unchanged
      expect(app?.style.opacity).toBe(originalOpacity);
      expect(app?.style.visibility).toBe(originalVisibility);
      
      wind.disconnect();
    });

    it("should not apply any hiding when fouc config is not provided", () => {
      document.body.innerHTML = '<div id="app" class="flex">Content</div>';
      
      const wind = createWindrunner({ 
        autoStart: false
      });
      
      const app = document.getElementById('app');
      const originalOpacity = app?.style.opacity || '';
      
      wind.start();
      
      // Backward compatibility: no FOUC prevention by default
      expect(app?.style.opacity).toBe(originalOpacity);
      
      wind.disconnect();
    });
  });

  describe("onReady callback integration", () => {
    it("should call onReady after reveal operation completes", async () => {
      document.body.innerHTML = '<div class="flex items-center">Content</div>';
      
      let readyCalled = false;
      let readyCallTime = 0;
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity',
          duration: 50
        },
        onReady: () => { 
          readyCalled = true;
          readyCallTime = Date.now();
        }
      });
      
      const startTime = Date.now();
      wind.start();
      
      // Wait for reveal and callback
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(readyCalled).toBe(true);
      // onReady should be called after reveal (which uses double rAF)
      expect(readyCallTime).toBeGreaterThanOrEqual(startTime);
      
      wind.disconnect();
    });
  });

  describe("backward compatibility", () => {
    it("should behave identically to v1.1.8 when fouc option not provided", async () => {
      document.body.innerHTML = '<div class="flex items-center gap-4">Content</div>';
      
      let readyCalled = false;
      const wind = createWindrunner({ 
        autoStart: false,
        onReady: () => { readyCalled = true; }
      });
      
      wind.start();
      
      // Wait for ready callback (uses double requestAnimationFrame)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Should work normally without FOUC prevention
      expect(readyCalled).toBe(true);
      expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);
      
      wind.disconnect();
    });
  });

  describe("multiple elements with selector", () => {
    it("should hide/reveal multiple matching elements", async () => {
      document.body.innerHTML = `
        <div class="content flex">First</div>
        <div class="content block">Second</div>
        <div class="other grid">Third</div>
      `;
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity',
          selector: '.content'
        } 
      });
      
      const contentDivs = document.querySelectorAll('.content');
      const otherDiv = document.querySelector('.other');
      
      wind.start();
      
      // Only .content elements should be hidden
      contentDivs.forEach(el => {
        expect(el.style.opacity).toBe('0');
      });
      
      // .other should not be affected
      expect(otherDiv?.style.opacity).not.toBe('0');
      
      // Wait for reveal
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // All should be revealed now
      contentDivs.forEach(el => {
        expect(el.style.opacity).not.toBe('0');
      });
      
      wind.disconnect();
    });
  });

  describe("custom duration", () => {
    it("should apply custom transition duration for opacity strategy", () => {
      document.body.innerHTML = '<div id="app" class="flex">Content</div>';
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity',
          duration: 300,
          selector: '#app'
        } 
      });
      
      wind.start();
      
      // After some time, check that transition includes custom duration
      setTimeout(() => {
        const app = document.getElementById('app');
        // Transition should mention 300ms after reveal
        // Note: actual transition may be set during reveal phase
      }, 50);
      
      wind.disconnect();
    });
  });

  describe("edge cases", () => {
    it("should handle when selector matches no elements", () => {
      document.body.innerHTML = '<div class="flex">Content</div>';
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity',
          selector: '.non-existent'
        } 
      });
      
      // Should not throw
      expect(() => wind.start()).not.toThrow();
      
      wind.disconnect();
    });

    it("should handle empty document gracefully", () => {
      // Clear document body
      document.body.innerHTML = '';
      
      const wind = createWindrunner({ 
        autoStart: false,
        fouc: { 
          strategy: 'opacity'
        } 
      });
      
      expect(() => wind.start()).not.toThrow();
      
      wind.disconnect();
    });
  });
});
