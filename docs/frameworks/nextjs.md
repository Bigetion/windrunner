# Next.js Integration Guide

Complete guide for using Windrunner with Next.js App Router and Pages Router.

## Table of Contents

- [Quick Start](#quick-start)
- [App Router (Next.js 13+)](#app-router-nextjs-13)
- [Pages Router (Next.js 12)](#pages-router-nextjs-12)
- [SSR Considerations](#ssr-considerations)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
npm install windrunner
```

## App Router (Next.js 13+)

### Basic Setup

**1. Create Windrunner Provider**

```tsx
// app/providers/windrunner-provider.tsx
'use client';

import { useEffect } from 'react';
import { windrunner } from 'windrunner';

export function WindrunnerProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    const wind = windrunner({
      id: 'nextjs-app',
      autoStart: true,
      preflight: true,
      onReady: () => {
        // Reveal page after styles loaded (FOUC prevention)
        document.documentElement.style.opacity = '1';
      },
      theme: {
        extend: {
          // Your custom theme
        }
      }
    });

    return () => wind.disconnect();
  }, []);

  return <>{children}</>;
}
```

**2. Add to Root Layout**

```tsx
// app/layout.tsx
import { WindrunnerProvider } from './providers/windrunner-provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Next.js App',
  description: 'Powered by Windrunner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* FOUC Prevention */}
        <style dangerouslySetInnerHTML={{
          __html: `html { opacity: 0; transition: opacity 0.2s ease; }`
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

**3. Use Tailwind Classes Anywhere**

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Next.js + Windrunner
        </h1>
        <p className="text-gray-600">
          All Tailwind classes work seamlessly!
        </p>
      </div>
    </main>
  );
}
```

### With TypeScript

```tsx
// types/windrunner.d.ts
declare module 'windrunner' {
  export interface WindrunnerOptions {
    id?: string;
    autoStart?: boolean;
    preflight?: boolean;
    onReady?: () => void;
    theme?: {
      extend?: {
        colors?: Record<string, any>;
        spacing?: Record<string, string>;
        [key: string]: any;
      };
    };
  }

  export interface WindrunnerInstance {
    start(): void;
    disconnect(): void;
    scan(root?: Element): void;
    observe(root?: Element): void;
    getCacheSize(): number;
    getInsertedRuleCount(): number;
  }

  export function windrunner(options?: WindrunnerOptions): WindrunnerInstance;
  export function createWindrunner(options?: WindrunnerOptions): WindrunnerInstance;
  export function compileClass(className: string, options?: any): string;
}
```

## Pages Router (Next.js 12)

### Basic Setup

**1. Create Custom App**

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { windrunner } from 'windrunner';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const wind = windrunner({
      id: 'nextjs-pages',
      autoStart: true,
      preflight: true,
      onReady: () => {
        document.documentElement.style.opacity = '1';
      }
    });

    return () => wind.disconnect();
  }, []);

  return <Component {...pageProps} />;
}
```

**2. Custom Document for FOUC Prevention**

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* FOUC Prevention */}
        <style dangerouslySetInnerHTML={{
          __html: `html { opacity: 0; transition: opacity 0.2s ease; }`
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

**3. Use in Pages**

```tsx
// pages/index.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold">Next.js Pages Router</h1>
    </div>
  );
}
```

## SSR Considerations

### ⚠️ Important: Understanding SSR Limitations

**Windrunner is client-side only.** During SSR:

1. **Server renders** HTML without Windrunner
2. **HTML ships** to browser without styles
3. **Hydration occurs** and Windrunner compiles CSS
4. **Styles inject** into the page

**Result:** Potential FOUC if not handled properly.

### Strategy 1: Critical CSS Extraction (Recommended for Production)

**Step 1**: Create extraction script

```javascript
// scripts/extract-critical-css.mjs
import { compileClass } from 'windrunner';
import fs from 'fs';
import path from 'path';

// Define critical classes (above-the-fold)
const criticalClasses = [
  // Layout
  'flex', 'items-center', 'justify-center', 'justify-between',
  'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3',
  'min-h-screen', 'h-full', 'w-full',
  
  // Spacing
  'p-4', 'p-6', 'p-8',
  'px-4', 'px-6', 'px-8',
  'py-2', 'py-4', 'py-6',
  'm-4', 'mx-auto', 'my-4',
  'gap-4', 'gap-6', 'gap-8',
  
  // Typography
  'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
  'font-normal', 'font-medium', 'font-semibold', 'font-bold',
  'text-gray-600', 'text-gray-900',
  
  // Colors
  'bg-white', 'bg-gray-50', 'bg-gray-100',
  'bg-blue-500', 'bg-blue-600',
  'text-white',
  
  // Effects
  'rounded-lg', 'rounded-xl',
  'shadow-sm', 'shadow-md', 'shadow-lg',
  
  // Responsive (most common)
  'md:flex', 'md:grid-cols-2', 'lg:grid-cols-3',
];

// Compile critical CSS
const criticalCSS = criticalClasses
  .map(cls => {
    try {
      return compileClass(cls);
    } catch (error) {
      console.warn(`Failed to compile: ${cls}`);
      return null;
    }
  })
  .filter(Boolean)
  .join('\n');

// Add Tailwind preflight (CSS reset)
const preflightCSS = `
*, ::before, ::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
body {
  margin: 0;
  line-height: inherit;
}
`;

const fullCSS = preflightCSS + '\n' + criticalCSS;

// Write to public directory
const outputPath = path.join(process.cwd(), 'public', 'critical.css');
fs.writeFileSync(outputPath, fullCSS);

console.log(`✅ Critical CSS generated: ${(fullCSS.length / 1024).toFixed(2)} KB`);
console.log(`   Classes: ${criticalClasses.length}`);
console.log(`   Output: public/critical.css`);
```

**Step 2**: Add to package.json

```json
{
  "scripts": {
    "extract:css": "node scripts/extract-critical-css.mjs",
    "dev": "npm run extract:css && next dev",
    "build": "npm run extract:css && next build"
  }
}
```

**Step 3**: Load critical CSS in layout

```tsx
// app/layout.tsx (App Router)
import './critical.css'; // Load critical CSS statically

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WindrunnerProvider>
          {children}
        </WindrunnerProvider>
      </body>
    </html>
  );
}
```

```tsx
// pages/_app.tsx (Pages Router)
import '../public/critical.css';

export default function App({ Component, pageProps }) {
  // ... windrunner setup
  return <Component {...pageProps} />;
}
```

**Step 4**: Disable preflight in Windrunner (avoid duplication)

```tsx
const wind = windrunner({
  autoStart: true,
  preflight: false, // ← Already loaded in critical.css
});
```

### Strategy 2: Hybrid Rendering

Use static Tailwind for critical path, Windrunner for dynamic content:

```tsx
// app/layout.tsx
import 'tailwindcss/base.css'; // Static base styles
import { WindrunnerProvider } from './providers/windrunner-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Critical above-the-fold with static CSS */}
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            Static navigation
          </nav>
        </header>
        
        {/* Dynamic content with Windrunner */}
        <WindrunnerProvider>
          {children}
        </WindrunnerProvider>
      </body>
    </html>
  );
}
```

### Strategy 3: Server Component + Client Component Split

```tsx
// app/page.tsx (Server Component - static HTML)
import { ClientContent } from './client-content';

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Server-rendered with inline styles */}
      <header style={{
        padding: '2rem',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Fast Header
        </h1>
      </header>
      
      {/* Client-rendered with Windrunner */}
      <ClientContent />
    </div>
  );
}
```

```tsx
// app/client-content.tsx
'use client';

export function ClientContent() {
  return (
    <main className="p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* These classes compile via Windrunner */}
        <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
          Interactive content
        </div>
      </div>
    </main>
  );
}
```

## Performance Optimization

### 1. Preload Windrunner Script

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="preload" 
          href="/node_modules/windrunner/dist/index.min.js" 
          as="script" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Code Splitting with Dynamic Import

```tsx
// app/providers/windrunner-provider.tsx
'use client';

import { useEffect } from 'react';

export function WindrunnerProvider({ children }) {
  useEffect(() => {
    // Lazy load Windrunner
    import('windrunner').then(({ windrunner }) => {
      const wind = windrunner({ autoStart: true });
      return () => wind.disconnect();
    });
  }, []);

  return <>{children}</>;
}
```

### 3. Route-Specific Optimization

Only load Windrunner on routes that need it:

```tsx
// app/dashboard/layout.tsx
import { WindrunnerProvider } from '../providers/windrunner-provider';

export default function DashboardLayout({ children }) {
  return (
    <WindrunnerProvider>
      {children}
    </WindrunnerProvider>
  );
}

// app/marketing/layout.tsx (no Windrunner)
export default function MarketingLayout({ children }) {
  return <>{children}</>;
}
```

### 4. Monitor Performance

```tsx
// app/providers/windrunner-provider.tsx
'use client';

import { useEffect } from 'react';
import { windrunner } from 'windrunner';

export function WindrunnerProvider({ children }) {
  useEffect(() => {
    const start = performance.now();
    
    const wind = windrunner({
      autoStart: true,
      onReady: () => {
        const duration = performance.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Windrunner] Ready in', duration.toFixed(2), 'ms');
          console.log('[Windrunner] Cached classes:', wind.getCacheSize());
          console.log('[Windrunner] CSS rules:', wind.getInsertedRuleCount());
        }
        
        // Send to analytics in production
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'windrunner_ready', {
            duration_ms: Math.round(duration),
            cache_size: wind.getCacheSize()
          });
        }
      }
    });

    return () => wind.disconnect();
  }, []);

  return <>{children}</>;
}
```

## Deployment

### Vercel

Windrunner works out-of-the-box on Vercel:

```json
// vercel.json (optional optimization)
{
  "headers": [
    {
      "source": "/node_modules/windrunner/dist/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify

```toml
# netlify.toml
[[headers]]
  for = "/node_modules/windrunner/dist/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

# Extract critical CSS during build
COPY scripts ./scripts
RUN npm run extract:css

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Issue: Hydration Mismatch

**Problem**: "Hydration failed" error in console

**Cause**: Class names differ between server and client

**Solution**:
```tsx
// Use suppressHydrationWarning for Windrunner-styled elements
<div 
  suppressHydrationWarning
  className="bg-blue-500 text-white p-4"
>
  Content
</div>
```

Or use client-only rendering:

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <>{children}</>;
}
```

### Issue: Styles Not Loading on Navigation

**Problem**: Client-side navigation doesn't trigger Windrunner

**Solution**: Windrunner's MutationObserver automatically detects new elements. If not working:

```tsx
// Force re-scan on route change
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function WindrunnerProvider({ children }) {
  const pathname = usePathname();
  
  useEffect(() => {
    const wind = windrunner({ autoStart: true });
    return () => wind.disconnect();
  }, []);
  
  // Re-scan on route change (backup mechanism)
  useEffect(() => {
    // Windrunner should handle this automatically via MutationObserver
    // But if needed, you can force a flush
    // wind.flush();
  }, [pathname]);
  
  return <>{children}</>;
}
```

### Issue: Build Time Errors

**Problem**: `ReferenceError: document is not defined`

**Cause**: Windrunner runs in browser, not during SSR

**Solution**: Ensure Windrunner only runs client-side:

```tsx
// ✅ CORRECT: Client component
'use client';

import { windrunner } from 'windrunner';
```

```tsx
// ❌ WRONG: Server component
import { windrunner } from 'windrunner'; // Will fail during SSR
```

### Issue: Large Bundle Size

**Problem**: Next.js bundle analyzer shows Windrunner increasing bundle

**Solution**: Use dynamic import for code splitting:

```tsx
const wind = await import('windrunner').then(mod => 
  mod.windrunner({ autoStart: true })
);
```

## Production Checklist

Before deploying to production:

- [ ] FOUC prevention implemented (opacity fade or critical CSS)
- [ ] Critical CSS extracted and inlined (for SEO-critical pages)
- [ ] Windrunner preflight disabled if using critical CSS
- [ ] Performance monitoring setup (onReady callback with timing)
- [ ] Tested on slow 3G network (Chrome DevTools)
- [ ] Lighthouse score > 90 (check Core Web Vitals)
- [ ] Hydration errors resolved (suppressHydrationWarning if needed)
- [ ] Cache headers configured (Vercel/Netlify)
- [ ] Error boundaries around Windrunner provider

## Example Projects

- **[Next.js App Router Example](../../examples/nextjs-app/)** (coming soon)
- **[Next.js Pages Router Example](../../examples/nextjs-pages/)** (coming soon)

## Next Steps

- **[Performance Guide](../guides/performance.md)** - Deep dive into optimization
- **[React Guide](./react.md)** - React-specific patterns
- **[FOUC Prevention](../guides/fouc-prevention.md)** - All prevention strategies

---

**Questions?** Check the [Troubleshooting Guide](../guides/troubleshooting.md) or [open an issue](https://github.com/Bigetion/windrunner/issues).
