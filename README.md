# windrunner

Zero-config Tailwind v4 runtime for the browser. Compile utility classes on-demand — no build step, no PostCSS, no config file.

Drop a `<script>` tag and start using Tailwind classes anywhere.

## How it works

Instead of generating a full CSS bundle upfront, `windrunner` scans the DOM for class names and compiles only the CSS rules actually used — then injects them into a `<style>` tag in `<head>`. A `MutationObserver` watches for DOM changes and compiles new classes as they appear.

```
Page loads → scan DOM → compile used classes → inject <style>
                ↑                                      |
    MutationObserver detects new classes ←─────────────┘
```

## Install

```bash
npm install windrunner
```

## Usage

### Drop-in script (zero config)

```html
<script type="module">
  import { windrunner } from "windrunner";
  windrunner({ autoStart: true });
</script>

<div class="flex items-center gap-4 p-6 bg-blue-50 rounded-xl">
  <h1 class="text-2xl font-bold text-slate-900">Hello</h1>
  <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
    Click me
  </button>
</div>
```

### CDN

```html
<script type="module">
  import { windrunner } from "https://cdn.jsdelivr.net/npm/windrunner@1.0.0/dist/index.min.js";
  windrunner({ autoStart: true });
</script>
```

### Live demo / Example landing page

Try the example landing page:

- GitHub Pages (example landing): https://bigetion.github.io/windrunner/


### React / Vue

```js
import { useEffect } from "react";
import { windrunner } from "windrunner";

export default function App() {
  useEffect(() => {
    const wind = windrunner({ id: "my-app", autoStart: true });
    return () => wind.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900">React + Windrunner</h1>
    </main>
  );
}
```

### Manual control

```js
import { createWindrunner, compileClass } from "windrunner";

// Compile a single class to a CSS rule string
const css = compileClass("md:hover:bg-blue-500");
// → '@media (min-width: 768px) { .md\\:hover\\:bg-blue-500:hover { background-color: oklch(...); } }'

// Create an instance with full control
const wind = createWindrunner({ id: "my-app" });
wind.processClassList("flex items-center justify-between gap-4");
wind.scan(); // scan entire document
wind.observe(); // start watching DOM mutations
wind.disconnect(); // stop watching
```

## API

### `windrunner(options?)`

Auto-start mode. Scans DOM and begins observing immediately.

```ts
windrunner({
  id?: string,            // style tag id, default: "tailwind-runtime-css"
  autoStart?: boolean,    // default: true
  theme?: {               // override/extend theme values
    extend: {
      colors: { brand: "#ff6b6b" }
    }
  }
})
```

### `createWindrunner(options?)`

Returns a runtime instance with manual control methods:

| Method | Description |
|---|---|
| `start()` | Scan DOM + start observer (waits for DOMContentLoaded) |
| `scan(root?)` | One-time scan of all `[class]` elements |
| `observe(root?)` | Start MutationObserver |
| `processClassName(cls)` | Compile + inject one class |
| `processClassList(str)` | Compile + inject space-separated classes |
| `processElement(el)` | Compile all classes on a DOM element |
| `flush()` | Force-flush pending element queue |
| `disconnect()` | Stop observer, cleanup |
| `getCacheSize()` | Number of compiled classes in cache |
| `getInsertedRuleCount()` | Number of CSS rules injected |

### `compileClass(className, options?)`

Compile a single class name to a CSS rule string. Works in Node.js too.

```js
compileClass("hover:text-blue-500")
// → '.hover\\:text-blue-500:hover { color: oklch(0.623 0.214 259.8); }'
```

### `parseClass(className, screens?, containers?)`

Parse a class name into its parts:

```js
parseClass("md:hover:mt-4", { md: "768px" })
// → { original: "md:hover:mt-4", baseToken: "mt-4", variants: ["hover"],
//     breakpoint: "md", containerBreakpoint: null, important: false, starting: false }
```

## Supported utilities

