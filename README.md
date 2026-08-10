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

<div class="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
  <h1 class="text-2xl font-bold text-white">Hello Windrunner</h1>
  <button class="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
    Click me
  </button>
</div>
```

### CDN

```html
<script type="module">
  import { windrunner } from "https://cdn.jsdelivr.net/npm/windrunner@latest/dist/index.min.js";
  windrunner({ autoStart: true });
</script>
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
wind.getStats(); // { cacheSize, hitRate, compileTimes, failedClasses }
```

---

## What's New in v2.0

### FOUC Manager

Built-in flash-of-unstyled-content prevention. No more manual `html { opacity: 0 }` hacks.

```js
windrunner({
  autoStart: true,
  fouc: { strategy: "opacity" } // or "visibility" | "none"
});
```

Three strategies: `opacity` (smooth fade-in), `visibility` (instant reveal), `none` (disabled). The FOUCManager uses double-rAF timing to reveal after the browser paints.

### Advanced Variants

Named groups, peers, and attribute-driven selectors:

```html
<!-- Named groups/peers -->
<div class="group/sidebar">
  <span class="group-hover/sidebar:text-blue-500">Sidebar link</span>
</div>

<input class="peer/toggle" type="checkbox" />
<div class="peer-checked/toggle:bg-green-500">Active</div>

<!-- has-*, data-*, aria-* -->
<div class="has-[:checked]:bg-green-100">
<div class="data-[state=open]:block">
<button class="aria-[expanded=true]:rotate-180">

<!-- Arbitrary selectors -->
<div class="[&>span]:text-red-500 [&:nth-child(2)]:bg-blue-100">
<div class="[@media(hover:hover)]:underline">
<div class="[@container(min-width:400px)]:grid-cols-2">
```

### Debug Mode & Observability

```js
const wind = windrunner({
  autoStart: true,
  debug: true,   // console logging
  strict: true,  // throw on errors
  onWarning: (msg, ctx) => console.warn(msg, ctx),
  onError: (err, ctx) => reportToSentry(err),
});

wind.getStats();
// → { cacheSize: 142, hitRate: 0.87, compileTimes: [...], failedClasses: [] }

// DevTools global
window.__WINDRUNNER__; // access instance, stats, cache
```

### React StrictMode Safety

```jsx
import { useWindrunner, WindrunnerProvider } from "windrunner/react";

// Hook — safe in StrictMode (no duplicate observers/style tags)
function App() {
  const { stats } = useWindrunner({ debug: true });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900">React + Windrunner</h1>
      <p className="text-sm text-slate-500">{stats.cacheSize} classes compiled</p>
    </main>
  );
}

// Or wrap with Provider for shared config
function Root() {
  return (
    <WindrunnerProvider config={{ debug: true, fouc: { strategy: "opacity" } }}>
      <App />
    </WindrunnerProvider>
  );
}
```

### Lite Build

Smaller bundle (~82KB) with core utilities only — excludes transforms, filters, transitions, and animations.

```html
<script type="module">
  import windrunner from "windrunner/lite";
  windrunner({ autoStart: true });
</script>
```

Use this when you only need layout, spacing, typography, and colors.

### Hybrid Mode

Pre-generate CSS at build time via plugins, then use the runtime only for dynamic classes.

```js
// vite.config.js
import { windrunnerVite } from "windrunner/build-plugins/vite";

export default {
  plugins: [
    windrunnerVite({
      include: ["./src/**/*.{html,jsx,tsx}"],
      output: "./dist/windrunner.css",
    })
  ]
};
```

At runtime, Windrunner detects existing pre-compiled rules and skips re-compilation — only truly dynamic classes compile on-the-fly.

Also available for [Webpack](./build-plugins/webpack.js) and [Rollup](./build-plugins/rollup.js).

### Critical CSS API

Extract and compile only the CSS needed for initial render:

```js
import { compileCriticalCss, compileCriticalCssFromHtml, compileCriticalCssFromFiles } from "windrunner";

// From class list
const css = compileCriticalCss(["flex", "items-center", "bg-blue-500"]);

// From HTML string
const css = compileCriticalCssFromHtml(`<div class="flex items-center bg-blue-500">Hello</div>`);

