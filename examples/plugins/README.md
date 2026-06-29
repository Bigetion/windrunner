# Windrunner Plugin Examples

This directory contains example plugins demonstrating the plugin API.

## Available Examples

### 1. Text Stroke Plugin (`text-stroke.js`)
Adds utilities for text outline effects.

```javascript
import { windrunner } from 'windrunner';
import { textStrokePlugin } from './plugins/text-stroke.js';

windrunner({
  autoStart: true,
  plugins: [textStrokePlugin]
});
```

**Usage:**
```html
<h1 class="text-4xl text-white text-stroke-2 text-stroke-black">
  Outlined Text
</h1>
```

### 2. Glass Morphism Plugin (`glass-morphism.js`)
Adds glassmorphism effect utilities.

```javascript
import { glassMorphismPlugin } from './plugins/glass-morphism.js';

windrunner({
  autoStart: true,
  plugins: [glassMorphismPlugin]
});
```

**Usage:**
```html
<div class="glass p-8 rounded-xl">
  Glass effect card
</div>
```

### 3. Custom Variants Plugin (`custom-variants.js`)
Adds useful state variants like `parent-hover:`, `loading:`, etc.

```javascript
import { customVariantsPlugin } from './plugins/custom-variants.js';

windrunner({
  autoStart: true,
  plugins: [customVariantsPlugin]
});
```

**Usage:**
```html
<div class="parent">
  <button class="parent-hover:bg-blue-600">
    Hover parent to style me
  </button>
</div>
```

## Creating Your Own Plugin

### Basic Plugin Structure

```javascript
import { plugin } from 'windrunner';

export const myPlugin = plugin(({ addUtility, addVariant, theme }) => {
  // Add a single utility
  addUtility('my-class', 'color: red; font-weight: bold;');
  
  // Add multiple utilities
  addUtilities({
    'utility-1': 'color: blue;',
    'utility-2': 'color: green;'
  });
  
  // Add a custom variant
  addVariant('my-variant', (selector) => `.my-context ${selector}`);
  
  // Access theme
  const colors = theme('colors');
  addUtility('brand-bg', `background-color: ${colors.brand};`);
});
```

### Pattern-Based Utilities

```javascript
export const dynamicPlugin = plugin(({ addUtility }) => {
  // Match classes like: spacing-4, spacing-8, spacing-16
  addUtility(/^spacing-(\d+)$/, (match, theme) => {
    const value = match[1];
    return `padding: ${value}px; margin: ${value}px;`;
  });
});
```

### Using Theme Functions

```javascript
export const themedPlugin = plugin(({ addUtility, theme }) => {
  // Get specific theme value
  const spacing = theme('spacing');
  const colors = theme('colors.blue');
  
  // Use theme values in utilities
  Object.entries(spacing).forEach(([key, value]) => {
    addUtility(`custom-p-${key}`, `padding: ${value};`);
  });
});
```

## Plugin API Reference

### `addUtility(pattern, handler)`
Add a single utility class.

- `pattern`: `string` or `RegExp` - Class name or pattern to match
- `handler`: `string` or `function` - CSS string or function that returns CSS

### `addUtilities(utilities)`
Add multiple utilities at once.

- `utilities`: `Object` - Map of patterns to handlers

### `addVariant(name, handler)`
Add a custom variant.

- `name`: `string` - Variant name (used like `name:utility`)
- `handler`: `function` - Function that transforms the selector

### `addVariants(variants)`
Add multiple variants at once.

- `variants`: `Object` - Map of names to handler functions

### `theme(key?)`
Access theme configuration.

- `key`: `string` (optional) - Dot-notation path (e.g., `'colors.blue.500'`)
- Returns: Theme value or entire theme object

### `config()`
Access full configuration object.

## Tips

1. **Plugin Priority**: Plugins are checked before built-in utilities, so you can override default behavior.

2. **Error Handling**: Wrap complex logic in try-catch to avoid breaking compilation.

3. **Performance**: Keep utility generation lightweight. Avoid heavy computations in pattern matchers.

4. **Testing**: Test your plugins with various class combinations and variants.

## Full Example

```javascript
import { windrunner, plugin } from 'windrunner';

// Define plugin
const myPlugin = plugin(({ addUtility, addVariant, theme }) => {
  // Custom utility
  addUtility('fancy-border', `
    border: 2px solid;
    border-image: linear-gradient(45deg, #ff0000, #00ff00) 1;
  `);
  
  // Pattern-based utility
  addUtility(/^delay-(\d+)$/, (match) => {
    return `transition-delay: ${match[1]}ms;`;
  });
  
  // Custom variant
  addVariant('hocus', (selector) => {
    return `${selector}:hover, ${selector}:focus`;
  });
});

// Use plugin
windrunner({
  autoStart: true,
  plugins: [myPlugin],
  theme: {
    extend: {
      colors: {
        brand: '#ff6b6b'
      }
    }
  }
});
```

```html
<button class="fancy-border delay-300 hocus:scale-105">
  Click me
</button>
```

## Need Help?

- [Plugin System Documentation](../../docs/guides/plugins.md)
- [GitHub Discussions](https://github.com/Bigetion/windrunner/discussions)
- [Report Issues](https://github.com/Bigetion/windrunner/issues)
