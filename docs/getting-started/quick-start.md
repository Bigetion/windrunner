# Quick Start

Get Windrunner running in your project in under 5 minutes.

## Installation

```bash
npm install windrunner
```

## Option 1: Drop-in Script (Fastest)

Create an HTML file and add the Windrunner script:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Windrunner Page</title>
  
  <!-- FOUC Prevention (optional but recommended) -->
  <style>
    html { opacity: 0; transition: opacity 0.2s ease; }
  </style>
  
  <!-- Windrunner Setup -->
  <script type="module">
    import { windrunner } from 'windrunner';
    windrunner({ 
      autoStart: true,
      onReady: () => document.documentElement.style.opacity = '1'
    });
  </script>
</head>
<body>
  <!-- Start using Tailwind classes immediately -->
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="max-w-md p-8 bg-white rounded-xl shadow-lg">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Hello Windrunner! 🎉
      </h1>
      <p class="text-gray-600 mb-6">
        You're using zero-config Tailwind v4 runtime compilation.
        No build step required!
      </p>
      <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Get Started
      </button>
    </div>
  </div>
</body>
</html>
```

Open this file in your browser — it works immediately!

## Option 2: CDN (No Installation)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Windrunner via CDN</title>
  
  <style>
    html { opacity: 0; transition: opacity 0.2s ease; }
  </style>
  
  <script type="module">
    import { windrunner } from 'https://cdn.jsdelivr.net/npm/windrunner@1.0.3/dist/index.min.js';
    windrunner({ 
      autoStart: true,
      onReady: () => document.documentElement.style.opacity = '1'
    });
  </script>
</head>
<body>
  <div class="p-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
    <h1 class="text-4xl font-bold">Loaded via CDN!</h1>
  </div>
</body>
</html>
```

## Option 3: React Integration

```jsx
// App.jsx
import { useEffect } from 'react';
import { windrunner } from 'windrunner';

export default function App() {
  useEffect(() => {
    const wind = windrunner({ 
      id: 'my-react-app',
      autoStart: true 
    });
    
    // Cleanup when component unmounts
    return () => wind.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          React + Windrunner
        </h1>
        <p className="text-gray-600">
          All Tailwind classes work out of the box!
        </p>
        <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Click Me
        </button>
      </div>
    </main>
  );
}
```

## Option 4: Vue Integration

```vue
<!-- App.vue -->
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { windrunner } from 'windrunner';

let wind;

onMounted(() => {
  wind = windrunner({ 
    id: 'my-vue-app',
    autoStart: true 
  });
});

onUnmounted(() => {
  wind?.disconnect();
});
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Vue + Windrunner
      </h1>
      <p class="text-gray-600">
        All Tailwind classes work seamlessly!
      </p>
      <button class="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
        Click Me
      </button>
    </div>
  </main>
</template>
```

## What Just Happened?

When you use Windrunner:

1. **Script loads** (~78 KB minified)
2. **DOM scans** for all `class` attributes
3. **Classes compile** to CSS rules (only what you use)
4. **CSS injects** into a `<style>` tag in `<head>`
5. **MutationObserver watches** for new classes
6. **Page reveals** (if FOUC prevention is used)

## Next Steps

- **[Core Concepts](./core-concepts.md)** - Understand how Windrunner works
- **[Configuration](./configuration.md)** - Customize theme and options
- **[FOUC Prevention](../guides/fouc-prevention.md)** - Prevent flash of unstyled content
- **[Framework Integration](../frameworks/)** - Deep dive into React, Vue, Next.js

## Supported Utilities

Windrunner supports the full Tailwind v4 utility set:

✅ **Layout** - flexbox, grid, display, position, overflow  
✅ **Spacing** - margin, padding, gap, space-between  
✅ **Typography** - font-size, weight, color, text-align  
✅ **Colors** - OKLCH P3 color space, opacity modifiers  
✅ **Backgrounds** - gradients, images, sizes  
✅ **Borders** - width, radius, color, style  
✅ **Effects** - shadows, opacity, blur, ring  
✅ **Transforms** - rotate, scale, translate, skew  
✅ **Transitions** - duration, delay, easing  
✅ **Filters** - blur, brightness, contrast, etc.  
✅ **Interactivity** - cursor, select, pointer-events  
✅ **Variants** - hover, focus, dark, responsive  

See the [full utility list](../guides/utility-reference.md) for details.

## Common First-Time Questions

### Q: Do I need PostCSS or a build step?
**A:** No! Windrunner compiles CSS at runtime in the browser. Just add the script tag.

### Q: Will this work with my existing Tailwind project?
**A:** Yes, but you'll need to remove your existing Tailwind setup to avoid conflicts. See the [Migration Guide](../guides/migration.md).

### Q: What's the performance impact?
**A:** Initial compilation takes 20-50ms for typical pages. Dynamic class additions are near-instant due to caching. See [Performance Guide](../guides/performance.md).

### Q: Can I use arbitrary values like `w-[137px]`?
**A:** Yes! Arbitrary values work just like in Tailwind v4.

### Q: Does it work with SSR/SSG?
**A:** Windrunner is client-side only. For SSR, see the [Next.js integration guide](../frameworks/nextjs.md) for hybrid strategies.

### Q: Can I customize the theme?
**A:** Absolutely! See the [Configuration Guide](./configuration.md) for theme customization.

## Troubleshooting

**Classes not working?**
- Check browser console for errors
- Verify the script tag is in `<head>`
- Make sure the `windrunner()` call happens before page content loads

**Page flashes unstyled?**
- Add FOUC prevention CSS (see example above)
- Use the `onReady` callback to reveal the page

**Performance feels slow?**
- Check if you have thousands of unique classes
- Consider using manual control with `createWindrunner()`
- See [Performance Optimization](../guides/performance.md)

For more help, see the [Troubleshooting Guide](../guides/troubleshooting.md).

## Example Projects

Learn by example:

1. **[Landing Page](../../examples/landing.html)** - Full marketing page with animations
2. **[Todo App](../../examples/todo-app/)** - React app with dark mode
3. **[Coverage Demo](../../examples/coverage/)** - Showcase of all utilities

---

**Next:** [Core Concepts →](./core-concepts.md)