Full Tailwind v4 coverage including:

- **Layout** — display, position, overflow, z-index, visibility, float, clear, aspect-ratio, columns, isolation, object-fit/position
- **Spacing** — margin, padding, gap, space (with negative values)
- **Sizing** — width, height, min/max-w/h, size-*
- **Flexbox** — flex, grow, shrink, basis, direction, wrap, align, justify, place
- **Grid** — grid-cols/rows, col/row-span, grid-flow, auto-cols/rows, place-*
- **Typography** — font-size, font-weight, line-height, letter-spacing, text-align, text-color, text-decoration, text-transform, text-overflow, whitespace, word-break, list-style
- **Colors** — all OKLCH P3 Tailwind v4 palette + mauve/olive/mist/taupe, opacity modifier (`bg-blue-500/50`)
- **Backgrounds** — bg-color, bg-linear-to-* (v4), gradient stops (from/via/to), bg-size/position/repeat/attachment/clip/origin
- **Borders** — border-width/style/color/radius (all sides + logical)
- **Effects** — shadow, opacity, inset-shadow-* (v4), ring, inset-ring-* (v4)
- **Transforms** — rotate, scale, translate (2D + 3D), skew, origin, perspective, backface, transform-style
- **Filters** — blur, brightness, contrast, grayscale, hue-rotate, invert, saturate, sepia, drop-shadow, all backdrop-* variants
- **Transitions** — transition, duration, delay, ease
- **Animations** — animate-spin/ping/pulse/bounce
- **Interactivity** — cursor, select, resize, outline, pointer-events, appearance, touch-action, scroll-behavior, scroll-margin/padding, will-change
- **v4 New** — field-sizing-*, mask-*, @container, @container breakpoints (@sm: @md: etc.)
- **Variants** — hover, focus, focus-visible, active, visited, disabled, dark, group-hover/focus, peer-*, not-hover/focus/disabled, in-hover, starting: (@starting-style), first/last/odd/even, before/after, placeholder

## Custom theme

```js
windrunner({
  autoStart: true,
  theme: {
    extend: {
      colors: {
        brand: {
          50: "oklch(0.97 0.01 200)",
          500: "oklch(0.55 0.18 200)",
          900: "oklch(0.25 0.10 200)",
        }
      },
      spacing: {
        18: "4.5rem",
        128: "32rem",
      }
    }
  }
});
```

## Preventing FOUC

Because windrunner compiles CSS at runtime, browsers may briefly render unstyled content before styles are injected (Flash of Unstyled Content). The recommended fix:

```html
<head>
  <!-- 1. Hide the page before styles are ready -->
  <style>html { opacity: 0; transition: opacity 0.2s ease; }</style>

  <!-- 2. Reveal after windrunner finishes its first scan -->
  <script type="module">
    import { windrunner } from "windrunner";
    windrunner({
      autoStart: true,
      onReady: () => document.documentElement.style.opacity = "1",
    });
  </script>
</head>
```

The `onReady` callback fires after the initial DOM scan completes and CSS rules are injected, ensuring the page is fully styled before it becomes visible. The `transition` gives a smooth 200ms fade-in instead of an abrupt pop.

## Preflight

windrunner injects a CSS reset (based on Tailwind's preflight) automatically. To opt out:

```js
windrunner({ autoStart: true, preflight: false });
```

## vs Tailwind Play CDN

| | windrunner | Tailwind Play CDN |
|---|---|---|
| Size | ~78 KB min | ~350 KB |
| Dependencies | 0 | 0 |
| Tailwind version | v4 | v4 |
| Works in Node.js | ✓ (compile only) | ✗ |
| Custom theme | ✓ | ✓ |
| Arbitrary values | ✓ | ✓ |
| Preflight | ✓ | ✓ |
| FOUC prevention | ✓ (onReady) | ✗ |
| Plugins | ✗ | ✓ |
| Full utility coverage | ✓ | ✓ |

## License

ISC
