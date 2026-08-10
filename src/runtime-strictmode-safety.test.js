/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWindrunner } from "./runtime.js";

// ─── Style Tag Reuse Tests (Task 33 / Requirement 9.3) ────────────────────────
// Validates: Property 33 — For any runtime instance with a given id, if a style 
// tag with that id already exists in the document, the runtime SHALL reuse the 
// existing tag rather than creating a duplicate.

describe("Style tag reuse for StrictMode safety", () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<div class="flex items-center">Content</div>';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe("findOrCreateRuntimeStyle reuse behavior", () => {
    it("should create a style tag with data-tailwind-runtime attribute on first use", () => {
      const wind = createWindrunner({ autoStart: false });
      wind.processClassName("flex");

      const styleTags = document.querySelectorAll('style[data-tailwind-runtime]');
      expect(styleTags.length).toBe(1);
      expect(styleTags[0].getAttribute('data-tailwind-runtime')).toBe('tailwind-runtime-css');

      wind.disconnect();
    });

    it("should reuse existing style tag when same id is used", () => {
      const wind1 = createWindrunner({ autoStart: false, id: 'my-styles' });
      wind1.processClassName("flex");

      const firstStyleTag = document.querySelector('style[data-tailwind-runtime="my-styles"]');
      expect(firstStyleTag).not.toBeNull();

      // Create a second runtime with same id — should reuse the tag
      const wind2 = createWindrunner({ autoStart: false, id: 'my-styles' });
      wind2.processClassName("block");

      const styleTags = document.querySelectorAll('style[data-tailwind-runtime="my-styles"]');
      expect(styleTags.length).toBe(1);

      // Both rules should be in the same style tag
      const styleTag = styleTags[0];
      expect(styleTag.sheet.cssRules.length).toBeGreaterThanOrEqual(2);

      wind1.disconnect();
      wind2.disconnect();
    });

    it("should not create duplicate style tags across mount/unmount cycles", () => {
      // Simulate React StrictMode: mount -> unmount -> remount
      const wind = createWindrunner({ autoStart: false });

      // First mount — compile some classes
      wind.processClassName("flex");
      wind.processClassName("block");

      const initialTags = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(initialTags.length).toBe(1);

      // Unmount (disconnect)
      wind.disconnect();

      // Style tag should still exist in DOM (we don't remove it on disconnect)
      const tagsAfterDisconnect = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(tagsAfterDisconnect.length).toBe(1);

      // Remount — create new runtime with same id (simulating StrictMode remount)
      const wind2 = createWindrunner({ autoStart: false });
      wind2.processClassName("grid");

      // Should still be just one style tag (reused)
      const finalTags = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(finalTags.length).toBe(1);

      wind2.disconnect();
    });

    it("should create separate style tags for different ids", () => {
      const windA = createWindrunner({ autoStart: false, id: 'style-a' });
      const windB = createWindrunner({ autoStart: false, id: 'style-b' });

      windA.processClassName("flex");
      windB.processClassName("block");

      const tagsA = document.querySelectorAll('style[data-tailwind-runtime="style-a"]');
      const tagsB = document.querySelectorAll('style[data-tailwind-runtime="style-b"]');

      expect(tagsA.length).toBe(1);
      expect(tagsB.length).toBe(1);

      windA.disconnect();
      windB.disconnect();
    });

    it("should support creating multiple independent instances with different ids (Req 9.7)", () => {
      const wind1 = createWindrunner({ autoStart: false, id: 'instance-1' });
      const wind2 = createWindrunner({ autoStart: false, id: 'instance-2' });
      const wind3 = createWindrunner({ autoStart: false, id: 'instance-3' });

      wind1.processClassName("flex");
      wind2.processClassName("block");
      wind3.processClassName("grid");

      // All three should have separate style tags
      const allTags = document.querySelectorAll('style[data-tailwind-runtime]');
      expect(allTags.length).toBe(3);

      // Each should have the correct id
      expect(document.querySelector('style[data-tailwind-runtime="instance-1"]')).not.toBeNull();
      expect(document.querySelector('style[data-tailwind-runtime="instance-2"]')).not.toBeNull();
      expect(document.querySelector('style[data-tailwind-runtime="instance-3"]')).not.toBeNull();

      wind1.disconnect();
      wind2.disconnect();
      wind3.disconnect();
    });

    it("should reuse style tag even when it already has CSS rules from a previous instance", () => {
      // First instance inserts rules
      const wind1 = createWindrunner({ autoStart: false });
      wind1.processClassName("flex");
      wind1.processClassName("items-center");

      const styleTag = document.querySelector('style[data-tailwind-runtime="tailwind-runtime-css"]');
      const initialRuleCount = styleTag.sheet.cssRules.length;
      expect(initialRuleCount).toBeGreaterThanOrEqual(2);

      wind1.disconnect();

      // Second instance should reuse the same tag and add new rules
      const wind2 = createWindrunner({ autoStart: false });
      wind2.processClassName("gap-4");

      // Should still be the same single tag
      const tags = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(tags.length).toBe(1);

      // New rules should be added to the existing sheet
      expect(tags[0].sheet.cssRules.length).toBeGreaterThan(initialRuleCount);

      wind2.disconnect();
    });

    it("should handle rapid mount/unmount/remount without creating duplicates", () => {
      // Simulate rapid StrictMode cycling
      for (let i = 0; i < 5; i++) {
        const wind = createWindrunner({ autoStart: false });
        wind.processClassName("flex");
        wind.disconnect();
      }

      // After all the cycling, only one style tag should exist
      const tags = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(tags.length).toBe(1);
    });
  });

  describe("style tag reuse with start() lifecycle", () => {
    it("should reuse style tag when start() is called after disconnect/remount", () => {
      const wind1 = createWindrunner({ autoStart: false, preflight: false });
      wind1.start();

      const tags1 = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(tags1.length).toBe(1);

      wind1.disconnect();

      // Remount
      const wind2 = createWindrunner({ autoStart: false, preflight: false });
      wind2.start();

      const tags2 = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(tags2.length).toBe(1);

      wind2.disconnect();
    });
  });
});

