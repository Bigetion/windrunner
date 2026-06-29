# Plugin System Guide

Learn how to extend Windrunner with custom utilities and variants.

## Table of Contents

- [Quick Start](#quick-start)
- [Plugin API](#plugin-api)
- [Creating Utilities](#creating-utilities)
- [Creating Variants](#creating-variants)
- [Accessing Theme](#accessing-theme)
- [Pattern Matching](#pattern-matching)
- [Best Practices](#best-practices)
- [Example Plugins](#example-plugins)

## Quick Start

```javascript
import { windrunner, plugin } from 'windrunner';

// 1. Create a plugin
const myPlugin = plugin(({ addUtility, addVariant, theme }) => {
  // Add a simple utility
  addUtility('glass', `
    backdrop-filter: blur(10px);
    background: rgba(255,255,255,0.1);
  `);
  
  // Add a custom variant
  addVariant('parent-hover', (selector) => {
    return `.parent:hover ${selector}`;
  });
});

// 2. Use the plugin
windrunner({
  autoStart: true,
  plugins: [myPlugin]
});
```

```html
<!-- 3. Use your custom utilities -->
<div class="glass p-8 rounded-xl">
  Glass effect!
</div>

<div class="parent">
  <button class="parent-hover:bg-blue-600">
    Hover parent to style me
  </button>
</div>
```

## Plugin API

### `plugin(handler)`

Create a plugin definition.

```typescript
function plugin(
  handler: (api: PluginAPI) => void
): Plugin
```

**Parameters:**
- `handler` - Function that receives plugin API

**Returns:** Plugin object to pass to `windrunner({ plugins: [...] })`

### Plugin API Object

Your handler receives an object with these methods:

```typescript
interface PluginAPI {
  addUtility(pattern: string | RegExp, handler: string | Function): void;
  addUtilities(utilities: Record<string, string>): void;
  addVariant(name: string, handler: (selector: string) => string): void;
  addVariants(variants: Record<string, Function>): void;
  theme(key?: string): any;
  config(): any;
}
```

## Creating Utilities

### Static Utilities

Simplest form - class name maps to CSS:

```javascript
const myPlugin = plugin(({ addUtility }) => {
  addUtility('center-abs', `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `);
});
```

Usage: `<div class="center-abs">Centered</div>`

### Multiple Utilities at Once

```javascript
const myPlugin = plugin(({ addUtilities }) => {
  addUtilities({
    'glass': 'backdrop-filter: blur(10px); background: rgba(255,255,255,0.1);',
    'glass-dark': 'backdrop-filter: blur(10px); background: rgba(0,0,0,0.3);',
    'frosted': 'backdrop-filter: blur(20px); background: rgba(255,255,255,0.2);',
  });
});
```

### Using Helper Functions

```javascript
import { plugin, defineUtilities } from 'windrunner';

const myPlugin = plugin(({ addUtilities }) => {
  addUtilities(defineUtilities({
    // String format
    'glass': 'backdrop-filter: blur(10px);',
    
    // Object format (converted automatically)
    'bordered': {
      border: '1px solid black',
      borderRadius: '0.5rem',
      padding: '1rem'
    }
  }));
});
```

## Creating Variants

Variants modify how selectors are applied:

```javascript
const customVariants = plugin(({ addVariant, addVariants }) => {
  // Single variant
  addVariant('parent-hover', (selector) => {
    return `.parent:hover ${selector}`;
  });
  
  // Multiple variants
  addVariants({
    // Sibling state
    'sibling-hover': (selector) => `.sibling:hover ~ ${selector}`,
    
    // Data attributes
    'loading': (selector) => `${selector}[data-loading="true"]`,
    'error': (selector) => `${selector}[data-error="true"]`,
    
    // ARIA states
    'expanded': (selector) => `${selector}[aria-expanded="true"]`,
    
    // Media queries
    'print': (selector) => `@media print { ${selector} }`,
  });
});
```

Usage:
```html
<div class="parent-hover:scale-105">Grows when parent hovered</div>
<div data-loading="true" class="loading:opacity-50">Loading...</div>
<button aria-expanded="false" class="expanded:rotate-180">Toggle</button>
```

## Accessing Theme

Access theme values in your plugins:

```javascript
const themedPlugin = plugin(({ addUtility, theme }) => {
  // Get specific theme section
  const colors = theme('colors');
  const spacing = theme('spacing');
  
  // Get nested value with dot notation
  const blueShades = theme('colors.blue');
  
  // Get entire theme
  const allTheme = theme();
  
  // Use theme values
  Object.entries(colors).forEach(([name, value]) => {
    if (typeof value === 'string') {
      addUtility(`bg-${name}-custom`, `background: ${value};`);
    }
  });
});
```

## Pattern Matching

Create dynamic utilities with RegExp:

```javascript
const dynamicPlugin = plugin(({ addUtility }) => {
  // Match: text-stroke-1, text-stroke-2, etc.
  addUtility(/^text-stroke-(\d+)$/, (match, theme) => {
    const width = match[1]; // Captured group
    return `-webkit-text-stroke-width: ${width}px;`;
  });
  
  // Match: delay-100, delay-200, etc.
  addUtility(/^delay-(\d+)$/, (match) => {
    return `transition-delay: ${match[1]}ms;`;
  });
  
  // Match with theme access
  addUtility(/^custom-p-(.+)$/, (match, theme) => {
    const spacing = theme('spacing');
    const key = match[1];
    return spacing[key] ? `padding: ${spacing[key]};` : null;
  });
});
```

Usage:
```html
<h1 class="text-stroke-3">Outlined text</h1>
<div class="delay-300">Delayed transition</div>
<div class="custom-p-4">Uses theme spacing</div>
```

## Best Practices

### 1. Error Handling

Wrap complex logic to avoid breaking compilation:

```javascript
const safePlugin = plugin(({ addUtility, theme }) => {
  try {
    const colors = theme('colors');
    // ... generate utilities
  } catch (error) {
    console.warn('[MyPlugin] Failed to initialize:', error);
  }
});
```

### 2. Performance

Keep utility generation lightweight:

```javascript
// ❌ BAD: Heavy computation
addUtility(/^heavy-(.+)$/, (match) => {
  return heavyComputation(match[1]); // Runs for EVERY class check
});

// ✅ GOOD: Pre-compute when possible
const precomputed = preComputeValues();
addUtility(/^fast-(.+)$/, (match) => {
  return precomputed[match[1]]; // Fast lookup
});
```

### 3. Naming Conventions

Use clear, descriptive names:

```javascript
// ✅ GOOD
addUtility('text-outline-2', '...');
addVariant('parent-hover', ...);

// ❌ BAD
addUtility('to2', '...');
addVariant('ph', ...);
```

### 4. Theme Consistency

Use theme values when possible:

```javascript
const consistentPlugin = plugin(({ addUtility, theme }) => {
  const colors = theme('colors');
  const spacing = theme('spacing');
  
  // ✅ Uses theme
  addUtility('brand-bg', `background: ${colors.brand};`);
  
  // ❌ Hardcoded
  addUtility('brand-bg', 'background: #ff0000;');
});
```

## Example Plugins

### Text Stroke Plugin

```javascript
import { plugin } from 'windrunner';

export const textStrokePlugin = plugin(({ addUtility, addUtilities, theme }) => {
  // Width utilities
  const borderWidths = theme('borderWidth') || { 1: '1px', 2: '2px', 4: '4px' };
  Object.entries(borderWidths).forEach(([key, value]) => {
    const className = key === 'DEFAULT' ? 'text-stroke' : `text-stroke-${key}`;
    addUtility(className, `-webkit-text-stroke-width: ${value};`);
  });

  // Color utilities
  const colors = theme('colors') || {};
  const colorUtilities = {};
  
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'string') {
      colorUtilities[`text-stroke-${colorName}`] = 
        `-webkit-text-stroke-color: ${colorValue};`;
    } else if (typeof colorValue === 'object') {
      Object.entries(colorValue).forEach(([shade, value]) => {
        colorUtilities[`text-stroke-${colorName}-${shade}`] =
          `-webkit-text-stroke-color: ${value};`;
      });
    }
  });
  
  addUtilities(colorUtilities);
});
```

**See more examples:** [Plugin Examples](../../examples/plugins/)

## Testing Your Plugin

```javascript
import { compileClass } from 'windrunner';

// Test your plugin
const myPlugin = plugin(({ addUtility }) => {
  addUtility('my-class', 'color: red;');
});

const css = compileClass('my-class', {
  theme: {},
  screens: {},
  containers: {},
  plugins: [myPlugin]
});

console.log(css);
// → ".my-class { color: red; }"
```

## Plugin Priority

Plugins are checked **before** built-in utilities, allowing you to override defaults:

```javascript
const overridePlugin = plugin(({ addUtility }) => {
  // Override built-in flex
  addUtility('flex', 'display: grid;'); // Now flex = grid!
});
```

## Sharing Plugins

To share your plugin:

1. **Create npm package:**
```json
{
  "name": "windrunner-plugin-myplugin",
  "main": "index.js",
  "peerDependencies": {
    "windrunner": "^1.1.0"
  }
}
```

2. **Export plugin:**
```javascript
// index.js
import { plugin } from 'windrunner';

export const myPlugin = plugin(({ addUtility }) => {
  // ... your plugin code
});
```

3. **Usage:**
```javascript
import { myPlugin } from 'windrunner-plugin-myplugin';
windrunner({ plugins: [myPlugin] });
```

## Need Help?

- **Examples:** [Plugin Examples Directory](../../examples/plugins/)
- **API Reference:** [TypeScript Definitions](../../src/index.d.ts)
- **Issues:** [GitHub Issues](https://github.com/Bigetion/windrunner/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Bigetion/windrunner/discussions)

---

**Next:** [Performance Optimization →](./performance.md)
