import { describe, it, expect } from "vitest";
import { compileRuntimeClassNameWithContext, compileClass, parseClass, resolveRuntimeContext } from "./compiler.js";

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

  it("compiles space-y and reverse space utilities", () => {
    expect(compileRuntimeClassNameWithContext("space-y-4", baseContext)).toContain("--tw-space-y-reverse: 0;");
    expect(compileRuntimeClassNameWithContext("space-y-4", baseContext)).toContain("margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));" );
    expect(compileRuntimeClassNameWithContext("space-x-reverse", baseContext)).toBe(".space-x-reverse { --tw-space-x-reverse: 1; }");
    expect(compileRuntimeClassNameWithContext("space-y-reverse", baseContext)).toBe(".space-y-reverse { --tw-space-y-reverse: 1; }");
  });

  it("compiles class names through compileClass API", () => {
    const css = compileClass("flex", { theme: {}, screens: {}, containers: {} });
    expect(css).toBe(".flex { display: flex; }");
  });

  it("supports compileClass with top-level screens and containers options", () => {
    const css = compileClass("md:flex", { theme: {}, screens: { md: "768px" }, containers: {} });
    expect(css).toBe("@media (min-width: 768px) { .md\\:flex { display: flex; } }");
  });

  describe("layout utilities", () => {
    const context = resolveRuntimeContext();

    it("supports table layout utilities", () => {
      expect(compileRuntimeClassNameWithContext("table-auto", context)).toBe(".table-auto { table-layout: auto; }");
      expect(compileRuntimeClassNameWithContext("table-fixed", context)).toBe(".table-fixed { table-layout: fixed; }");
    });

    it("supports caption utilities", () => {
      expect(compileRuntimeClassNameWithContext("caption-top", context)).toBe(".caption-top { caption-side: top; }");
      expect(compileRuntimeClassNameWithContext("caption-bottom", context)).toBe(".caption-bottom { caption-side: bottom; }");
    });

    it("supports border collapse utilities", () => {
      expect(compileRuntimeClassNameWithContext("border-collapse", context)).toBe(".border-collapse { border-collapse: collapse; }");
      expect(compileRuntimeClassNameWithContext("border-separate", context)).toBe(".border-separate { border-collapse: separate; }");
    });

    it("supports scroll and behavior utilities", () => {
      expect(compileRuntimeClassNameWithContext("scroll-behavior-smooth", context)).toBe(".scroll-behavior-smooth { scroll-behavior: smooth; }");
      expect(compileRuntimeClassNameWithContext("scroll-m-4", context)).toBe(".scroll-m-4 { scroll-margin: 1rem; }");
      expect(compileRuntimeClassNameWithContext("scroll-p-4", context)).toBe(".scroll-p-4 { scroll-padding: 1rem; }");
    });

    it("supports object, order, and layout-specific utilities", () => {
      const layoutContext = resolveRuntimeContext({
        theme: {
          objectPosition: { center: "center" },
          order: { 1: "1" },
          zIndex: { 10: "10" },
          aspectRatio: { video: "16 / 9" },
          columns: { 3: "3" },
          size: { 4: "1rem" },
        },
      });

      expect(compileRuntimeClassNameWithContext("object-contain", layoutContext)).toBe(".object-contain { object-fit: contain; }");
      expect(compileRuntimeClassNameWithContext("object-center", layoutContext)).toBe(".object-center { object-position: center; }");
      expect(compileRuntimeClassNameWithContext("order-1", layoutContext)).toBe(".order-1 { order: 1; }");
      expect(compileRuntimeClassNameWithContext("z-10", layoutContext)).toBe(".z-10 { z-index: 10; }");
      expect(compileRuntimeClassNameWithContext("-z-10", layoutContext)).toBe(".-z-10 { z-index: -10; }");
      expect(compileRuntimeClassNameWithContext("break-after-page", layoutContext)).toBe(".break-after-page { break-after: page; }");
      expect(compileRuntimeClassNameWithContext("box-decoration-break-clone", layoutContext)).toBe(".box-decoration-break-clone { box-decoration-break: clone; }");
      expect(compileRuntimeClassNameWithContext("size-4", layoutContext)).toBe(".size-4 { width: 1rem; height: 1rem; }");
      expect(compileRuntimeClassNameWithContext("content-[hello]", layoutContext)).toBe(".content-\\[hello\\] { content: hello; }");
      expect(compileRuntimeClassNameWithContext("aspect-video", layoutContext)).toBe(".aspect-video { aspect-ratio: 16 / 9; }");
      expect(compileRuntimeClassNameWithContext("columns-3", layoutContext)).toBe(".columns-3 { columns: 3; }");
      expect(compileRuntimeClassNameWithContext("box-border", layoutContext)).toBe(".box-border { box-sizing: border-box; }");
    });

    it("supports scrollbar utilities", () => {
      expect(compileRuntimeClassNameWithContext("scrollbar-color-auto", context)).toBe(".scrollbar-color-auto { scrollbar-color: auto; }");
      expect(compileRuntimeClassNameWithContext("scrollbar-width-thin", context)).toBe(".scrollbar-width-thin { scrollbar-width: thin; }");
      expect(compileRuntimeClassNameWithContext("scrollbar-gutter-stable", context)).toBe(".scrollbar-gutter-stable { scrollbar-gutter: stable; }");
    });

    it("supports color scheme utility", () => {
      expect(compileRuntimeClassNameWithContext("color-scheme-dark", context)).toBe(".color-scheme-dark { color-scheme: dark; }");
    });
  });

  describe("filter utilities", () => {
    const defaultContext = resolveRuntimeContext();
    const filterContext = resolveRuntimeContext({
      theme: {
        blur: { sm: "4px" },
        brightness: { 125: "1.25" },
        contrast: { 50: "0.5" },
        grayscale: { 50: "0.5" },
        hueRotate: { 180: "180deg", 90: "90deg" },
        invert: { 50: "0.5", 75: "0.75" },
        saturate: { 150: "1.5", 200: "2" },
        sepia: { 50: "0.5", 25: "0.25" },
        dropShadow: {
          DEFAULT: "0 1px 2px rgba(0,0,0,0.05)",
          sm: "0 1px 1px rgba(0,0,0,0.05)",
        },
        backdropBrightness: { 150: "1.5" },
        backdropContrast: { 75: "0.75" },
        backdropGrayscale: { 50: "0.5" },
        backdropHueRotate: { 90: "90deg" },
        backdropInvert: { 50: "0.5" },
        backdropOpacity: { 50: "0.5" },
        backdropSaturate: { 200: "2" },
        backdropSepia: { 25: "0.25" },
      },
    });

    it("supports filter and backdrop-filter keywords", () => {
      expect(compileRuntimeClassNameWithContext("filter", defaultContext)).toBe(".filter { filter: none; }");
      expect(compileRuntimeClassNameWithContext("backdrop-filter", defaultContext)).toBe(".backdrop-filter { backdrop-filter: none; }");
    });

    it("supports numeric filter defaults", () => {
      expect(compileRuntimeClassNameWithContext("brightness", defaultContext)).toBe(".brightness { filter: brightness(1); }");
      expect(compileRuntimeClassNameWithContext("contrast", defaultContext)).toBe(".contrast { filter: contrast(1); }");
      expect(compileRuntimeClassNameWithContext("hue-rotate", defaultContext)).toBe(".hue-rotate { filter: hue-rotate(0deg); }");
      expect(compileRuntimeClassNameWithContext("saturate", defaultContext)).toBe(".saturate { filter: saturate(1); }");
      expect(compileRuntimeClassNameWithContext("backdrop-opacity", defaultContext)).toBe(".backdrop-opacity { backdrop-filter: opacity(1); }");
    });

    it("supports configured filter utilities", () => {
      expect(compileRuntimeClassNameWithContext("blur-sm", filterContext)).toBe(".blur-sm { filter: blur(4px); }");
      expect(compileRuntimeClassNameWithContext("brightness-125", filterContext)).toBe(".brightness-125 { filter: brightness(1.25); }");
      expect(compileRuntimeClassNameWithContext("contrast-50", filterContext)).toBe(".contrast-50 { filter: contrast(0.5); }");
      expect(compileRuntimeClassNameWithContext("grayscale-50", filterContext)).toBe(".grayscale-50 { filter: grayscale(0.5); }");
      expect(compileRuntimeClassNameWithContext("hue-rotate-180", filterContext)).toBe(".hue-rotate-180 { filter: hue-rotate(180deg); }");
      expect(compileRuntimeClassNameWithContext("invert-75", filterContext)).toBe(".invert-75 { filter: invert(0.75); }");
      expect(compileRuntimeClassNameWithContext("saturate-150", filterContext)).toBe(".saturate-150 { filter: saturate(1.5); }");
      expect(compileRuntimeClassNameWithContext("sepia-50", filterContext)).toBe(".sepia-50 { filter: sepia(0.5); }");
      expect(compileRuntimeClassNameWithContext("drop-shadow", filterContext)).toBe(".drop-shadow { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05)); }");
      expect(compileRuntimeClassNameWithContext("drop-shadow-sm", filterContext)).toBe(".drop-shadow-sm { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05)); }");
    });

    it("supports configured backdrop filter utilities", () => {
      expect(compileRuntimeClassNameWithContext("backdrop-blur-sm", filterContext)).toBe(".backdrop-blur-sm { backdrop-filter: blur(4px); }");
      expect(compileRuntimeClassNameWithContext("backdrop-brightness-150", filterContext)).toBe(".backdrop-brightness-150 { backdrop-filter: brightness(1.5); }");
      expect(compileRuntimeClassNameWithContext("backdrop-contrast-75", filterContext)).toBe(".backdrop-contrast-75 { backdrop-filter: contrast(0.75); }");
      expect(compileRuntimeClassNameWithContext("backdrop-grayscale-50", filterContext)).toBe(".backdrop-grayscale-50 { backdrop-filter: grayscale(0.5); }");
      expect(compileRuntimeClassNameWithContext("backdrop-hue-rotate-90", filterContext)).toBe(".backdrop-hue-rotate-90 { backdrop-filter: hue-rotate(90deg); }");
      expect(compileRuntimeClassNameWithContext("backdrop-invert-50", filterContext)).toBe(".backdrop-invert-50 { backdrop-filter: invert(0.5); }");
      expect(compileRuntimeClassNameWithContext("backdrop-opacity-50", filterContext)).toBe(".backdrop-opacity-50 { backdrop-filter: opacity(0.5); }");
      expect(compileRuntimeClassNameWithContext("backdrop-saturate-200", filterContext)).toBe(".backdrop-saturate-200 { backdrop-filter: saturate(2); }");
      expect(compileRuntimeClassNameWithContext("backdrop-sepia-25", filterContext)).toBe(".backdrop-sepia-25 { backdrop-filter: sepia(0.25); }");
    });
  });

  describe("background utilities", () => {
    const context = resolveRuntimeContext({
      theme: {
        backgroundSize: { custom: "12px 14px" },
        backgroundPosition: { hero: "center top" },
        backgroundImage: { pattern: "url('/img/pattern.svg')" },
        colors: { blue: { 500: "#3b82f6" }, red: { 500: "#ef4444" } },
      },
    });

    it("supports non-image background utilities", () => {
      expect(compileRuntimeClassNameWithContext("bg-fixed", context)).toBe(".bg-fixed { background-attachment: fixed; }");
      expect(compileRuntimeClassNameWithContext("bg-clip-text", context)).toBe(".bg-clip-text { background-clip: text; -webkit-background-clip: text; }");
      expect(compileRuntimeClassNameWithContext("bg-origin-padding", context)).toBe(".bg-origin-padding { background-origin: padding-box; }");
      expect(compileRuntimeClassNameWithContext("bg-no-repeat", context)).toBe(".bg-no-repeat { background-repeat: no-repeat; }");
    });

    it("supports theme-based background size, position, and image", () => {
      expect(compileRuntimeClassNameWithContext("bg-custom", context)).toBe(".bg-custom { background-size: 12px 14px; }");
      expect(compileRuntimeClassNameWithContext("bg-hero", context)).toBe(".bg-hero { background-position: center top; }");
      expect(compileRuntimeClassNameWithContext("bg-pattern", context)).toBe(".bg-pattern { background-image: url('/img/pattern.svg'); }");
    });

    it("supports gradient color stop utilities", () => {
      const gradientContext = resolveRuntimeContext({
        theme: {
          colors: {
            blue: { 500: "#3b82f6" },
            red: { 500: "#ef4444" },
          },
        },
      });

      expect(compileRuntimeClassNameWithContext("from-blue-500", gradientContext)).toContain(".from-blue-500 { --tw-gradient-from:");
      expect(compileRuntimeClassNameWithContext("from-blue-500", gradientContext)).toContain("--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via, transparent), var(--tw-gradient-to, transparent);");
      expect(compileRuntimeClassNameWithContext("via-red-500", gradientContext)).toContain(".via-red-500 { --tw-gradient-via:");
      expect(compileRuntimeClassNameWithContext("to-blue-500", gradientContext)).toContain(".to-blue-500 { --tw-gradient-to:");
    });
  });

  describe("color and outline utilities", () => {
    const context = resolveRuntimeContext({
      theme: {
        colors: {
          blue: { 500: "#3b82f6" },
          red: { 500: "#ef4444" },
          green: { 500: "#22c55e" },
        },
        strokeWidth: { 2: "2px" },
        outlineWidth: { 2: "2px" },
        outlineOffset: { 4: "4px" },
      },
    });

    it("supports color utilities", () => {
      expect(compileRuntimeClassNameWithContext("bg-red-500", context)).toBe(".bg-red-500 { background-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("border-red-500", context)).toBe(".border-red-500 { border-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("fill-green-500", context)).toBe(".fill-green-500 { fill: #22c55e; }");
      expect(compileRuntimeClassNameWithContext("stroke-blue-500", context)).toBe(".stroke-blue-500 { stroke: #3b82f6; }");
      expect(compileRuntimeClassNameWithContext("stroke-2", context)).toBe(".stroke-2 { stroke-width: 2px; }");
      expect(compileRuntimeClassNameWithContext("placeholder-red-500", context)).toBe(".placeholder-red-500 { --tw-placeholder-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("accent-blue-500", context)).toContain("accent-color: #3b82f6");
      expect(compileRuntimeClassNameWithContext("caret-red-500", context)).toContain("caret-color: #ef4444");
    });

    it("supports outline utilities", () => {
      expect(compileRuntimeClassNameWithContext("outline-none", context)).toBe(".outline-none { outline: 2px solid transparent; outline-offset: 2px; }");
      expect(compileRuntimeClassNameWithContext("outline-solid", context)).toBe(".outline-solid { outline-style: solid; }");
      expect(compileRuntimeClassNameWithContext("outline-2", context)).toBe(".outline-2 { outline-width: 2px; }");
      expect(compileRuntimeClassNameWithContext("outline-offset-4", context)).toBe(".outline-offset-4 { outline-offset: 4px; }");
      expect(compileRuntimeClassNameWithContext("outline-red-500", context)).toBe(".outline-red-500 { outline-color: #ef4444; }");
    });
  });

  describe("borders, effects, flex/grid, divide, transition, and misc utilities", () => {
    const context = resolveRuntimeContext({
      theme: {
        borderWidth: { DEFAULT: "1px", 2: "2px", 4: "4px" },
        borderRadius: { DEFAULT: "0.25rem", xl: "1rem" },
        colors: { red: { 500: "#ef4444" }, blue: { 500: "#3b82f6" } },
        opacity: { 50: "0.5" },
        boxShadow: { DEFAULT: "0 1px 3px rgba(0,0,0,0.1)", sm: "0 1px 2px rgba(0,0,0,0.05)" },
        ringColor: { DEFAULT: "rgb(59 130 246 / 0.5)", red: "#ef4444" },
        ringWidth: { DEFAULT: "3px", 4: "4px" },
        ringOffsetWidth: { 4: "4px" },
        ringOffsetColor: { red: "#ef4444" },
        textShadow: { DEFAULT: "0 1px 2px rgba(0,0,0,0.1)", sm: "0 1px 3px rgba(0,0,0,0.2)" },
        flexBasis: { 4: "1rem" },
        gridTemplateColumns: { custom: "150px 1fr" },
        gridTemplateRows: { custom: "100px 2fr" },
        gridColumn: { 2: "span 2 / span 2" },
        gridRow: { 3: "span 3 / span 3" },
        borderSpacing: { 4: "1rem" },
        spacing: { 4: "1rem" },
        outlineWidth: { 2: "2px" },
        outlineOffset: { 4: "4px" },
        strokeWidth: { 2: "2px" },
      },
    });

    it("supports border utilities", () => {
      expect(compileRuntimeClassNameWithContext("border", context)).toBe(".border { border-width: 1px; }");
      expect(compileRuntimeClassNameWithContext("border-t-2", context)).toBe(".border-t-2 { border-top-width: 2px; }");
      expect(compileRuntimeClassNameWithContext("border-x-4", context)).toBe(".border-x-4 { border-left-width: 4px; border-right-width: 4px; }");
      expect(compileRuntimeClassNameWithContext("border-solid", context)).toBe(".border-solid { border-style: solid; }");
      expect(compileRuntimeClassNameWithContext("rounded", context)).toBe(".rounded { border-radius: 0.25rem; }");
      expect(compileRuntimeClassNameWithContext("rounded-xl", context)).toBe(".rounded-xl { border-radius: 1rem; }");
    });

    it("supports effect utilities", () => {
      expect(compileRuntimeClassNameWithContext("opacity-50", context)).toBe(".opacity-50 { opacity: 0.5; }");
      expect(compileRuntimeClassNameWithContext("shadow", context)).toBe(".shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }");
      expect(compileRuntimeClassNameWithContext("shadow-sm", context)).toBe(".shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }");
      expect(compileRuntimeClassNameWithContext("shadow-red-500", context)).toBe(".shadow-red-500 { --tw-shadow-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("inset-shadow", context)).toBe(".inset-shadow { box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.1); }");
      expect(compileRuntimeClassNameWithContext("inset-shadow-sm", context)).toBe(".inset-shadow-sm { box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.1); }");
      expect(compileRuntimeClassNameWithContext("inset-shadow-red-500", context)).toBe(".inset-shadow-red-500 { --tw-inset-shadow-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("ring", context)).toBe(".ring { --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); box-shadow: var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color); }");
      expect(compileRuntimeClassNameWithContext("ring-4", context)).toBe(".ring-4 { --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); box-shadow: var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color); }");
      expect(compileRuntimeClassNameWithContext("ring-inset", context)).toBe(".ring-inset { --tw-ring-inset: inset; }");
      expect(compileRuntimeClassNameWithContext("ring-red-500", context)).toBe(".ring-red-500 { --tw-ring-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("ring-offset-4", context)).toBe(".ring-offset-4 { --tw-ring-offset-width: 4px; box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000); }");
      expect(compileRuntimeClassNameWithContext("ring-offset-red-500", context)).toBe(".ring-offset-red-500 { --tw-ring-offset-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("text-shadow", context)).toBe(".text-shadow { text-shadow: 0 1px 2px rgba(0,0,0,0.1); }");
      expect(compileRuntimeClassNameWithContext("text-shadow-sm", context)).toBe(".text-shadow-sm { text-shadow: 0 1px 3px rgba(0,0,0,0.2); }");
      expect(compileRuntimeClassNameWithContext("text-shadow-red-500", context)).toBe(".text-shadow-red-500 { --tw-text-shadow-color: #ef4444; }");
    });

    it("supports flex and grid utilities", () => {
      expect(compileRuntimeClassNameWithContext("grow", context)).toBe(".grow { flex-grow: 1; }");
      expect(compileRuntimeClassNameWithContext("grow-0", context)).toBe(".grow-0 { flex-grow: 0; }");
      expect(compileRuntimeClassNameWithContext("shrink", context)).toBe(".shrink { flex-shrink: 1; }");
      expect(compileRuntimeClassNameWithContext("shrink-0", context)).toBe(".shrink-0 { flex-shrink: 0; }");
      expect(compileRuntimeClassNameWithContext("basis-4", context)).toBe(".basis-4 { flex-basis: 1rem; }");
      expect(compileRuntimeClassNameWithContext("flex-1", context)).toBe(".flex-1 { flex: 1 1 0%; }");
      expect(compileRuntimeClassNameWithContext("flex-row", context)).toBe(".flex-row { flex-direction: row; }");
      expect(compileRuntimeClassNameWithContext("content-center", context)).toBe(".content-center { align-content: center; }");
      expect(compileRuntimeClassNameWithContext("self-start", context)).toBe(".self-start { align-self: flex-start; }");
      expect(compileRuntimeClassNameWithContext("justify-center", context)).toBe(".justify-center { justify-content: center; }");
      expect(compileRuntimeClassNameWithContext("items-center", context)).toBe(".items-center { align-items: center; }");
      expect(compileRuntimeClassNameWithContext("place-content-center", context)).toBe(".place-content-center { place-content: center; }");
      expect(compileRuntimeClassNameWithContext("grid-flow-row", context)).toBe(".grid-flow-row { grid-auto-flow: row; }");
      expect(compileRuntimeClassNameWithContext("grid-cols-3", context)).toBe(".grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }");
      expect(compileRuntimeClassNameWithContext("col-span-2", context)).toBe(".col-span-2 { grid-column: span 2 / span 2; }");
      expect(compileRuntimeClassNameWithContext("row-span-3", context)).toBe(".row-span-3 { grid-row: span 3 / span 3; }");
    });

    it("supports divide utilities", () => {
      expect(compileRuntimeClassNameWithContext("divide-x", context)).toBe(".divide-x { --tw-divide-x-reverse: 0; border-inline-end-width: calc(1px * var(--tw-divide-x-reverse)); border-inline-start-width: calc(1px * calc(1 - var(--tw-divide-x-reverse))); }");
      expect(compileRuntimeClassNameWithContext("divide-x-2", context)).toBe(".divide-x-2 { --tw-divide-x-reverse: 0; border-inline-end-width: calc(2px * var(--tw-divide-x-reverse)); border-inline-start-width: calc(2px * calc(1 - var(--tw-divide-x-reverse))); }");
      expect(compileRuntimeClassNameWithContext("divide-y-4", context)).toBe(".divide-y-4 { --tw-divide-y-reverse: 0; border-bottom-width: calc(4px * var(--tw-divide-y-reverse)); border-top-width: calc(4px * calc(1 - var(--tw-divide-y-reverse))); }");
      expect(compileRuntimeClassNameWithContext("divide-solid", context)).toBe(".divide-solid { border-style: solid; }");
      expect(compileRuntimeClassNameWithContext("divide-red-500", context)).toBe(".divide-red-500 { border-color: #ef4444; }");
      expect(compileRuntimeClassNameWithContext("divide-opacity-50", context)).toBe(".divide-opacity-50 { --tw-divide-opacity: 0.5; }");
    });

    it("supports transition utilities", () => {
      expect(compileRuntimeClassNameWithContext("transition", context)).toBe(".transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }");
      expect(compileRuntimeClassNameWithContext("transition-colors", context)).toBe(".transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }");
      expect(compileRuntimeClassNameWithContext("duration-300", context)).toBe(".duration-300 { transition-duration: 300ms; }");
      expect(compileRuntimeClassNameWithContext("delay-150", context)).toBe(".delay-150 { transition-delay: 150ms; }");
      expect(compileRuntimeClassNameWithContext("ease-in", context)).toBe(".ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }");
    });

    it("supports misc utilities", () => {
      expect(compileRuntimeClassNameWithContext("border-spacing-4", context)).toBe(".border-spacing-4 { --tw-border-spacing-x: 1rem; --tw-border-spacing-y: 1rem; border-spacing: 1rem; }");
      expect(compileRuntimeClassNameWithContext("border-spacing-x-4", context)).toBe(".border-spacing-x-4 { --tw-border-spacing-x: 1rem; border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y, 0); }");
      expect(compileRuntimeClassNameWithContext("border-spacing-y-4", context)).toBe(".border-spacing-y-4 { --tw-border-spacing-y: 1rem; border-spacing: var(--tw-border-spacing-x, 0) var(--tw-border-spacing-y); }");
      expect(compileRuntimeClassNameWithContext("sr-only", context)).toBe(".sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }");
      expect(compileRuntimeClassNameWithContext("not-sr-only", context)).toBe(".not-sr-only { position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal; }");
      expect(compileRuntimeClassNameWithContext("forced-color-adjust-none", context)).toBe(".forced-color-adjust-none { forced-color-adjust: none; }");
    });
  });

  describe("spacing and dimension utilities", () => {
    const context = resolveRuntimeContext({
      theme: {
        spacing: { 2: "0.5rem", 4: "1rem" },
        gap: { 4: "1rem" },
        width: { 1: "0.25rem" },
        height: { 8: "2rem" },
        minWidth: { 1: "0.25rem" },
        maxWidth: { screen: "100vw" },
        minHeight: { 6: "1.5rem" },
        maxHeight: { 64: "16rem" },
      },
    });

    it("supports margin and padding utilities", () => {
      expect(compileRuntimeClassNameWithContext("m-4", context)).toBe(".m-4 { margin: 1rem; }");
      expect(compileRuntimeClassNameWithContext("mx-2", context)).toBe(".mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }");
      expect(compileRuntimeClassNameWithContext("p-4", context)).toBe(".p-4 { padding: 1rem; }");
      expect(compileRuntimeClassNameWithContext("-m-4", context)).toBe(".-m-4 { margin: -1rem; }");
    });

    it("supports gap utilities", () => {
      expect(compileRuntimeClassNameWithContext("gap-4", context)).toBe(".gap-4 { gap: 1rem; }");
      expect(compileRuntimeClassNameWithContext("gap-x-4", context)).toBe(".gap-x-4 { column-gap: 1rem; }");
      expect(compileRuntimeClassNameWithContext("gap-y-4", context)).toBe(".gap-y-4 { row-gap: 1rem; }");
    });

    it("supports dimension utilities", () => {
      expect(compileRuntimeClassNameWithContext("w-1", context)).toBe(".w-1 { width: 0.25rem; }");
      expect(compileRuntimeClassNameWithContext("h-8", context)).toBe(".h-8 { height: 2rem; }");
      expect(compileRuntimeClassNameWithContext("min-w-1", context)).toBe(".min-w-1 { min-width: 0.25rem; }");
      expect(compileRuntimeClassNameWithContext("max-w-screen", context)).toBe(".max-w-screen { max-width: 100vw; }");
      expect(compileRuntimeClassNameWithContext("min-h-6", context)).toBe(".min-h-6 { min-height: 1.5rem; }");
      expect(compileRuntimeClassNameWithContext("max-h-64", context)).toBe(".max-h-64 { max-height: 16rem; }");
    });

    it("supports arbitrary dimension values", () => {
      expect(compileRuntimeClassNameWithContext("w-[50%]", context)).toBe(".w-\\[50\\%\\] { width: 50%; }");
      expect(compileRuntimeClassNameWithContext("h-[100px]", context)).toBe(".h-\\[100px\\] { height: 100px; }");
    });
  });

  describe("blending, mask, container, and scroll-snap utilities", () => {
    const context = resolveRuntimeContext({
      theme: {
        containers: { hero: "100px" },
      },
    });

    it("supports blend utilities", () => {
      expect(compileRuntimeClassNameWithContext("mix-blend-multiply", context)).toBe(".mix-blend-multiply { mix-blend-mode: multiply; }");
      expect(compileRuntimeClassNameWithContext("bg-blend-screen", context)).toBe(".bg-blend-screen { background-blend-mode: screen; }");
    });

    it("supports mask utilities", () => {
      expect(compileRuntimeClassNameWithContext("mask-clip-text", context)).toBe(".mask-clip-text { mask-clip: text; -webkit-mask-clip: text; }");
      expect(compileRuntimeClassNameWithContext("mask-radial", context)).toBe(".mask-radial { mask-image: radial-gradient(circle at center, black, transparent); -webkit-mask-image: radial-gradient(circle at center, black, transparent); }");
      expect(compileRuntimeClassNameWithContext("mask-radial-at-top-right", context)).toBe(".mask-radial-at-top-right { mask-image: radial-gradient(circle at top right, black, transparent); -webkit-mask-image: radial-gradient(circle at top right, black, transparent); }");
      expect(compileRuntimeClassNameWithContext("mask-position-bottom-left", context)).toBe(".mask-position-bottom-left { mask-position: bottom left; -webkit-mask-position: bottom left; }");
      expect(compileRuntimeClassNameWithContext("mask-no-repeat", context)).toBe(".mask-no-repeat { mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; }");
      expect(compileRuntimeClassNameWithContext("mask-size-contain", context)).toBe(".mask-size-contain { mask-size: contain; -webkit-mask-size: contain; }");
    });

    it("supports container query utilities", () => {
      expect(compileRuntimeClassNameWithContext("@container", context)).toBe(".\\@container { container-type: inline-size; }");
      expect(compileRuntimeClassNameWithContext("@container/hero", context)).toBe(".\\@container\\/hero { container-type: inline-size; container-name: hero; }");
    });

    it("supports scroll snap utilities", () => {
      expect(compileRuntimeClassNameWithContext("snap-x", context)).toBe(".snap-x { scroll-snap-type: x var(--tw-scroll-snap-strictness); }");
      expect(compileRuntimeClassNameWithContext("snap-start", context)).toBe(".snap-start { scroll-snap-align: start; }");
      expect(compileRuntimeClassNameWithContext("snap-always", context)).toBe(".snap-always { scroll-snap-stop: always; }");
    });
  });

  describe("variant utilities", () => {
    const context = resolveRuntimeContext({
      screens: { md: "768px" },
      theme: {
        colors: { red: { 500: "#ef4444" }, blue: { 500: "#3b82f6" } },
      },
    });

    it("supports responsive hover utilities", () => {
      expect(compileRuntimeClassNameWithContext("md:hover:bg-red-500", context)).toBe("@media (min-width: 768px) { .md\\:hover\\:bg-red-500:hover { background-color: #ef4444; } }");
    });

    it("supports focus variant and important prefix", () => {
      expect(compileRuntimeClassNameWithContext("!focus:text-blue-500", context)).toBe(".\\!focus\\:text-blue-500:focus { color: #3b82f6 !important; }");
    });

    it("supports starting variant wrapping rules", () => {
      const startingContext = resolveRuntimeContext({
        theme: { colors: { red: { 500: "#ef4444" } } },
        screens: { md: "768px" },
      });

      expect(compileRuntimeClassNameWithContext("starting:bg-red-500", startingContext)).toBe("@starting-style { .starting\\:bg-red-500 { background-color: #ef4444; } }");
      expect(compileRuntimeClassNameWithContext("starting:md:bg-red-500", startingContext)).toBe("@starting-style { @media (min-width: 768px) { .starting\\:md\\:bg-red-500 { background-color: #ef4444; } } }");
    });

    it("supports group-hover utilities", () => {
      expect(compileRuntimeClassNameWithContext("group-hover:text-blue-500", context)).toBe(".group:hover .group-hover\\:text-blue-500 { color: #3b82f6; }");
    });
  });

  describe("typography utilities", () => {
    const typographyContext = resolveRuntimeContext({
      theme: {
        fontSize: { xl: "1.25rem" },
        fontWeight: { bold: "700" },
        fontFamily: { sans: ["ui-sans-serif", "system-ui"] },
        colors: { blue: { 500: "#3b82f6" }, red: { 500: "#ef4444" } },
        lineHeight: { relaxed: "1.75" },
        letterSpacing: { tight: "-0.05em" },
        textDecorationThickness: { 4: "4px" },
        textUnderlineOffset: { 4: "4px" },
        textIndent: { 4: "1rem" },
        listStyleType: { disc: "disc" },
        lineClamp: { 3: "3" },
      },
    });

    it("supports typography utilities with theme values", () => {
      expect(compileRuntimeClassNameWithContext("text-center", typographyContext)).toBe(".text-center { text-align: center; }");
      expect(compileRuntimeClassNameWithContext("text-xl", typographyContext)).toBe(".text-xl { font-size: 1.25rem; }");
      expect(compileRuntimeClassNameWithContext("text-blue-500", typographyContext)).toBe(".text-blue-500 { color: #3b82f6; }");
      expect(compileRuntimeClassNameWithContext("leading-relaxed", typographyContext)).toBe(".leading-relaxed { line-height: 1.75; }");
      expect(compileRuntimeClassNameWithContext("tracking-tight", typographyContext)).toBe(".tracking-tight { letter-spacing: -0.05em; }");
      expect(compileRuntimeClassNameWithContext("decoration-double", typographyContext)).toBe(".decoration-double { text-decoration-style: double; }");
      expect(compileRuntimeClassNameWithContext("decoration-4", typographyContext)).toBe(".decoration-4 { text-decoration-thickness: 4px; }");
      expect(compileRuntimeClassNameWithContext("underline-offset-4", typographyContext)).toBe(".underline-offset-4 { text-underline-offset: 4px; }");
      expect(compileRuntimeClassNameWithContext("indent-4", typographyContext)).toBe(".indent-4 { text-indent: 1rem; }");
      expect(compileRuntimeClassNameWithContext("list-inside", typographyContext)).toBe(".list-inside { list-style-position: inside; }");
      expect(compileRuntimeClassNameWithContext("list-style-image-none", typographyContext)).toBe(".list-style-image-none { list-style-image: none; }");
      expect(compileRuntimeClassNameWithContext("line-clamp-3", typographyContext)).toBe(".line-clamp-3 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }");
      expect(compileRuntimeClassNameWithContext("line-clamp-none", typographyContext)).toBe(".line-clamp-none { overflow: visible; display: block; -webkit-box-orient: horizontal; -webkit-line-clamp: unset; }");
      expect(compileRuntimeClassNameWithContext("font-bold", typographyContext)).toBe(".font-bold { font-weight: 700; }");
      expect(compileRuntimeClassNameWithContext("font-sans", typographyContext)).toBe(".font-sans { font-family: ui-sans-serif, system-ui; }");
      expect(compileRuntimeClassNameWithContext("text-wrap", typographyContext)).toBe(".text-wrap { text-wrap: wrap; }");
      expect(compileRuntimeClassNameWithContext("text-balance", typographyContext)).toBe(".text-balance { text-wrap: balance; }");
    });
  });

  describe("transform utilities", () => {
    const context = resolveRuntimeContext();

    it("supports core transform utilities", () => {
      expect(compileRuntimeClassNameWithContext("transform", context)).toBe(".transform { --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }");
      expect(compileRuntimeClassNameWithContext("transform-none", context)).toBe(".transform-none { transform: none; }");
      expect(compileRuntimeClassNameWithContext("transform-gpu", context)).toContain("transform: translate3d(var(--tw-translate-x,0), var(--tw-translate-y,0), 0)");
    });

    it("supports rotate, scale, skew, and origin utilities", () => {
      expect(compileRuntimeClassNameWithContext("rotate-45", context)).toBe(".rotate-45 { --tw-rotate: 45deg; transform: rotate(45deg); }");
      expect(compileRuntimeClassNameWithContext("-rotate-45", context)).toBe(".-rotate-45 { --tw-rotate: -45deg; transform: rotate(-45deg); }");
      expect(compileRuntimeClassNameWithContext("rotate-x-180", context)).toBe(".rotate-x-180 { rotate: X(180deg); }");
      expect(compileRuntimeClassNameWithContext("scale-100", context)).toBe(".scale-100 { --tw-scale-x: 1; --tw-scale-y: 1; transform: scale(1); }");
      expect(compileRuntimeClassNameWithContext("scale-x-50", context)).toBe(".scale-x-50 { --tw-scale-x: .5; transform: scaleX(.5); }");
      expect(compileRuntimeClassNameWithContext("scale-y-125", context)).toBe(".scale-y-125 { --tw-scale-y: 1.25; transform: scaleY(1.25); }");
      expect(compileRuntimeClassNameWithContext("scale-z-150", context)).toBe(".scale-z-150 { --tw-scale-z: 1.5; scale: var(--tw-scale-x, 1) var(--tw-scale-y, 1) 1.5; }");
      expect(compileRuntimeClassNameWithContext("skew-x-6", context)).toBe(".skew-x-6 { --tw-skew-x: 6deg; transform: skewX(6deg); }");
      expect(compileRuntimeClassNameWithContext("skew-y-6", context)).toBe(".skew-y-6 { --tw-skew-y: 6deg; transform: skewY(6deg); }");
      expect(compileRuntimeClassNameWithContext("origin-bottom-right", context)).toBe(".origin-bottom-right { transform-origin: bottom right; }");
    });

    it("supports perspective utilities", () => {
      expect(compileRuntimeClassNameWithContext("perspective-none", context)).toBe(".perspective-none { perspective: none; }");
      expect(compileRuntimeClassNameWithContext("perspective-dramatic", context)).toBe(".perspective-dramatic { perspective: 100px; }");
      expect(compileRuntimeClassNameWithContext("perspective-origin-top", context)).toBe(".perspective-origin-top { perspective-origin: top; }");
    });

    it("supports translate utilities", () => {
      expect(compileRuntimeClassNameWithContext("translate-x-4", context)).toBe(".translate-x-4 { --tw-translate-x: 1rem; transform: translateX(1rem); }");
      expect(compileRuntimeClassNameWithContext("translate-y-4", context)).toBe(".translate-y-4 { --tw-translate-y: 1rem; transform: translateY(1rem); }");
      expect(compileRuntimeClassNameWithContext("translate-z-4", context)).toBe(".translate-z-4 { --tw-translate-z: 1rem; transform: translateZ(1rem); }");
    });

    it("supports zoom utilities", () => {
      expect(compileRuntimeClassNameWithContext("zoom-125", context)).toBe(".zoom-125 { zoom: 1.25; }");
      expect(compileRuntimeClassNameWithContext("zoom-150", context)).toBe(".zoom-150 { zoom: 1.5; }");
    });
  });

  describe("interactivity utilities", () => {
    const context = resolveRuntimeContext();

    it("supports appearance, cursor, and pointer events", () => {
      expect(compileRuntimeClassNameWithContext("appearance-none", context)).toBe(".appearance-none { appearance: none; }");
      expect(compileRuntimeClassNameWithContext("cursor-pointer", context)).toBe(".cursor-pointer { cursor: pointer; }");
      expect(compileRuntimeClassNameWithContext("pointer-events-none", context)).toBe(".pointer-events-none { pointer-events: none; }");
    });

    it("supports resize and user-select utilities", () => {
      expect(compileRuntimeClassNameWithContext("resize-none", context)).toBe(".resize-none { resize: none; }");
      expect(compileRuntimeClassNameWithContext("user-select-none", context)).toBe(".user-select-none { user-select: none; }");
    });

    it("supports touch-action and will-change", () => {
      expect(compileRuntimeClassNameWithContext("touch-auto", context)).toBe(".touch-auto { touch-action: auto; }");
      expect(compileRuntimeClassNameWithContext("will-change-transform", context)).toBe(".will-change-transform { will-change: transform; }");
    });

    it("supports color and caret/accent utilities", () => {
      expect(compileRuntimeClassNameWithContext("color-scheme-dark", context)).toBe(".color-scheme-dark { color-scheme: dark; }");
      expect(compileRuntimeClassNameWithContext("accent-blue-500", context)).toContain("accent-color:");
      expect(compileRuntimeClassNameWithContext("caret-red-500", context)).toContain("caret-color:");
    });

    it("supports typography utilities", () => {
      expect(compileRuntimeClassNameWithContext("font-stretch-condensed", context)).toBe(".font-stretch-condensed { font-stretch: condensed; }");
      expect(compileRuntimeClassNameWithContext("font-variant-numeric-lining-nums", context)).toBe(".font-variant-numeric-lining-nums { font-variant-numeric: lining-nums; }");
      expect(compileRuntimeClassNameWithContext("list-style-image-none", context)).toBe(".list-style-image-none { list-style-image: none; }");
      expect(compileRuntimeClassNameWithContext("hyphens-auto", context)).toBe(".hyphens-auto { hyphens: auto; }");
    });
  });

  describe("animation utilities", () => {
    const context = resolveRuntimeContext();

    it("supports animation utilities", () => {
      expect(compileRuntimeClassNameWithContext("animate-none", context)).toBe(".animate-none { animation: none; }");
      expect(compileRuntimeClassNameWithContext("animate-spin", context)).toBe(".animate-spin { animation: spin 1s linear infinite; }");
      expect(compileRuntimeClassNameWithContext("animate-ping", context)).toBe(".animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }");
    });
  });
});
