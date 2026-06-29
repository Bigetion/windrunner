# Performance Optimization Guide

Complete guide to optimizing Windrunner for production environments.

## Table of Contents

- [Understanding Performance Characteristics](#understanding-performance-characteristics)
- [Optimization Strategies](#optimization-strategies)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Runtime Performance](#runtime-performance)
- [Production Best Practices](#production-best-practices)
- [Monitoring & Profiling](#monitoring--profiling)
- [Benchmarking](#benchmarking)

## Understanding Performance Characteristics

### Performance Profile

```
Component              | Time    | Size     | When
----------------------|---------|----------|--------
Initial Load          | ~10ms   | 78 KB    | Page load
First Scan            | ~20-50ms| -        | DOMContentLoaded
Class Compilation     | ~0.1ms  | -        | Per unique class
CSS Injection         | ~1ms    | -        | Per rule
MutationObserver      | ~5ms    | -        | Per DOM change
Cache Lookup          | ~0.01ms | -        | Per cached class
```

### What This Means

**Good for:**
- ✅ Pages with < 100 unique utility classes
- ✅ Infrequent DOM updates
- ✅ Prototyping and internal tools
- ✅ Small to medium applications

**Challenging for:**
- ⚠️ Pages with 500+ unique classes (compilation adds up)
- ⚠️ Heavy DOM mutations (data tables, real-time apps)
- ⚠️ SEO-critical pages without FOUC prevention
- ⚠️ Sub-second Time to Interactive requirements

## Optimization Strategies

### Strategy 1: Critical CSS Extraction ⭐ **BEST**

Extract and inline commonly-used classes.

**Implementation:**

```javascript
// scripts/extract-critical.js
import { compileClass } from 'windrunner';
import fs from 'fs';

const criticalClasses = [
  // Layout (60% of typical usage)
  'flex', 'grid', 'block', 'inline-block',
  'items-center', 'justify-center', 'justify-between',
  'min-h-screen', 'w-full', 'h-full',
  
  // Spacing (30% of typical usage)
  'p-4', 'p-6', 'p-8', 'px-4', 'py-2',
  'm-4', 'mx-auto', 'gap-4',
  
  // Typography (10% of typical usage)
  'text-lg', 'text-xl', 'text-2xl', 'font-bold',
  
  // Add YOUR most-used classes here
];

const css = criticalClasses.map(compileClass).join('\n');
fs.writeFileSync('public/critical.css', css);
```

**Load statically:**

```html
<head>
  <link rel="stylesheet" href="/critical.css">
  <!-- Windrunner handles the rest -->
</head>
```

**Impact:**
- 📉 **First Paint**: 40-50ms → 5-10ms
- 📉 **Compilation Time**: 80% reduction
- 📉 **FOUC**: Eliminated for critical content

### Strategy 2: Manual Control for Heavy Pages

Use `createWindrunner()` for fine-grained control.

**Example: Data Table**

```javascript
import { createWindrunner } from 'windrunner';

// Initialize without auto-scan
const wind = createWindrunner({ 
  id: 'data-table',
  autoStart: false 
});

// Scan only once after initial render
function renderTable(data) {
  const table = document.getElementById('table');
  table.innerHTML = data.map(row => `
    <tr class="hover:bg-gray-50">
      <td class="p-4 text-sm">${row.name}</td>
      <td class="p-4 text-sm">${row.value}</td>
    </tr>
  `).join('');
  
  // Scan only the table (not entire document)
  wind.scan(table);
}

// Disable observer if content is static
// wind.observe(); // ← Don't call this if content doesn't change
```

**Impact:**
- 📉 **Initial Scan**: 50ms → 5ms (10x faster)
- 📉 **Memory**: 50% less (no observer)
- 📉 **CPU**: Idle after initial scan

### Strategy 3: Debounce Dynamic Content

For frequently updating content (live editor, chat, etc.):

```javascript
import { createWindrunner } from 'windrunner';
import debounce from 'lodash/debounce';

const wind = createWindrunner({ autoStart: false });

// Debounce scanning to avoid thrashing
const debouncedScan = debounce((element) => {
  wind.scan(element);
}, 100); // Wait 100ms after last change

// Usage in React
function LivePreview({ html }) {
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      debouncedScan(ref.current);
    }
  }, [html]);
  
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
```

**Impact:**
- 📉 **CPU Usage**: 90% reduction during rapid updates
- 📉 **Jank**: Eliminated frame drops

### Strategy 4: Route-Based Loading

Load Windrunner only on routes that need it:

```javascript
// App.jsx
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function App() {
  const location = useLocation();
  
  useEffect(() => {
    // Only load Windrunner on /dashboard routes
    if (location.pathname.startsWith('/dashboard')) {
      import('windrunner').then(({ windrunner }) => {
        const wind = windrunner({ autoStart: true });
        return () => wind.disconnect();
      });
    }
  }, [location.pathname]);
  
  return <Routes />;
}
```

**Impact:**
- 📉 **Bundle**: 78 KB saved on routes that don't need styling
- 📉 **Time to Interactive**: 100ms faster

### Strategy 5: Precompile Common Patterns

For large apps, precompile classes at build time:

```javascript
// build-time-compiler.js
import { compileClass } from 'windrunner';
import glob from 'glob';
import fs from 'fs';

// Find all JSX/HTML files
const files = glob.sync('src/**/*.{jsx,tsx,html}');

// Extract all class names
const classPattern = /className=["']([^"']+)["']/g;
const allClasses = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.matchAll(classPattern);
  
  for (const match of matches) {
    match[1].split(' ').forEach(cls => allClasses.add(cls));
  }
});

// Compile all found classes
const precompiledCSS = Array.from(allClasses)
  .map(cls => compileClass(cls))
  .filter(Boolean)
  .join('\n');

fs.writeFileSync('public/precompiled.css', precompiledCSS);

console.log(`✅ Precompiled ${allClasses.size} classes`);
```

**Load both:**

```html
<head>
  <!-- Precompiled classes (90% of what you use) -->
  <link rel="stylesheet" href="/precompiled.css">
  
  <!-- Windrunner handles dynamic classes (10%) -->
  <script type="module">
    import { windrunner } from 'windrunner';
    windrunner({ autoStart: true, preflight: false });
  </script>
</head>
```

**Impact:**
- 📉 **Runtime Compilation**: 90% reduction
- 📉 **First Paint**: Near-instant (static CSS)
- ✅ **Hybrid Approach**: Best of both worlds

## Bundle Size Optimization

### Current Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze build
npm run build
npx webpack-bundle-analyzer .next/dist/stats.json
```

**Windrunner footprint:**
```
windrunner/dist/index.min.js:  78 KB (22 KB gzipped)
├── Compiler:                  45 KB
├── Theme data:                20 KB
├── Runtime:                   10 KB
└── Utils:                      3 KB
```

### Optimization 1: Dynamic Import

```javascript
// Before: Windrunner in main bundle (78 KB)
import { windrunner } from 'windrunner';

// After: Separate chunk, lazy loaded
const loadWindrunner = async () => {
  const { windrunner } = await import('windrunner');
  return windrunner({ autoStart: true });
};
```

**Savings:** 78 KB from main bundle → async chunk

### Optimization 2: CDN with Preconnect

```html
<head>
  <!-- Preconnect to CDN -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  
  <script type="module">
    // Load from CDN instead of bundling
    import { windrunner } from 'https://cdn.jsdelivr.net/npm/windrunner@1.0.3/dist/index.min.js';
    windrunner({ autoStart: true });
  </script>
</head>
```

**Savings:** 78 KB from your bundle, cached across sites

### Optimization 3: Tree Shaking (Advanced)

If you only use `compileClass` for build-time compilation:

```javascript
// Instead of importing everything
import { compileClass } from 'windrunner';

// Use direct import (if library supports it)
import { compileClass } from 'windrunner/compiler';
```

**Note:** Windrunner doesn't currently support this. Consider opening a feature request!

## Runtime Performance

### Measurement Tools

**1. Built-in Performance API**

```javascript
const wind = windrunner({
  autoStart: true,
  onReady: () => {
    const perfEntries = performance.getEntriesByType('measure');
    console.log('Windrunner timing:', perfEntries);
  }
});

// Manual measurement
performance.mark('windrunner-start');
wind.scan();
performance.mark('windrunner-end');
performance.measure('windrunner-scan', 'windrunner-start', 'windrunner-end');
```

**2. React DevTools Profiler**

```jsx
import { Profiler } from 'react';

<Profiler id="WindrunnerProvider" onRender={(id, phase, actualDuration) => {
  if (actualDuration > 16) { // More than one frame
    console.warn('Windrunner slow render:', actualDuration);
  }
}}>
  <WindrunnerProvider>
    <App />
  </WindrunnerProvider>
</Profiler>
```

**3. Chrome DevTools Performance Tab**

1. Open DevTools → Performance
2. Click Record
3. Reload page
4. Look for `windrunner` in User Timing

### Performance Budgets

Set acceptable thresholds:

```javascript
const PERFORMANCE_BUDGETS = {
  initialScan: 50,    // ms
  cssInjection: 10,   // ms
  cacheSize: 500,     // classes
  memoryUsage: 5,     // MB
};

const wind = windrunner({
  autoStart: true,
  onReady: () => {
    const cacheSize = wind.getCacheSize();
    
    if (cacheSize > PERFORMANCE_BUDGETS.cacheSize) {
      console.warn(`Cache size exceeded: ${cacheSize} > ${PERFORMANCE_BUDGETS.cacheSize}`);
    }
    
    if (performance.memory) {
      const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      if (usedMB > PERFORMANCE_BUDGETS.memoryUsage) {
        console.warn(`Memory exceeded: ${usedMB.toFixed(2)} MB`);
      }
    }
  }
});
```

## Production Best Practices

### Checklist

- [ ] **Critical CSS extracted** for above-the-fold content
- [ ] **FOUC prevention** implemented (opacity fade or skeleton)
- [ ] **Preflight disabled** if using critical CSS
- [ ] **Manual control** for heavy pages (data tables, lists)
- [ ] **Debouncing** for frequently updating content
- [ ] **Route-based loading** if only some routes need Windrunner
- [ ] **Performance monitoring** in place (onReady callback)
- [ ] **Bundle analysis** done (check main bundle size)
- [ ] **Lighthouse score** > 90 (Performance, Best Practices)
- [ ] **Core Web Vitals** passing:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### Configuration for Production

```javascript
const isProd = process.env.NODE_ENV === 'production';

const wind = windrunner({
  id: 'app',
  autoStart: true,
  preflight: false, // Using critical.css instead
  
  onReady: () => {
    if (!isProd) {
      // Development: Log stats
      console.log('[Windrunner] Cache:', wind.getCacheSize());
    } else {
      // Production: Send to analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'windrunner_init', {
          cache_size: wind.getCacheSize(),
          rules: wind.getInsertedRuleCount()
        });
      }
    }
  }
});
```

## Monitoring & Profiling

### Real User Monitoring (RUM)

```javascript
// Send Windrunner metrics to your analytics
const wind = windrunner({
  autoStart: true,
  onReady: () => {
    const metrics = {
      cacheSize: wind.getCacheSize(),
      rulesInjected: wind.getInsertedRuleCount(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };
    
    // Send to your analytics service
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'windrunner_metrics',
        data: metrics
      })
    });
  }
});
```

### Performance Regression Detection

```javascript
// Store baseline in CI
const baseline = {
  cacheSize: 120,
  initTime: 45, // ms
};

