/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWindrunner, _observerRegistry } from "./runtime.js";

// ─── WeakMap-Based Observer Registry Tests ────────────────────────────────────
// Tests for Requirement 9.1 (detect same DOM root observed multiple times)
// and Requirement 9.5 (track active observers using WeakMap keyed by DOM root)

describe("Observer Registry (WeakMap-based tracking)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root" class="flex"><span class="block">child</span></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe("registry behavior", () => {
    it("should register an observer in the WeakMap when observe() is called", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);

      expect(_observerRegistry.has(root)).toBe(true);
      const entry = _observerRegistry.get(root);
      expect(entry).toBeDefined();
      expect(entry.observer).toBeInstanceOf(MutationObserver);
      expect(entry.styleId).toBe("tailwind-runtime-css");
      expect(typeof entry.createdAt).toBe("number");

      wind.disconnect();
    });

    it("should store observer with custom styleId", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false, id: "my-custom-style" });

      wind.observe(root);

      const entry = _observerRegistry.get(root);
      expect(entry.styleId).toBe("my-custom-style");

      wind.disconnect();
    });

    it("should remove observer from registry on disconnect()", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      expect(_observerRegistry.has(root)).toBe(true);

      wind.disconnect();
      expect(_observerRegistry.has(root)).toBe(false);
    });

    it("should not throw when disconnecting without observing first", () => {
      const wind = createWindrunner({ autoStart: false });
      expect(() => wind.disconnect()).not.toThrow();
    });

    it("should safely handle multiple disconnect() calls", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      wind.disconnect();
      wind.disconnect(); // Second call should not throw
      wind.disconnect(); // Third call should not throw

      expect(_observerRegistry.has(root)).toBe(false);
    });
  });

  describe("observer reuse for same root + styleId", () => {
    it("should reuse existing observer when observe() is called twice on same root", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      const firstEntry = _observerRegistry.get(root);
      const firstObserver = firstEntry.observer;

      // Call observe again on same root — should reuse
      wind.observe(root);
      const secondEntry = _observerRegistry.get(root);

      expect(secondEntry.observer).toBe(firstObserver);

      wind.disconnect();
    });

    it("should reuse existing observer across different instances with same styleId and root", () => {
      const root = document.getElementById('root');
      const wind1 = createWindrunner({ autoStart: false });
      const wind2 = createWindrunner({ autoStart: false });

      // First instance observes
      wind1.observe(root);
      const firstEntry = _observerRegistry.get(root);
      const firstObserver = firstEntry.observer;

      // Second instance observes same root with same styleId — should reuse
      wind2.observe(root);
      const secondEntry = _observerRegistry.get(root);

      expect(secondEntry.observer).toBe(firstObserver);

      wind1.disconnect();
      // Note: wind2 still has reference to the observer even though registry was cleared by wind1
    });

    it("should create a new observer when different styleIds target same root", () => {
      const root = document.getElementById('root');
      const wind1 = createWindrunner({ autoStart: false, id: "style-a" });
      const wind2 = createWindrunner({ autoStart: false, id: "style-b" });

      wind1.observe(root);
      const firstEntry = _observerRegistry.get(root);
      const firstObserver = firstEntry.observer;

      // Different styleId — should create new observer (replacing registry entry)
      wind2.observe(root);
      const secondEntry = _observerRegistry.get(root);

      expect(secondEntry.observer).not.toBe(firstObserver);
      expect(secondEntry.styleId).toBe("style-b");

      wind2.disconnect();
    });

    it("should allow independent instances on different DOM roots", () => {
      document.body.innerHTML = `
        <div id="root1" class="flex">Content 1</div>
        <div id="root2" class="block">Content 2</div>
      `;
      const root1 = document.getElementById('root1');
      const root2 = document.getElementById('root2');

      const wind1 = createWindrunner({ autoStart: false, id: "instance-1" });
      const wind2 = createWindrunner({ autoStart: false, id: "instance-2" });

      wind1.observe(root1);
      wind2.observe(root2);

      expect(_observerRegistry.has(root1)).toBe(true);
      expect(_observerRegistry.has(root2)).toBe(true);

      const entry1 = _observerRegistry.get(root1);
      const entry2 = _observerRegistry.get(root2);

      expect(entry1.styleId).toBe("instance-1");
      expect(entry2.styleId).toBe("instance-2");
      expect(entry1.observer).not.toBe(entry2.observer);

      wind1.disconnect();
      wind2.disconnect();

      expect(_observerRegistry.has(root1)).toBe(false);
      expect(_observerRegistry.has(root2)).toBe(false);
    });
  });

  describe("React StrictMode double-mount simulation", () => {
    it("should not create duplicate observers during mount/unmount/remount cycle", () => {
      const root = document.getElementById('root');

      // Simulate first mount
      const wind = createWindrunner({ autoStart: false });
      wind.observe(root);
      const firstEntry = _observerRegistry.get(root);
      const firstObserver = firstEntry.observer;

      // Simulate unmount — React StrictMode calls cleanup
      wind.disconnect();
      expect(_observerRegistry.has(root)).toBe(false);

      // Simulate remount — React StrictMode calls effect again
      wind.observe(root);
      expect(_observerRegistry.has(root)).toBe(true);

      // New observer should be created since the old one was disconnected
      const remountEntry = _observerRegistry.get(root);
      expect(remountEntry.observer).toBeInstanceOf(MutationObserver);

      wind.disconnect();
    });

    it("should reuse observer when a second instance starts observing before disconnect", () => {
      const root = document.getElementById('root');

      // Simulate first mount (component A observes)
      const windA = createWindrunner({ autoStart: false });
      windA.observe(root);
      const originalEntry = _observerRegistry.get(root);
      const originalObserver = originalEntry.observer;

      // Simulate concurrent second mount (component B tries to observe same root)
      // This happens in StrictMode when the component remounts before old one fully cleans up
      const windB = createWindrunner({ autoStart: false });
      windB.observe(root);

      // Should reuse the existing observer (same styleId)
      const reusedEntry = _observerRegistry.get(root);
      expect(reusedEntry.observer).toBe(originalObserver);

      windA.disconnect();
    });

    it("should still observe DOM mutations after reuse", async () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      // First observe
      wind.observe(root);

      // Simulate StrictMode: unmount and remount
      wind.disconnect();
      wind.observe(root);

      // Mutate DOM — observer should still work
      const newDiv = document.createElement('div');
      newDiv.className = 'grid gap-4';
      root.appendChild(newDiv);

      // Wait for mutation observer to fire and process
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should have processed the new element
      expect(wind.getInsertedRuleCount()).toBeGreaterThan(0);

      wind.disconnect();
    });
  });

  describe("registry with at most one observer per root per styleId", () => {
    it("should maintain at most one entry per DOM root in the registry", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      // Multiple observe calls on same root
      wind.observe(root);
      wind.observe(root);
      wind.observe(root);

      // Only one entry should exist
      expect(_observerRegistry.has(root)).toBe(true);
      const entry = _observerRegistry.get(root);
      expect(entry).toBeDefined();
      expect(entry.observer).toBeInstanceOf(MutationObserver);

      wind.disconnect();
    });
  });

  describe("disconnect cleanup completeness", () => {
    it("should clear pendingElements queue on disconnect", async () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);

      // Add elements to trigger pending queue
      const newDiv = document.createElement('div');
      newDiv.className = 'text-red-500 bg-blue-200';
      root.appendChild(newDiv);

      // Wait briefly for MutationObserver to fire and queue elements
      await new Promise(resolve => setTimeout(resolve, 10));

      // Disconnect before flush — pendingElements should be cleared
      wind.disconnect();

      expect(wind.getStats().pendingElementCount).toBe(0);
    });

    it("should remove DOMContentLoaded listener on disconnect", () => {
      // Simulate loading state
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
        configurable: true,
      });

      const removeListenerSpy = vi.spyOn(document, 'removeEventListener');

      const wind = createWindrunner({ autoStart: false });
      wind.start(); // This should register a DOMContentLoaded handler since readyState is 'loading'

      wind.disconnect();

      expect(removeListenerSpy).toHaveBeenCalledWith(
        'DOMContentLoaded',
        expect.any(Function)
      );

      removeListenerSpy.mockRestore();

      // Restore readyState
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
        configurable: true,
      });
    });

    it("should set isObserving to false after disconnect", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      expect(wind.getStats().isObserving).toBe(true);

      wind.disconnect();
      expect(wind.getStats().isObserving).toBe(false);
    });

    it("should be safe to call observe() again after disconnect()", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      wind.disconnect();

      // Re-observing should work without error
      expect(() => wind.observe(root)).not.toThrow();
      expect(wind.getStats().isObserving).toBe(true);
      expect(_observerRegistry.has(root)).toBe(true);

      wind.disconnect();
    });

    it("disconnect should be idempotent - no side effects on repeated calls", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      
      // First disconnect
      wind.disconnect();
      const statsAfterFirst = wind.getStats();

      // Second disconnect — should produce same state
      wind.disconnect();
      const statsAfterSecond = wind.getStats();

      // Third disconnect — same again
      wind.disconnect();
      const statsAfterThird = wind.getStats();

      expect(statsAfterFirst.isObserving).toBe(false);
      expect(statsAfterFirst.pendingElementCount).toBe(0);
      expect(statsAfterSecond).toEqual(statsAfterFirst);
      expect(statsAfterThird).toEqual(statsAfterFirst);
    });

    it("should stop processing mutations after disconnect", async () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      wind.disconnect();

      const initialRuleCount = wind.getInsertedRuleCount();

      // Add elements after disconnect — should not be processed
      const newDiv = document.createElement('div');
      newDiv.className = 'grid gap-4 p-8';
      root.appendChild(newDiv);

      // Wait for any potential mutation observer callbacks
      await new Promise(resolve => setTimeout(resolve, 50));

      // No new rules should have been inserted since observer is disconnected
      expect(wind.getInsertedRuleCount()).toBe(initialRuleCount);
    });
  });

  describe("getStats reflects observer state", () => {
    it("should report isObserving=true when observer is active", () => {
      const root = document.getElementById('root');
      const wind = createWindrunner({ autoStart: false });

      wind.observe(root);
      expect(wind.getStats().isObserving).toBe(true);

      wind.disconnect();
      expect(wind.getStats().isObserving).toBe(false);
    });
  });
});
