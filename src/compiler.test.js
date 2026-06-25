import { describe, it, expect } from "vitest";
import { compileRuntimeClassNameWithContext, compileClass, parseClass } from "./compiler.js";

const baseContext = {
  theme: {
    spacing: {
      4: "1rem",
    },
  },
  screens: {},
  containers: {},
};

describe("compiler", () => {
  it("parses responsive variant tokens correctly", () => {
    const parsed = parseClass("md:hover:flex", { md: "768px" });
    expect(parsed).toEqual({
      original: "md:hover:flex",
      baseToken: "flex",
      variants: ["hover"],
      breakpoint: "md",
      containerBreakpoint: null,
      important: false,
      starting: false,
    });
  });

  it("compiles a simple utility class", () => {
    const css = compileRuntimeClassNameWithContext("flex", baseContext);
    expect(css).toBe(".flex { display: flex; }");
  });

  it("compiles space-x utility with child selector", () => {
    const css = compileRuntimeClassNameWithContext("space-x-4", baseContext);
    expect(css).toContain("> :not(:first-child)");
    expect(css).toContain("--tw-space-x-reverse: 0;");
    expect(css).toContain("margin-inline-end: calc(1rem * var(--tw-space-x-reverse));");
  });

  it("compiles class names through compileClass API", () => {
    const css = compileClass("flex", { theme: {}, screens: {}, containers: {} });
    expect(css).toBe(".flex { display: flex; }");
  });
});