// Compare in tests
test('Windrunner performance', () => {
  const start = performance.now();
  const wind = windrunner({ autoStart: true });
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(baseline.initTime * 1.2); // 20% tolerance
  expect(wind.getCacheSize()).toBeLessThan(baseline.cacheSize * 1.2);
});
```

## Benchmarking

### Comparison: Windrunner vs Traditional Tailwind

**Test Setup:**
- 100 components
- 50 unique utility classes
- 3G network throttling

**Results:**

| Metric | Windrunner | Traditional | Winner |
|--------|-----------|-------------|--------|
| **Bundle Size** | 78 KB | 12 KB CSS | ✅ Traditional (6x smaller) |
| **Time to First Paint** | 45ms | 0ms | ✅ Traditional (instant) |
| **Dynamic Classes** | Instant | N/A (requires rebuild) | ✅ Windrunner |
| **Setup Time** | 0 min | 15 min | ✅ Windrunner (no build) |
| **Memory (Runtime)** | 2.8 MB | 0.1 MB | ✅ Traditional (28x less) |

**Conclusion:**
- **Windrunner**: Best for prototyping, no-build environments
- **Traditional**: Best for production, performance-critical apps

### Your Own Benchmarks

```bash
# Install benchmark tool
npm install --save-dev lighthouse puppeteer