// From files (Node.js)
const css = await compileCriticalCssFromFiles(["./dist/index.html", "./dist/app.html"]);
```

### Performance

- **LRU cache** with adaptive sizing based on usage patterns
- **Microtask batching** — DOM mutations are coalesced before compilation
- **Lazy loading** — theme and builder modules load on first use, not at import

### Enhanced Error Handling

```js
windrunner({
  strict: true, // throws on invalid classes
  onWarning: (message, context) => {
    // context: { className, rule, source }
  },
  onError: (error, context) => {
    // ErrorContext with full stack trace and class info
  }
});
```

---

## API

### `windrunner(options?)`

Auto-start mode. Scans DOM and begins observing immediately.

```ts
windrunner({
  id?: string,            // style tag id, default: "tailwind-runtime-css"
  autoStart?: boolean,    // default: true
  preflight?: boolean,    // include CSS reset/preflight, default: true
  debug?: boolean,        // enable console logging
  strict?: boolean,       // throw on invalid classes
  fouc?: {                // FOUC prevention
    strategy: "opacity" | "visibility" | "none"
  },
  plugins?: Plugin[],     // custom plugins
  onReady?: () => void,   // fires after first scan
  onWarning?: (msg, ctx) => void,
  onError?: (err, ctx) => void,
  observerOptions?: {     // MutationObserver tuning
    childList?: boolean,
    subtree?: boolean,
    attributes?: boolean,
    attributeFilter?: string[],
  },
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
| `getStats()` | Full stats: cache size, hit rate, compile times, failed classes |

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

### `compileCriticalCssFromHtml(html, options?)`

Compile critical CSS from a raw HTML string.

### `compileCriticalCssFromFiles(filePaths, options?)`

Compile critical CSS from file paths (Node.js).

### Plugin System

Create custom utilities and variants:

```js
import { windrunner, plugin } from 'windrunner';

const myPlugin = plugin(({ addUtility, addVariant, theme }) => {
  addUtility('glass', 'backdrop-filter: blur(10px); background: rgba(255,255,255,0.1);');
  addUtility(/^text-stroke-(\d+)$/, (match) => `-webkit-text-stroke-width: ${match[1]}px;`);
  addVariant('parent-hover', (selector) => `.parent:hover ${selector}`);
});

windrunner({ autoStart: true, plugins: [myPlugin] });
```

See [Plugin Examples](./examples/plugins/) and [Plugin Guide](./docs/guides/plugins.md).

---

## Supported utilities

Full Tailwind v4 coverage including:

- **Layout** — display, position, overflow, z-index, visibility, float, clear, aspect-ratio, columns, isolation, object-fit/position
- **Spacing** — margin, padding, gap, space (with negative values)
- **Sizing** — width, height, min/max-w/h, size-*
- **Flexbox** — flex, grow, shrink, basis, direction, wrap, align, justify, place
- **Grid** — grid-cols/rows, col/row-span, grid-flow, auto-cols/rows, place-*
- **Typography** — font-size, font-weight, line-height, letter-spacing, text-align, text-color, text-decoration, text-transform, text-overflow, whitespace, word-break, list-style
- **Colors** — all OKLCH P3 Tailwind v4 palette + mauve/olive/mist/taupe, opacity modifier (`bg-blue-500/50`)
- **Backgrounds** — bg-color, bg-gradient-to-* with gradient stops (from/via/to), bg-size/position/repeat/attachment/clip/origin
- **Borders** — border-width/style/color/radius (all sides + logical)
- **Effects** — shadow, opacity, inset-shadow-* (v4), ring, inset-ring-* (v4)
- **Transforms** — rotate, scale, translate (2D + 3D), skew, origin, perspective, backface, transform-style
- **Filters** — blur, brightness, contrast, grayscale, hue-rotate, invert, saturate, sepia, drop-shadow, all backdrop-* variants
- **Transitions** — transition, duration, delay, ease
- **Animations** — animate-spin/ping/pulse/bounce
- **Interactivity** — cursor, select, resize, outline, pointer-events, appearance, touch-action, scroll-behavior, scroll-margin/padding, will-change
- **v4 New** — field-sizing-*, mask-*, @container, @container breakpoints (@sm: @md: etc.)
- **Variants** — hover, focus, focus-visible, active, visited, disabled, dark, group-hover/focus, peer-*, not-hover/focus/disabled, in-hover, starting: (@starting-style), first/last/odd/even, before/after, placeholder
- **v2.0 New** — named group/peer (`group/name`, `peer/name`), has-*, data-*, aria-*, arbitrary selectors (`[&>span]:`, `[&:nth-child(2)]:`), arbitrary at-rules (`[@media(...)]`, `[@container(...)]`, `[@supports(...)]`)

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

## vs Tailwind Play CDN

| | windrunner | Tailwind Play CDN |
|---|---|---|
| Size | ~101KB core / ~82KB lite | ~350 KB |
| Dependencies | 0 | 0 |
| Tailwind version | v4 | v4 |
| Works in Node.js | ✓ (compile only) | ✗ |
| Custom theme | ✓ | ✓ |
| Arbitrary values | ✓ | ✓ |
| Preflight | ✓ | ✓ |
| FOUC prevention | ✓ (built-in manager) | ✗ |
| Plugins | ✓ | ✓ |
| Debug / Observability | ✓ | ✗ |
| Hybrid build mode | ✓ | ✗ |
| React StrictMode safe | ✓ | ✗ |
| Full utility coverage | ✓ | ✓ |

## Documentation

- **[Quick Start Guide](./docs/getting-started/quick-start.md)** — Get running in 5 minutes
- **[React Integration](./docs/frameworks/react.md)** — useWindrunner hook, Provider, StrictMode safety
- **[FOUC Prevention](./docs/guides/fouc-prevention.md)** — Built-in strategies and customization
- **[Performance Guide](./docs/guides/performance.md)** — LRU cache, batching, lazy loading
- **[Plugin System](./docs/guides/plugins.md)** — Custom utilities and variants
- **[Full Documentation](./docs/)** — Complete guides, API reference, and recipes

### Example Projects

- **[Landing Page](./examples/landing.html)** — Modern marketing page with animations
- **[Todo App](./examples/todo-app/)** — React app with dark mode
- **[Coverage Demo](./examples/coverage/)** — Utility class coverage showcase
- **[v2.0 Feature Examples](./examples/v2-features/)** — FOUC, variants, debug, hybrid, lite, critical CSS, React

## When to Use Windrunner

**Perfect for:**
- Rapid prototyping and MVPs
- Landing pages and marketing sites
- Internal tools and dashboards
- No-code platforms (Webflow, WordPress, etc.)
- Projects without build tooling
- Learning Tailwind v4

**Consider traditional Tailwind for:**
- Large production apps with strict performance budgets
- SEO-critical pages (use hybrid mode to mitigate)
- Enterprise applications requiring battle-tested solutions

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Found a bug? Have a feature request? [Open an issue](https://github.com/Bigetion/windrunner/issues/new).

## License

ISC