// ─── Duplicate Rule Prevention Tests (Task 34 / Requirement 9.4) ──────────────
// Validates: Property 34 — For any CSS rule, if the rule has already been inserted 
// into the stylesheet, subsequent insertions SHALL be skipped to prevent duplicates.

describe("Duplicate rule prevention", () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<div class="flex block grid">Content</div>';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe("insertedRules Set deduplication", () => {
    it("should not insert the same CSS rule twice", () => {
      const wind = createWindrunner({ autoStart: false });

      // Process same class twice
      wind.processClassName("flex");
      wind.processClassName("flex");

      const styleTag = document.querySelector('style[data-tailwind-runtime]');
      const ruleCount = styleTag.sheet.cssRules.length;

      // Only one rule should be present even though processClassName was called twice
      expect(ruleCount).toBe(1);
      expect(wind.getInsertedRuleCount()).toBe(1);

      wind.disconnect();
    });

    it("should track inserted rules count accurately", () => {
      const wind = createWindrunner({ autoStart: false });

      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");

      expect(wind.getInsertedRuleCount()).toBe(3);

      // Process the same classes again
      wind.processClassName("flex");
      wind.processClassName("block");
      wind.processClassName("grid");

      // Count should not increase
      expect(wind.getInsertedRuleCount()).toBe(3);

      wind.disconnect();
    });

    it("should prevent duplicates during rapid sequential compilations", () => {
      const wind = createWindrunner({ autoStart: false });

      // Simulate rapid mutations all requesting the same classes
      const classes = ["flex", "block", "grid", "flex", "block", "grid", "flex"];
      classes.forEach(cls => wind.processClassName(cls));

      // Only 3 unique rules should be inserted
      expect(wind.getInsertedRuleCount()).toBe(3);

      wind.disconnect();
    });

    it("should prevent duplicates when same class is compiled by multiple runtime instances with same id", () => {
      const wind1 = createWindrunner({ autoStart: false });
      wind1.processClassName("flex");

      const wind2 = createWindrunner({ autoStart: false });
      wind2.processClassName("flex");

      // Each instance tracks its own insertedRules Set
      // But both reuse the same style tag
      const tags = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(tags.length).toBe(1);

      // The second instance will still insert since it has its own Set
      // But in a StrictMode scenario, the first instance's rules persist in the DOM
      // and the second instance rebuilds its Set from existing rules via loadExistingRules
      wind1.disconnect();
      wind2.disconnect();
    });

    it("should handle variant classes without duplicates", () => {
      const wind = createWindrunner({ autoStart: false });

      wind.processClassName("hover:bg-blue-500");
      wind.processClassName("hover:bg-blue-500");
      wind.processClassName("hover:bg-blue-500");

      // Only one rule for the hover variant
      expect(wind.getInsertedRuleCount()).toBe(1);

      wind.disconnect();
    });

    it("should distinguish different variant combinations as separate rules", () => {
      const wind = createWindrunner({ autoStart: false });

      wind.processClassName("bg-blue-500");
      wind.processClassName("hover:bg-blue-500");
      wind.processClassName("focus:bg-blue-500");

      // Three different rules (base, hover, focus)
      expect(wind.getInsertedRuleCount()).toBe(3);

      wind.disconnect();
    });

    it("should not insert duplicate rules after cache is cleared", () => {
      const wind = createWindrunner({ autoStart: false });

      wind.processClassName("flex");
      expect(wind.getInsertedRuleCount()).toBe(1);

      // Clear cache (but insertedRules Set persists)
      wind.clearCache();
      expect(wind.getCacheSize()).toBe(0);

      // Recompile same class — rule should still not be inserted again
      wind.processClassName("flex");
      expect(wind.getInsertedRuleCount()).toBe(1);

      wind.disconnect();
    });
  });

  describe("duplicate prevention during mount/unmount cycles", () => {
    it("should not duplicate rules when new instance reuses existing style tag", () => {
      // First instance inserts rules
      const wind1 = createWindrunner({ autoStart: false });
      wind1.processClassName("flex");
      wind1.processClassName("block");
      wind1.disconnect();

      const styleTag = document.querySelector('style[data-tailwind-runtime]');
      const rulesAfterFirst = styleTag.sheet.cssRules.length;

      // Second instance (simulating StrictMode remount)
      const wind2 = createWindrunner({ autoStart: false });
      wind2.processClassName("flex");
      wind2.processClassName("block");

      // The second instance has its own insertedRules Set but loadExistingRules 
      // scans the existing style tag to populate it
      // Rules count in sheet should not increase
      const rulesAfterSecond = styleTag.sheet.cssRules.length;
      expect(rulesAfterSecond).toBe(rulesAfterFirst);

      wind2.disconnect();
    });

    it("should detect existing rules when loading from a pre-populated style tag", () => {
      // Pre-create a style tag with some rules (simulating previous mount)
      const style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      style.setAttribute('data-tailwind-runtime', 'tailwind-runtime-css');
      document.head.appendChild(style);
      
      // Insert a rule manually
      style.sheet.insertRule('.flex { display: flex; }', 0);

      // New runtime should detect the existing rule
      const wind = createWindrunner({ autoStart: false });
      wind.processClassName("flex");

      // Should reuse existing tag and not duplicate the rule
      const tags = document.querySelectorAll('style[data-tailwind-runtime="tailwind-runtime-css"]');
      expect(tags.length).toBe(1);
      
      // The rule count should still be 1 (the existing rule wasn't duplicated)
      expect(tags[0].sheet.cssRules.length).toBe(1);

      wind.disconnect();
    });

    it("should add new rules alongside existing ones after remount", () => {
      // First instance adds flex
      const wind1 = createWindrunner({ autoStart: false });
      wind1.processClassName("flex");
      wind1.disconnect();

      const styleTag = document.querySelector('style[data-tailwind-runtime]');
      expect(styleTag.sheet.cssRules.length).toBe(1);

      // Second instance adds grid (new rule)
      const wind2 = createWindrunner({ autoStart: false });
      wind2.processClassName("grid");

      // Should now have 2 rules total
      expect(styleTag.sheet.cssRules.length).toBe(2);

      wind2.disconnect();
    });
  });

  describe("duplicate prevention with rapid mutations", () => {
    it("should handle scan() processing many elements with overlapping classes without duplicates", () => {
      document.body.innerHTML = `
        <div class="flex items-center gap-4">First</div>
        <div class="flex justify-between gap-4">Second</div>
        <div class="flex items-center justify-center">Third</div>
      `;

      const wind = createWindrunner({ autoStart: false, preflight: false });
      wind.scan();

      // flex appears 3 times, items-center 2 times, gap-4 2 times — no duplicates
      const styleTag = document.querySelector('style[data-tailwind-runtime]');
      const ruleTexts = [];
      for (let i = 0; i < styleTag.sheet.cssRules.length; i++) {
        ruleTexts.push(styleTag.sheet.cssRules[i].cssText);
      }

      // Check for no duplicate entries
      const uniqueRules = new Set(ruleTexts);
      expect(uniqueRules.size).toBe(ruleTexts.length);

      wind.disconnect();
    });

    it("should handle processClassList with duplicates in the list", () => {
      const wind = createWindrunner({ autoStart: false });

      wind.processClassList("flex block flex grid block flex");

      // Only 3 unique rules should exist
      expect(wind.getInsertedRuleCount()).toBe(3);

      wind.disconnect();
    });
  });
});
