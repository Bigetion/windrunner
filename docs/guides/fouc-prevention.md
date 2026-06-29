# FOUC Prevention Guide

**FOUC** (Flash of Unstyled Content) occurs when your page briefly displays unstyled HTML before Windrunner compiles and injects CSS. This guide covers 5 strategies to prevent it.

## Table of Contents

- [Understanding the Problem](#understanding-the-problem)
- [Strategy 1: CSS Opacity Fade (Recommended)](#strategy-1-css-opacity-fade-recommended)
- [Strategy 2: JavaScript Visibility Toggle](#strategy-2-javascript-visibility-toggle)
- [Strategy 3: Skeleton Screen](#strategy-3-skeleton-screen)
- [Strategy 4: Critical CSS Extraction](#strategy-4-critical-css-extraction)
- [Strategy 5: Progressive Enhancement](#strategy-5-progressive-enhancement)
- [Comparison Matrix](#comparison-matrix)
- [Framework-Specific Examples](#framework-specific-examples)

## Understanding the Problem

### Timeline of Events

```
0ms  → HTML loads
10ms → JavaScript starts
20ms → Windrunner initializes
30ms → DOM scanned for classes
40ms → CSS compiled
50ms → CSS injected
60ms → Page styled ✅

PROBLEM: User sees unstyled content from 0ms to 60ms
```

### What FOUC Looks Like

**Before Windrunner loads:**
```
Your Big Title
This is some text without styling
[Button]
```

**After Windrunner loads:**
```html
╔═══════════════════════════════╗
║  Your Big Title               ║
║                               ║
║  This is beautifully styled   ║
║  text with proper spacing     ║
║                               ║
║  ┌──────────┐                ║
║  │  Button  │                ║
║  └──────────┘                ║
╚═══════════════════════════════╝
```

The transition between these states causes the "flash".

## Strategy 1: CSS Opacity Fade (Recommended)

**Best for**: Most use cases, smooth user experience

### Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FOUC Prevention - Opacity Fade</title>
  
  <!-- Step 1: Hide page initially -->
  <style>
    html {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  </style>
  
  <!-- Step 2: Initialize Windrunner with onReady callback -->
  <script type="module">
    import { windrunner } from 'windrunner';
    
    windrunner({ 
      autoStart: true,
      onReady: () => {
        // Step 3: Reveal page after styles loaded
        document.documentElement.style.opacity = '1';
      }
    });
  </script>
</head>
<body>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-4xl font-bold text-gray-900">
      No Flash!
    </h1>
  </div>
</body>
</html>
```

### How It Works

1. **Page loads**: HTML is rendered but invisible (`opacity: 0`)
2. **Windrunner scans**: All classes are found and compiled
3. **CSS injects**: Styles are added to the page
4. **onReady fires**: `opacity` changes to `1`
5. **Smooth fade**: 200ms transition reveals styled content

### Pros & Cons

✅ **Pros:**
- Smooth, professional fade-in
- No JavaScript flash
- Works on all browsers
- Minimal code

❌ **Cons:**
- 50-100ms delay before content visible
- Not ideal for SEO (content hidden initially)

## Strategy 2: JavaScript Visibility Toggle

**Best for**: When you need more control or skeleton screens

### Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FOUC Prevention - Visibility Toggle</title>
  
  <!-- Step 1: Hide body initially -->
  <style>
    body {
      visibility: hidden;
    }
    body.windrunner-ready {
      visibility: visible;
    }
  </style>
  
  <script type="module">
    import { windrunner } from 'windrunner';
    
    windrunner({ 
      autoStart: true,
      onReady: () => {
        // Step 2: Add ready class
        document.body.classList.add('windrunner-ready');
      }
    });
  </script>
</head>
<body>
  <div class="p-8 bg-blue-500 text-white">
    <h1 class="text-4xl font-bold">Content</h1>
  </div>
</body>
</html>
```

### Pros & Cons

✅ **Pros:**
- Instant reveal (no transition delay)
- Compatible with skeleton screens
- Content is in DOM (better for crawlers)

❌ **Cons:**
- Abrupt appearance (no fade)
- Slightly more code

## Strategy 3: Skeleton Screen

**Best for**: Perceived performance, professional apps

### Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FOUC Prevention - Skeleton</title>
  
  <style>
    /* Skeleton styles (no Tailwind needed) */
    .skeleton-screen {
      position: fixed;
      inset: 0;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    .skeleton-screen.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    .skeleton-box {
      width: 300px;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .skeleton-line {
      height: 1rem;
      background: linear-gradient(
        90deg,
        #e5e7eb 25%,
        #f3f4f6 50%,
        #e5e7eb 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      border-radius: 0.25rem;
      margin-bottom: 0.75rem;
    }
    
    .skeleton-line:last-child {
      width: 60%;
    }
    
    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  </style>
  
  <script type="module">
    import { windrunner } from 'windrunner';
    
    windrunner({ 
      autoStart: true,
      onReady: () => {
        // Hide skeleton after styles loaded
        const skeleton = document.getElementById('skeleton');
        skeleton.classList.add('hidden');
        
        // Remove skeleton from DOM after fade
        setTimeout(() => skeleton.remove(), 300);
      }
    });
  </script>
</head>
<body>
  <!-- Skeleton overlay -->
  <div id="skeleton" class="skeleton-screen">
    <div class="skeleton-box">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>
  </div>
  
  <!-- Actual content (will be revealed) -->
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="max-w-md p-8 bg-white rounded-xl shadow-lg">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Loaded!
      </h1>
      <p class="text-gray-600">
        The skeleton screen prevented FOUC while styles were loading.
      </p>
    </div>
  </div>
</body>
</html>
```

### Pros & Cons

✅ **Pros:**
- Best perceived performance
- Professional feel
- Users see something immediately
- No "blank screen" feel

❌ **Cons:**
- More code required
- Need to maintain skeleton design
- Adds extra kilobytes

## Strategy 4: Critical CSS Extraction

**Best for**: Production apps, SEO-critical pages

### Implementation

**Step 1**: Extract critical classes during build

```javascript
// scripts/extract-critical.js
import { compileClass } from 'windrunner';
import fs from 'fs';

// List your most-used classes (above-the-fold)
const criticalClasses = [
  'flex',
  'items-center',
  'justify-center',
  'min-h-screen',
  'bg-gray-100',
  'p-4', 'p-6', 'p-8',
  'text-2xl', 'text-3xl', 'text-4xl',
  'font-bold',
  'text-gray-900',
  'bg-white',
  'rounded-lg', 'rounded-xl',
  'shadow-lg',
  // Add more...
];

// Compile critical CSS
const criticalCSS = criticalClasses
  .map(cls => compileClass(cls))
  .filter(Boolean)
  .join('\n');

// Write to file
fs.writeFileSync('public/critical.css', criticalCSS);
console.log(`✅ Generated critical.css (${criticalCSS.length} bytes)`);
```

**Step 2**: Inline critical CSS

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FOUC Prevention - Critical CSS</title>
  
  <!-- Inline critical CSS (above-the-fold styles) -->
  <style>
    /* Generated from extract-critical.js */
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .min-h-screen { min-height: 100vh; }
    .bg-gray-100 { background-color: oklch(0.967 0.003 264.5); }
    .text-4xl { font-size: 2.25rem; }
    .font-bold { font-weight: 700; }
    /* ... more critical styles ... */
  </style>
  
  <!-- Load Windrunner for non-critical/dynamic styles -->
  <script type="module">
    import { windrunner } from 'windrunner';
    windrunner({ autoStart: true, preflight: false }); // Disable preflight (already inlined)
  </script>
</head>
<body>
  <!-- Above-the-fold content (uses critical CSS) -->
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-4xl font-bold text-gray-900">
      Instant!
    </h1>
  </div>
  
  <!-- Below-the-fold content (uses Windrunner) -->
  <section class="p-20 bg-gradient-to-r from-purple-500 to-pink-500">
    <!-- These classes compile on-demand -->
  </section>
</body>
</html>
```

**Step 3**: Add to build process

```json
// package.json
{
  "scripts": {
    "build:critical": "node scripts/extract-critical.js",
    "build": "npm run build:critical && vite build"
  }
}
```

### Pros & Cons

✅ **Pros:**
- Zero FOUC for above-the-fold content
- Best SEO (styles load immediately)
- Instant first paint
- Hybrid approach (static + dynamic)

❌ **Cons:**
- Requires build step
- Need to maintain critical class list
- More complex setup

## Strategy 5: Progressive Enhancement

**Best for**: Content-first sites, accessibility priority

### Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FOUC Prevention - Progressive Enhancement</title>
  
  <!-- Base styles (no Tailwind needed) -->
  <style>
    /* Fallback styles before Windrunner loads */
    body {
      font-family: system-ui, sans-serif;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: #f9fafb;
      color: #111827;
    }
    
    h1 {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    
    button:hover {
      background: #2563eb;
    }
  </style>
  
  <!-- Windrunner enhances the experience -->
  <script type="module">
    import { windrunner } from 'windrunner';
    
    windrunner({ 
      autoStart: true,
      onReady: () => {
        // Add class to indicate enhancement ready
        document.body.classList.add('enhanced');
      }
    });
  </script>
</head>
<body>
  <!-- Works without JavaScript/Windrunner -->
  <h1 class="text-4xl font-black text-gray-900">
    Progressive Enhancement
  </h1>
  
  <p class="text-lg text-gray-600 mb-6">
    This page looks decent even before Windrunner loads,
    then gets enhanced with Tailwind classes.
  </p>
  
  <button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all hover:scale-105">
    Enhanced Button
  </button>
</body>
</html>
```

### How It Works

1. **Page loads**: Base CSS provides decent styling
2. **Windrunner loads**: Tailwind classes enhance the design
3. **No flash**: Transition is smooth because base styles exist

### Pros & Cons

✅ **Pros:**
- Best accessibility (works without JS)
- No FOUC at all
- Content readable immediately
- Graceful degradation

❌ **Cons:**
- Need to maintain two sets of styles
- More initial CSS
- Design may look "basic" briefly

## Comparison Matrix

| Strategy | Complexity | SEO | UX | Performance | Best For |
|----------|-----------|-----|-----|-------------|----------|
| **CSS Opacity Fade** | ⭐ Low | ⚠️ Fair | ⭐⭐⭐ Good | ⭐⭐⭐ Fast | Most projects |
| **JS Visibility Toggle** | ⭐ Low | ⭐ Good | ⭐⭐ OK | ⭐⭐⭐ Fast | Simple apps |
| **Skeleton Screen** | ⭐⭐ Medium | ⭐ Good | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ OK | Professional apps |
| **Critical CSS** | ⭐⭐⭐ High | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Fastest | Production SEO sites |
| **Progressive Enhancement** | ⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good | ⭐⭐⭐⭐ Very Fast | Content sites |

### Recommendation by Use Case

- **Landing Page**: Critical CSS Extraction
- **SaaS Dashboard**: CSS Opacity Fade or Skeleton
- **Blog/Content Site**: Progressive Enhancement
- **Internal Tool**: JS Visibility Toggle (simplest)
- **E-commerce**: Skeleton Screen or Critical CSS

## Framework-Specific Examples

### React

```jsx
// App.jsx
import { useState, useEffect } from 'react';
import { windrunner } from 'windrunner';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const wind = windrunner({ 
      autoStart: true,
      onReady: () => setIsReady(true)
    });
    
    return () => wind.disconnect();
  }, []);
  
  if (!isReady) {
    // Skeleton screen component
    return <SkeletonScreen />;
  }
  
  return <YourApp />;
}

function SkeletonScreen() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        height: '2rem', 
        background: '#e5e7eb', 
        marginBottom: '1rem',
        borderRadius: '0.5rem',
        animation: 'pulse 1.5s infinite'
      }} />
      <div style={{ 
        height: '1rem', 
        background: '#e5e7eb',
        width: '60%',
        borderRadius: '0.5rem'
      }} />
    </div>
  );
}
```

### Next.js

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Critical CSS inlined */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html { opacity: 0; transition: opacity 0.2s ease; }
          `
        }} />
      </head>
      <body>
        <WindrunnerProvider>
          {children}
        </WindrunnerProvider>
      </body>
    </html>
  );
}
```

### Vue

```vue
<!-- App.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { windrunner } from 'windrunner';

const isReady = ref(false);

onMounted(() => {
  const wind = windrunner({ 
    autoStart: true,
    onReady: () => (isReady.value = true)
  });
});
</script>

<template>
  <SkeletonScreen v-if="!isReady" />
  <YourApp v-else />
</template>
```

## Testing Your FOUC Prevention

### Visual Regression Testing

```javascript
// test-fouc.js
import puppeteer from 'puppeteer';

async function testFOUC() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Throttle network to simulate slow connection
  await page.emulateNetworkConditions({
    offline: false,
    downloadThroughput: 50 * 1024, // 50kb/s
    uploadThroughput: 20 * 1024,
    latency: 500
  });
  
  await page.goto('http://localhost:3000');
  
  // Take screenshot before styles load
  await page.screenshot({ path: 'before-styles.png' });
  
  // Wait for Windrunner
  await page.waitForSelector('body.windrunner-ready');
  
  // Take screenshot after styles load
  await page.screenshot({ path: 'after-styles.png' });
  
  await browser.close();
  
  console.log('✅ Screenshots saved. Compare before-styles.png and after-styles.png');
}

testFOUC();
```

### Manual Testing Checklist

- [ ] Test on 3G connection (Chrome DevTools → Network → Slow 3G)
- [ ] Test with JavaScript disabled (should show something)
- [ ] Test with ad blocker (blocks some CDNs)
- [ ] Test on mobile device (slower CPU)
- [ ] Test with browser extensions (some inject CSS)

## Best Practices Summary

1. **Always implement FOUC prevention** for production
2. **Choose strategy based on your use case** (see comparison matrix)
3. **Test on slow connections** to catch issues
4. **Measure impact** with Lighthouse/WebPageTest
5. **Consider hybrid approach** (critical CSS + Windrunner)

## Next Steps

- **[Performance Optimization](./performance.md)** - Further optimize load time
- **[React Integration](../frameworks/react.md)** - Framework-specific patterns
- **[Next.js SSR Strategies](../frameworks/nextjs.md)** - Server-side rendering

---

**Questions?** Check [Troubleshooting Guide](./troubleshooting.md) or [open an issue](https://github.com/Bigetion/windrunner/issues).
