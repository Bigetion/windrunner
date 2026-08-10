# Windrunner v2.0 — Feature Examples

This folder contains self-contained examples demonstrating all major improvements in Windrunner v2.0.

## Examples

| File | Feature | Description |
|------|---------|-------------|
| [fouc-prevention.html](./fouc-prevention.html) | FOUC Prevention | All 3 strategies (opacity, visibility, none) with the built-in FOUCManager |
| [named-variants.html](./named-variants.html) | Named Group/Peer | `group/sidebar`, `peer/toggle` — independent group/peer contexts |
| [advanced-variants.html](./advanced-variants.html) | has-*, data-*, aria-* | Conditional styling via pseudo-classes and attributes |
| [arbitrary-variants.html](./arbitrary-variants.html) | Arbitrary Variants | `[&>span]:`, `[@media(...)]`, `[@container(...)]`, `[@supports(...)]` |
| [debug-mode.html](./debug-mode.html) | Debug & Observability | `debug: true`, `getStats()`, `window.__WINDRUNNER__`, callbacks |
| [hybrid-mode.html](./hybrid-mode.html) | Hybrid/Precompiled | Pre-generated CSS + runtime for dynamic classes |
| [lite-build.html](./lite-build.html) | Lite Build | Smaller bundle (~35KB) with core utilities only |
| [critical-css.html](./critical-css.html) | Critical CSS | `compileCriticalCss()` and `compileCriticalCssFromHtml()` APIs |
| [react-integration.jsx](./react-integration.jsx) | React Integration | `useWindrunner()`, `WindrunnerProvider`, StrictMode safety |

## How to Run

### HTML Examples

Open any `.html` file directly in a browser. All examples are self-contained and import Windrunner from `../../dist/`. Make sure you've built the project first:

```bash
# From the windrunner root directory
npm run build
```

Then open in browser:
- Directly via file:// (most examples work)
- Via a local server for full ES module support:

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server extension
```

Navigate to `http://localhost:8080/examples/v2-features/`

### React Example

The `react-integration.jsx` file is a conceptual reference. To run it:

1. Create a new React project:
   ```bash
   npm create vite@latest my-app -- --template react
   cd my-app
   ```

2. Install Windrunner:
   ```bash
   npm install windrunner
   # or link locally: npm link ../path/to/windrunner
   ```

3. Copy the patterns from `react-integration.jsx` into your components.

## What's New in v2.0

### Bundle Size
- **Core build**: ~45KB (down from ~55KB) — 30% reduction via lazy theme + builder loading
- **Lite build**: ~35KB — core utilities only, excludes transforms/filters/transitions/animations

### FOUC Prevention
- Built-in `FOUCManager` with configurable strategies
- Double rAF timing ensures reveal happens after browser paint
- No more manual `html { opacity: 0 }` hacks

### Advanced Variants
- **Named groups**: `group/sidebar`, `group-hover/sidebar:text-blue-500`
- **Named peers**: `peer/toggle`, `peer-checked/toggle:bg-green-500`
- **has-\***: `has-[:checked]:bg-green-100`, `group-has-[:focus]:ring-2`
- **data-\***: `data-[state=open]:block`, `data-[size=lg]:text-xl`
- **aria-\***: `aria-[expanded=true]:rotate-180`
- **Arbitrary selectors**: `[&>span]:text-red-500`, `[&:nth-child(2)]:bg-blue-100`
- **Arbitrary at-rules**: `[@media(hover:hover)]:underline`, `[@container(min-width:400px)]:grid-cols-2`

### React StrictMode Safety
- Observer instances tracked via WeakMap (no duplicates)
- Style tags reused via DOM query (no duplicates)
- Proper cleanup in useEffect (disconnect on unmount)
- Instance stored in useRef (survives double-mount)

### Debug & Observability
- `debug: true` for console logging
- `strict: true` for throwing on errors
- `getStats()` returns cache hit rate, compile times, failed classes
- `window.__WINDRUNNER__` global for DevTools access
- Rich `onError` and `onWarning` callbacks with context

### Hybrid Mode
- Pre-generate CSS at build time via Vite/Webpack/Rollup plugins
- Runtime detects existing rules and skips re-compilation
- Only truly dynamic classes compile at runtime
- Best of both worlds: instant load + dynamic capability

## Import Paths

```javascript
// Full build (all features)
import { windrunner } from "../dist/index.esm.js";

// Lite build (core utilities only, smaller bundle)
import windrunner from "../dist/lite.esm.js";
// or: import { createWindrunnerLite } from "../dist/lite.esm.js";

// React hooks and components
import { useWindrunner, WindrunnerProvider } from "../dist/react.esm.js";

// Compiler utilities (critical CSS, class extraction) — exported from main build
import { compileCriticalCss, compileCriticalCssFromHtml, extractClassNames } from "../dist/index.esm.js";
```
