import { describe, it, expect } from "vitest";
import { parseNamedVariant } from "./resolvers.js";

describe("parseNamedVariant", () => {
  describe("group marker patterns", () => {
    it("parses group/[name] marker patterns", () => {
      const result = parseNamedVariant("group/sidebar");
      expect(result).toEqual({
        type: "group",
        state: null,
        name: "sidebar",
      });
    });

    it("parses group/[name] with various names", () => {
      expect(parseNamedVariant("group/nav")).toEqual({
        type: "group",
        state: null,
        name: "nav",
      });

      expect(parseNamedVariant("group/card")).toEqual({
        type: "group",
        state: null,
        name: "card",
      });

      expect(parseNamedVariant("group/menu")).toEqual({
        type: "group",
        state: null,
        name: "menu",
      });
    });

    it("parses group/[name] with numeric names", () => {
      expect(parseNamedVariant("group/item1")).toEqual({
        type: "group",
        state: null,
        name: "item1",
      });

      expect(parseNamedVariant("group/section2")).toEqual({
        type: "group",
        state: null,
        name: "section2",
      });
    });

    it("parses group/[name] with hyphenated names", () => {
      expect(parseNamedVariant("group/side-bar")).toEqual({
        type: "group",
        state: null,
        name: "side-bar",
      });

      expect(parseNamedVariant("group/main-nav")).toEqual({
        type: "group",
        state: null,
        name: "main-nav",
      });
    });

    it("parses group/[name] with underscored names", () => {
      expect(parseNamedVariant("group/side_bar")).toEqual({
        type: "group",
        state: null,
        name: "side_bar",
      });

      expect(parseNamedVariant("group/main_nav")).toEqual({
        type: "group",
        state: null,
        name: "main_nav",
      });
    });
  });

  describe("group state patterns", () => {
    it("parses group-[state]/[name] with hover state", () => {
      const result = parseNamedVariant("group-hover/sidebar");
      expect(result).toEqual({
        type: "group",
        state: "hover",
        name: "sidebar",
      });
    });

    it("parses group-[state]/[name] with various pseudo-class states", () => {
      expect(parseNamedVariant("group-focus/nav")).toEqual({
        type: "group",
        state: "focus",
        name: "nav",
      });

      expect(parseNamedVariant("group-active/button")).toEqual({
        type: "group",
        state: "active",
        name: "button",
      });

      expect(parseNamedVariant("group-disabled/input")).toEqual({
        type: "group",
        state: "disabled",
        name: "input",
      });

      expect(parseNamedVariant("group-focus-visible/link")).toEqual({
        type: "group",
        state: "focus-visible",
        name: "link",
      });

      expect(parseNamedVariant("group-focus-within/form")).toEqual({
        type: "group",
        state: "focus-within",
        name: "form",
      });
    });

    it("parses group-[state]/[name] with structural pseudo-classes", () => {
      expect(parseNamedVariant("group-first/item")).toEqual({
        type: "group",
        state: "first",
        name: "item",
      });

      expect(parseNamedVariant("group-last/item")).toEqual({
        type: "group",
        state: "last",
        name: "item",
      });

      expect(parseNamedVariant("group-even/row")).toEqual({
        type: "group",
        state: "even",
        name: "row",
      });

      expect(parseNamedVariant("group-odd/row")).toEqual({
        type: "group",
        state: "odd",
        name: "row",
      });
    });

    it("parses group-[state]/[name] with input states", () => {
      expect(parseNamedVariant("group-checked/checkbox")).toEqual({
        type: "group",
        state: "checked",
        name: "checkbox",
      });

      expect(parseNamedVariant("group-indeterminate/checkbox")).toEqual({
        type: "group",
        state: "indeterminate",
        name: "checkbox",
      });

      expect(parseNamedVariant("group-required/field")).toEqual({
        type: "group",
        state: "required",
        name: "field",
      });

      expect(parseNamedVariant("group-invalid/input")).toEqual({
        type: "group",
        state: "invalid",
        name: "input",
      });

      expect(parseNamedVariant("group-valid/input")).toEqual({
        type: "group",
        state: "valid",
        name: "input",
      });
    });

    it("parses group-[state]/[name] with hyphenated names and states", () => {
      expect(parseNamedVariant("group-hover/side-bar")).toEqual({
        type: "group",
        state: "hover",
        name: "side-bar",
      });

      expect(parseNamedVariant("group-focus-visible/main-nav")).toEqual({
        type: "group",
        state: "focus-visible",
        name: "main-nav",
      });
    });

    it("parses group-[state]/[name] with underscored names", () => {
      expect(parseNamedVariant("group-hover/side_bar")).toEqual({
        type: "group",
        state: "hover",
        name: "side_bar",
      });
    });

    it("parses group-[state]/[name] with numeric names", () => {
      expect(parseNamedVariant("group-hover/item1")).toEqual({
        type: "group",
        state: "hover",
        name: "item1",
      });
    });
  });

  describe("peer marker patterns", () => {
    it("parses peer/[name] marker patterns", () => {
      const result = parseNamedVariant("peer/toggle");
      expect(result).toEqual({
        type: "peer",
        state: null,
        name: "toggle",
      });
    });

    it("parses peer/[name] with various names", () => {
      expect(parseNamedVariant("peer/input")).toEqual({
        type: "peer",
        state: null,
        name: "input",
      });

      expect(parseNamedVariant("peer/checkbox")).toEqual({
        type: "peer",
        state: null,
        name: "checkbox",
      });

      expect(parseNamedVariant("peer/radio")).toEqual({
        type: "peer",
        state: null,
        name: "radio",
      });
    });

    it("parses peer/[name] with hyphenated names", () => {
      expect(parseNamedVariant("peer/main-input")).toEqual({
        type: "peer",
        state: null,
        name: "main-input",
      });
    });

    it("parses peer/[name] with underscored names", () => {
      expect(parseNamedVariant("peer/main_input")).toEqual({
        type: "peer",
        state: null,
        name: "main_input",
      });
    });
  });

  describe("peer state patterns", () => {
    it("parses peer-[state]/[name] with checked state", () => {
      const result = parseNamedVariant("peer-checked/toggle");
      expect(result).toEqual({
        type: "peer",
        state: "checked",
        name: "toggle",
      });
    });

    it("parses peer-[state]/[name] with various states", () => {
      expect(parseNamedVariant("peer-focus/input")).toEqual({
        type: "peer",
        state: "focus",
        name: "input",
      });

      expect(parseNamedVariant("peer-hover/checkbox")).toEqual({
        type: "peer",
        state: "hover",
        name: "checkbox",
      });

      expect(parseNamedVariant("peer-disabled/button")).toEqual({
        type: "peer",
        state: "disabled",
        name: "button",
      });

      expect(parseNamedVariant("peer-invalid/field")).toEqual({
        type: "peer",
        state: "invalid",
        name: "field",
      });

      expect(parseNamedVariant("peer-valid/field")).toEqual({
        type: "peer",
        state: "valid",
        name: "field",
      });

      expect(parseNamedVariant("peer-required/input")).toEqual({
        type: "peer",
        state: "required",
        name: "input",
      });
    });

    it("parses peer-[state]/[name] with hyphenated states", () => {
      expect(parseNamedVariant("peer-focus-visible/input")).toEqual({
        type: "peer",
        state: "focus-visible",
        name: "input",
      });

      expect(parseNamedVariant("peer-focus-within/form")).toEqual({
        type: "peer",
        state: "focus-within",
        name: "form",
      });
    });

    it("parses peer-[state]/[name] with hyphenated names", () => {
      expect(parseNamedVariant("peer-checked/main-toggle")).toEqual({
        type: "peer",
        state: "checked",
        name: "main-toggle",
      });
    });

    it("parses peer-[state]/[name] with underscored names", () => {
      expect(parseNamedVariant("peer-checked/main_toggle")).toEqual({
        type: "peer",
        state: "checked",
        name: "main_toggle",
      });
    });
  });

  describe("invalid patterns", () => {
    it("returns null for non-group/peer patterns", () => {
      expect(parseNamedVariant("hover")).toBe(null);
      expect(parseNamedVariant("focus")).toBe(null);
      expect(parseNamedVariant("md")).toBe(null);
      expect(parseNamedVariant("bg-blue-500")).toBe(null);
    });

    it("returns null for group without slash", () => {
      expect(parseNamedVariant("group")).toBe(null);
      expect(parseNamedVariant("group-hover")).toBe(null);
    });

    it("returns null for peer without slash", () => {
      expect(parseNamedVariant("peer")).toBe(null);
      expect(parseNamedVariant("peer-checked")).toBe(null);
    });

    it("returns null for patterns with missing name", () => {
      expect(parseNamedVariant("group/")).toBe(null);
      expect(parseNamedVariant("peer/")).toBe(null);
      expect(parseNamedVariant("group-hover/")).toBe(null);
      expect(parseNamedVariant("peer-checked/")).toBe(null);
    });

    it("returns null for patterns with extra slashes", () => {
      expect(parseNamedVariant("group/nav/extra")).toBe(null);
      expect(parseNamedVariant("peer/toggle/extra")).toBe(null);
      expect(parseNamedVariant("group-hover/nav/extra")).toBe(null);
    });

    it("returns null for patterns with missing type", () => {
      expect(parseNamedVariant("/sidebar")).toBe(null);
      expect(parseNamedVariant("-hover/sidebar")).toBe(null);
    });

    it("returns null for invalid types", () => {
      expect(parseNamedVariant("parent/sidebar")).toBe(null);
      expect(parseNamedVariant("sibling/toggle")).toBe(null);
      expect(parseNamedVariant("child-hover/nav")).toBe(null);
    });

    it("returns null for empty string", () => {
      expect(parseNamedVariant("")).toBe(null);
    });

    it("returns null for non-string input", () => {
      expect(parseNamedVariant(null)).toBe(null);
      expect(parseNamedVariant(undefined)).toBe(null);
      expect(parseNamedVariant(123)).toBe(null);
      expect(parseNamedVariant({})).toBe(null);
      expect(parseNamedVariant([])).toBe(null);
    });

    it("returns null for patterns with special characters in names", () => {
      // Names should only contain alphanumeric, hyphen, and underscore
      expect(parseNamedVariant("group/nav.bar")).toBe(null);
      expect(parseNamedVariant("peer/input@field")).toBe(null);
      expect(parseNamedVariant("group-hover/side$bar")).toBe(null);
    });

    it("returns null for patterns with spaces", () => {
      expect(parseNamedVariant("group / sidebar")).toBe(null);
      expect(parseNamedVariant("group-hover / sidebar")).toBe(null);
      expect(parseNamedVariant("peer / toggle")).toBe(null);
    });
  });

  describe("edge cases", () => {
    it("handles single character names", () => {
      expect(parseNamedVariant("group/a")).toEqual({
        type: "group",
        state: null,
        name: "a",
      });

      expect(parseNamedVariant("peer/x")).toEqual({
        type: "peer",
        state: null,
        name: "x",
      });
    });

    it("handles long names", () => {
      const longName = "verylongnamewithlotsofdifferentcharacters123";
      expect(parseNamedVariant(`group/${longName}`)).toEqual({
        type: "group",
        state: null,
        name: longName,
      });
    });

    it("handles numeric-only names", () => {
      expect(parseNamedVariant("group/123")).toEqual({
        type: "group",
        state: null,
        name: "123",
      });

      expect(parseNamedVariant("peer/456")).toEqual({
        type: "peer",
        state: null,
        name: "456",
      });
    });

    it("handles multiple hyphens in state", () => {
      expect(parseNamedVariant("group-focus-visible-within/nav")).toEqual({
        type: "group",
        state: "focus-visible-within",
        name: "nav",
      });
    });

    it("handles multiple hyphens in name", () => {
      expect(parseNamedVariant("group/side-bar-main")).toEqual({
        type: "group",
        state: null,
        name: "side-bar-main",
      });
    });

    it("handles mixed alphanumeric with hyphens and underscores", () => {
      expect(parseNamedVariant("group/nav_item-1")).toEqual({
        type: "group",
        state: null,
        name: "nav_item-1",
      });

      expect(parseNamedVariant("peer-checked/toggle_2-main")).toEqual({
        type: "peer",
        state: "checked",
        name: "toggle_2-main",
      });
    });
  });

  describe("real-world use cases", () => {
    it("parses common sidebar group patterns", () => {
      expect(parseNamedVariant("group/sidebar")).toEqual({
        type: "group",
        state: null,
        name: "sidebar",
      });

      expect(parseNamedVariant("group-hover/sidebar")).toEqual({
        type: "group",
        state: "hover",
        name: "sidebar",
      });

      expect(parseNamedVariant("group-focus/sidebar")).toEqual({
        type: "group",
        state: "focus",
        name: "sidebar",
      });
    });

    it("parses common navigation group patterns", () => {
      expect(parseNamedVariant("group/nav")).toEqual({
        type: "group",
        state: null,
        name: "nav",
      });

      expect(parseNamedVariant("group-hover/nav")).toEqual({
        type: "group",
        state: "hover",
        name: "nav",
      });
    });

    it("parses common card group patterns", () => {
      expect(parseNamedVariant("group/card")).toEqual({
        type: "group",
        state: null,
        name: "card",
      });

      expect(parseNamedVariant("group-hover/card")).toEqual({
        type: "group",
        state: "hover",
        name: "card",
      });
    });

    it("parses common checkbox peer patterns", () => {
      expect(parseNamedVariant("peer/terms")).toEqual({
        type: "peer",
        state: null,
        name: "terms",
      });

      expect(parseNamedVariant("peer-checked/terms")).toEqual({
        type: "peer",
        state: "checked",
        name: "terms",
      });
    });

    it("parses common toggle peer patterns", () => {
      expect(parseNamedVariant("peer/toggle")).toEqual({
        type: "peer",
        state: null,
        name: "toggle",
      });

      expect(parseNamedVariant("peer-checked/toggle")).toEqual({
        type: "peer",
        state: "checked",
        name: "toggle",
      });
    });

    it("parses common radio button peer patterns", () => {
      expect(parseNamedVariant("peer/option-a")).toEqual({
        type: "peer",
        state: null,
        name: "option-a",
      });

      expect(parseNamedVariant("peer-checked/option-a")).toEqual({
        type: "peer",
        state: "checked",
        name: "option-a",
      });
    });

    it("parses common input validation peer patterns", () => {
      expect(parseNamedVariant("peer/email")).toEqual({
        type: "peer",
        state: null,
        name: "email",
      });

      expect(parseNamedVariant("peer-invalid/email")).toEqual({
        type: "peer",
        state: "invalid",
        name: "email",
      });

      expect(parseNamedVariant("peer-valid/email")).toEqual({
        type: "peer",
        state: "valid",
        name: "email",
      });
    });
  });
});
