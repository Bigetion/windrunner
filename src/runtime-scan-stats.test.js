/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWindrunner } from "./runtime.js";

describe("onScanComplete callback with statistics", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    // Clean up any runtime style tags from previous tests
    document.querySelectorAll('style[data-tailwind-runtime]').forEach((el) => el.remove());
    document.querySelectorAll('style[data-tailwind-preflight]').forEach((el) => el.remove());
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.querySelectorAll('style[data-tailwind-runtime]').forEach((el) => el.remove());
    document.querySelectorAll('style[data-tailwind-preflight]').forEach((el) => el.remove());
  });

  describe("stats object shape", () => {
    it("should pass a stats object to onScanComplete with all required fields", async () => {
      document.body.innerHTML = '<div class="flex items-center">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();

      // onScanComplete is called asynchronously (rAF or setTimeout)
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onScanComplete).toHaveBeenCalledTimes(1);
      const stats = onScanComplete.mock.calls[0][0];

      expect(stats).toHaveProperty("elementCount");
      expect(stats).toHaveProperty("classCount");
      expect(stats).toHaveProperty("ruleCount");
      expect(stats).toHaveProperty("duration");
    });

    it("should have numeric types for all stats fields", async () => {
      document.body.innerHTML = '<div class="flex">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      expect(typeof stats.elementCount).toBe("number");
      expect(typeof stats.classCount).toBe("number");
      expect(typeof stats.ruleCount).toBe("number");
      expect(typeof stats.duration).toBe("number");
    });
  });

  describe("elementCount accuracy", () => {
    it("should count the number of elements with class attributes scanned", async () => {
      document.body.innerHTML = `
        <div class="flex">
          <span class="text-red-500">Text</span>
          <p class="font-bold">Bold</p>
        </div>
      `;

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // 3 elements have class attributes: div, span, p
      expect(stats.elementCount).toBe(3);
    });

    it("should return 0 elementCount when no elements have class attributes", async () => {
      document.body.innerHTML = "<div><span>No classes</span></div>";

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      expect(stats.elementCount).toBe(0);
    });

    it("should include the root element if it has a class attribute", async () => {
      document.body.innerHTML = '<div id="root" class="flex"><span class="block">Child</span></div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      const root = document.getElementById("root");
      wind.scan(root);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // Root (div.flex) + span.block = 2
      expect(stats.elementCount).toBe(2);
    });
  });

  describe("classCount accuracy", () => {
    it("should count unique class names found across all elements", async () => {
      document.body.innerHTML = `
        <div class="flex items-center">
          <span class="text-red-500 flex">Text</span>
        </div>
      `;

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // Unique classes: flex, items-center, text-red-500 (flex is shared but counted once)
      expect(stats.classCount).toBe(3);
    });

    it("should count shared class names only once", async () => {
      document.body.innerHTML = `
        <div class="flex">First</div>
        <div class="flex">Second</div>
        <div class="flex">Third</div>
      `;

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // Only 1 unique class: flex
      expect(stats.classCount).toBe(1);
    });

    it("should count multiple classes on one element individually", async () => {
      document.body.innerHTML = '<div class="flex items-center justify-between gap-4">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      expect(stats.classCount).toBe(4);
    });
  });

  describe("ruleCount accuracy", () => {
    it("should count the number of new CSS rules inserted during the scan", async () => {
      document.body.innerHTML = '<div class="flex block">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // flex and block are both valid utilities, should generate 2 rules
      expect(stats.ruleCount).toBe(2);
    });

    it("should not count rules for classes that fail to compile", async () => {
      document.body.innerHTML = '<div class="flex invalid-xyz-999">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // Only flex should generate a rule; invalid-xyz-999 should not
      expect(stats.ruleCount).toBe(1);
    });

    it("should not double-count rules for repeated class names", async () => {
      document.body.innerHTML = `
        <div class="flex">First</div>
        <div class="flex">Second</div>
      `;

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // flex appears twice but should only insert 1 rule
      expect(stats.ruleCount).toBe(1);
    });

    it("should count 0 rules when there are no compilable classes", async () => {
      document.body.innerHTML = '<div class="totally-invalid-aaa">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      expect(stats.ruleCount).toBe(0);
    });
  });

  describe("duration tracking", () => {
    it("should report a non-negative duration in milliseconds", async () => {
      document.body.innerHTML = '<div class="flex items-center gap-4">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      expect(stats.duration).toBeGreaterThanOrEqual(0);
    });

    it("should report a very small duration for an empty scan", async () => {
      document.body.innerHTML = "<div>No classes here</div>";

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = onScanComplete.mock.calls[0][0];
      // Empty scan should be nearly instant
      expect(stats.duration).toBeLessThan(100);
    });
  });

  describe("callback behavior", () => {
    it("should not call onScanComplete when no callback is provided", () => {
      document.body.innerHTML = '<div class="flex">Content</div>';

      // Should not throw
      const wind = createWindrunner({ autoStart: false });
      expect(() => wind.scan()).not.toThrow();
    });

    it("should fire onScanComplete asynchronously (not block rendering)", async () => {
      document.body.innerHTML = '<div class="flex">Content</div>';

      let callOrder = [];
      const onScanComplete = vi.fn(() => callOrder.push("callback"));
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      callOrder.push("after-scan");

      // Callback should not have been called synchronously
      expect(onScanComplete).not.toHaveBeenCalled();
      expect(callOrder).toEqual(["after-scan"]);

      // Wait for async callback
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onScanComplete).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(["after-scan", "callback"]);
    });

    it("should call onScanComplete each time scan() is invoked", async () => {
      document.body.innerHTML = '<div class="flex">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onScanComplete).toHaveBeenCalledTimes(2);
    });

    it("should report 0 new ruleCount on subsequent scans with same elements", async () => {
      document.body.innerHTML = '<div class="flex block">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      // First scan: rules are inserted
      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const firstStats = onScanComplete.mock.calls[0][0];
      expect(firstStats.ruleCount).toBe(2);

      // Second scan: rules already in cache, no new insertions
      wind.scan();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const secondStats = onScanComplete.mock.calls[1][0];
      expect(secondStats.ruleCount).toBe(0);
    });
  });

  describe("integration with start()", () => {
    it("should fire onScanComplete when start() triggers a scan", async () => {
      document.body.innerHTML = '<div class="flex items-center">Content</div>';

      const onScanComplete = vi.fn();
      const wind = createWindrunner({ autoStart: false, onScanComplete });

      wind.start();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onScanComplete).toHaveBeenCalledTimes(1);
      const stats = onScanComplete.mock.calls[0][0];
      expect(stats.elementCount).toBeGreaterThan(0);
      expect(stats.classCount).toBeGreaterThan(0);

      wind.disconnect();
    });
  });
});