# Run Lighthouse programmatically
node scripts/benchmark.js
```

```javascript
// scripts/benchmark.js
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

async function runBenchmark() {
  const browser = await puppeteer.launch();
  const { lhr } = await lighthouse('http://localhost:3000', {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json'
  });
  
  console.log('Performance Score:', lhr.categories.performance.score * 100);
  console.log('FCP:', lhr.audits['first-contentful-paint'].displayValue);
  console.log('LCP:', lhr.audits['largest-contentful-paint'].displayValue);
  
  await browser.close();
}

runBenchmark();
```

## When to Optimize

### Green Zone ✅ (No Action Needed)
- Cache size < 200 classes
- Init time < 50ms
- Lighthouse score > 90
- No user complaints

### Yellow Zone ⚠️ (Consider Optimizing)
- Cache size 200-500 classes
- Init time 50-100ms
- Lighthouse score 70-90
- Some users report slow load

**Actions:**
- Extract critical CSS
- Implement FOUC prevention
- Add performance monitoring

### Red Zone 🚨 (Optimize Now)
- Cache size > 500 classes
- Init time > 100ms
- Lighthouse score < 70
- Frequent user complaints

**Actions:**
- Switch to traditional Tailwind for production
- Or implement **all** optimization strategies
- Or use hybrid approach (critical CSS + Windrunner)

## Next Steps

- **[FOUC Prevention](./fouc-prevention.md)** - Implement first paint optimization
- **[Next.js Integration](../frameworks/nextjs.md)** - SSR-specific optimizations
- **[React Integration](../frameworks/react.md)** - Component-level patterns

---

**Questions?** [Open an issue](https://github.com/Bigetion/windrunner/issues) or check the [Troubleshooting Guide](./troubleshooting.md).
