# React Integration Guide

Complete guide for using Windrunner with React applications.

## Table of Contents

- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Hooks Pattern](#hooks-pattern)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Example Project](#example-project)

## Installation

```bash
npm install windrunner react react-dom
```

## Basic Setup

### Option 1: App-Level Integration (Recommended)

Initialize Windrunner once at the app root:

```jsx
// App.jsx
import { useEffect } from 'react';
import { windrunner } from 'windrunner';

export default function App() {
  useEffect(() => {
    // Initialize Windrunner
    const wind = windrunner({ 
      id: 'react-app',
      autoStart: true,
      preflight: true, // Include CSS reset
      onReady: () => {
        // Optional: reveal page after styles loaded
        document.documentElement.style.opacity = '1';
      }
    });
    
    // Cleanup when app unmounts
    return () => wind.disconnect();
  }, []); // Empty deps = run once
  
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-900">
        React + Windrunner
      </h1>
      <p className="mt-4 text-gray-600">
        All Tailwind classes work seamlessly!
      </p>
    </main>
  );
}
```

### Option 2: Custom Hook (More Flexible)

Create a reusable hook for Windrunner management:

```jsx
// hooks/useWindrunner.js
import { useEffect } from 'react';
import { createWindrunner } from 'windrunner';

export function useWindrunner(options = {}) {
  useEffect(() => {
    const wind = createWindrunner({
      id: options.id || 'windrunner-app',
      autoStart: false,
      preflight: options.preflight !== false,
      ...options
    });
    
    wind.start();
    
    return () => wind.disconnect();
  }, []); // Only run once
}
```

Usage:

```jsx
// App.jsx
import { useWindrunner } from './hooks/useWindrunner';

export default function App() {
  useWindrunner({ 
    id: 'my-app',
    preflight: true 
  });
  
  return (
    <div className="p-8 bg-blue-500 text-white">
      <h1 className="text-3xl font-bold">Hello World</h1>
    </div>
  );
}
```

## Hooks Pattern

### useWindrunner with Theme Customization

```jsx
// hooks/useWindrunner.js
import { useEffect } from 'react';
import { windrunner } from 'windrunner';

export function useWindrunner(customTheme = {}) {
  useEffect(() => {
    const wind = windrunner({
      autoStart: true,
      preflight: true,
      theme: {
        extend: {
          colors: {
            brand: {
              50: 'oklch(0.97 0.01 200)',
              500: 'oklch(0.55 0.18 200)',
              900: 'oklch(0.25 0.10 200)',
            },
            ...customTheme.colors
          },
          spacing: {
            128: '32rem',
            144: '36rem',
            ...customTheme.spacing
          }
        }
      }
    });
    
    return () => wind.disconnect();
  }, []); // Don't add customTheme to deps to avoid re-init
}
```

### Component-Level Control

For components that need manual control:

```jsx
// components/DynamicCard.jsx
import { useEffect, useRef } from 'react';
import { createWindrunner } from 'windrunner';

export function DynamicCard({ children }) {
  const containerRef = useRef(null);
  const windRef = useRef(null);
  
  useEffect(() => {
    // Create instance if not exists
    if (!windRef.current) {
      windRef.current = createWindrunner({ 
        id: 'dynamic-card',
        autoStart: false 
      });
    }
    
    // Only scan this component's subtree
    if (containerRef.current) {
      windRef.current.scan(containerRef.current);
      windRef.current.observe(containerRef.current);
    }
    
    return () => {
      windRef.current?.disconnect();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="p-6 bg-white rounded-lg shadow-lg"
    >
      {children}
    </div>
  );
}
```

## Best Practices

### ✅ DO: Initialize Once at App Root

```jsx
// ✅ GOOD: Single initialization
function App() {
  useEffect(() => {
    const wind = windrunner({ autoStart: true });
    return () => wind.disconnect();
  }, []);
  
  return <YourApp />;
}
```

### ❌ DON'T: Initialize in Every Component

```jsx
// ❌ BAD: Multiple instances (memory leak!)
function MyComponent() {
  useEffect(() => {
    windrunner({ autoStart: true }); // Creates new instance every render!
  }, []);
  
  return <div>Content</div>;
}
```

### ✅ DO: Always Cleanup

```jsx
// ✅ GOOD: Proper cleanup
useEffect(() => {
  const wind = windrunner({ autoStart: true });
  return () => wind.disconnect(); // Cleanup
}, []);
```

### ❌ DON'T: Forget Cleanup

```jsx
// ❌ BAD: No cleanup
useEffect(() => {
  windrunner({ autoStart: true }); // MutationObserver keeps running!
}, []);
```

### ✅ DO: Use Stable Options

```jsx
// ✅ GOOD: Options don't change
const theme = useMemo(() => ({
  extend: { colors: { brand: '#ff0000' } }
}), []);

useEffect(() => {
  const wind = windrunner({ theme, autoStart: true });
  return () => wind.disconnect();
}, []); // Empty deps, theme is stable
```

### ❌ DON'T: Pass Changing Options

```jsx
// ❌ BAD: New theme object every render
useEffect(() => {
  const wind = windrunner({ 
    theme: { extend: { colors: { brand: '#ff0000' } } }, // New object!
    autoStart: true 
  });
  return () => wind.disconnect();
}, []); // Effect runs once but theme changes cause issues
```

## Common Patterns

### Dark Mode Integration

```jsx
// App.jsx
import { useEffect, useState } from 'react';
import { windrunner } from 'windrunner';

export default function App() {
  const [theme, setTheme] = useState('light');
  
  // Initialize Windrunner
  useEffect(() => {
    const wind = windrunner({ autoStart: true });
    return () => wind.disconnect();
  }, []);
  
  // Handle dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <div className="p-8">
        <h1 className="text-3xl font-bold">Dark Mode Example</h1>
        <button 
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          className="mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg"
        >
          Toggle Theme
        </button>
      </div>
    </main>
  );
}
```

### Loading State (FOUC Prevention)

```jsx
// App.jsx with FOUC prevention
import { useState, useEffect } from 'react';
import { windrunner } from 'windrunner';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const wind = windrunner({ 
      autoStart: true,
      onReady: () => setIsReady(true) // Reveal when ready
    });
    
    return () => wind.disconnect();
  }, []);
  
  if (!isReady) {
    return <div>Loading styles...</div>; // Or a skeleton
  }
  
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold">Content</h1>
    </main>
  );
}
```

### Dynamic Class Names

```jsx
// Button.jsx
export function Button({ variant = 'primary', children }) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  
  return (
    <button className={`px-4 py-2 rounded-lg transition-colors ${variants[variant]}`}>
      {children}
    </button>
  );
}
```

Windrunner will automatically compile new classes as components render!

### Conditional Classes with clsx

```jsx
import clsx from 'clsx';

export function Card({ isActive, isHighlighted, children }) {
  return (
    <div className={clsx(
      'p-6 rounded-lg transition-all',
      isActive && 'bg-blue-100 border-2 border-blue-500',
      !isActive && 'bg-white border border-gray-200',
      isHighlighted && 'shadow-2xl scale-105'
    )}>
      {children}
    </div>
  );
}
```

## Performance Optimization

### 1. Manual Control for Large Lists

```jsx
// ProductList.jsx
import { useEffect, useRef } from 'react';
import { createWindrunner } from 'windrunner';

export function ProductList({ products }) {
  const listRef = useRef(null);
  const windRef = useRef(null);
  
  useEffect(() => {
    if (!windRef.current) {
      windRef.current = createWindrunner({ 
        id: 'product-list',
        autoStart: false 
      });
    }
  }, []);
  
  useEffect(() => {
    // Only scan when products change
    if (listRef.current && windRef.current) {
      windRef.current.scan(listRef.current);
    }
  }, [products]);
  
  return (
    <div ref={listRef} className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold">{product.name}</h3>
          <p className="text-gray-600">{product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Debounce Class Processing

```jsx
// For frequently updating components
import { useMemo, useEffect, useRef } from 'react';
import { createWindrunner } from 'windrunner';
import debounce from 'lodash/debounce';

export function LiveEditor({ content }) {
  const containerRef = useRef(null);
  const windRef = useRef(null);
  
  const debouncedScan = useMemo(
    () => debounce(() => {
      if (containerRef.current && windRef.current) {
        windRef.current.scan(containerRef.current);
      }
    }, 100),
    []
  );
  
  useEffect(() => {
    if (!windRef.current) {
      windRef.current = createWindrunner({ 
        id: 'live-editor',
        autoStart: false 
      });
    }
  }, []);
  
  useEffect(() => {
    debouncedScan();
  }, [content, debouncedScan]);
  
  return (
    <div 
      ref={containerRef}
      className="p-4 bg-white"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
```

### 3. Monitor Cache Size (Development)

```jsx
// hooks/useWindrunnerMonitor.js (dev only)
import { useEffect } from 'react';
import { windrunner } from 'windrunner';

export function useWindrunnerMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const wind = windrunner({ autoStart: true });
    
    const interval = setInterval(() => {
      console.log('[Windrunner]', {
        cachedClasses: wind.getCacheSize(),
        injectedRules: wind.getInsertedRuleCount()
      });
    }, 5000);
    
    return () => {
      clearInterval(interval);
      wind.disconnect();
    };
  }, []);
}
```

## Troubleshooting

### Issue: Classes Not Applying

**Problem**: Tailwind classes don't work

**Solutions**:
```jsx
// 1. Make sure Windrunner is initialized
useEffect(() => {
  const wind = windrunner({ autoStart: true });
  return () => wind.disconnect();
}, []);

// 2. Check for JavaScript errors in console

// 3. Verify className syntax (not class)
<div className="flex">Not class="flex"</div>

// 4. Check if classes are generated dynamically
// Windrunner watches DOM, so even dynamic classes work!
const [color, setColor] = useState('blue');
<div className={`bg-${color}-500`}>Works!</div>
```

### Issue: Memory Leak Warning

**Problem**: "Memory leak detected" warning in React DevTools

**Solution**:
```jsx
// ❌ BAD: Missing cleanup
useEffect(() => {
  windrunner({ autoStart: true });
}, []);

// ✅ GOOD: Proper cleanup
useEffect(() => {
  const wind = windrunner({ autoStart: true });
  return () => wind.disconnect(); // ← Add this!
}, []);
```

### Issue: Styles Flash on Page Load (FOUC)

**Problem**: Page shows unstyled briefly

**Solution**:
```jsx
// Add FOUC prevention
import { useState, useEffect } from 'react';

export default function App() {
  const [isStyled, setIsStyled] = useState(false);
  
  useEffect(() => {
    const wind = windrunner({ 
      autoStart: true,
      onReady: () => setIsStyled(true)
    });
    return () => wind.disconnect();
  }, []);
  
  if (!isStyled) {
    return <div style={{ opacity: 0 }}>Loading...</div>;
  }
  
  return <YourApp />;
}
```

See [FOUC Prevention Guide](../guides/fouc-prevention.md) for more strategies.

### Issue: Hot Reload Not Working with Windrunner

**Problem**: Classes don't update on hot reload

**Solution**:
```jsx
// Add autoStart key to force reinit on hot reload
useEffect(() => {
  const wind = windrunner({ 
    autoStart: true,
    id: `app-${Date.now()}` // Unique ID on each mount
  });
  return () => wind.disconnect();
}, []);
```

## Example Project

See our **[Todo App Example](../../examples/todo-app/)** for a complete React + Windrunner application with:

- ✅ Dark mode toggle
- ✅ Local storage persistence
- ✅ FOUC prevention
- ✅ Proper cleanup
- ✅ TypeScript (optional)

Key code from the example:

```jsx
// examples/todo-app/src/App.jsx
import { useEffect, useLayoutEffect, useState } from "react";
import { createWindrunner } from "windrunner";

export default function App() {
  const [theme, setTheme] = useState("dark");

  // Apply dark class before paint
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Initialize Windrunner
  useEffect(() => {
    const runtime = createWindrunner({
      autoStart: false,
      id: "windrunner-todo-runtime",
      preflight: true,
      onReady: () => {
        document.documentElement.style.opacity = "1";
      },
    });

    runtime.start();
    return () => runtime.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Your app content */}
    </main>
  );
}
```

## Next Steps

- **[Vue Integration](./vue.md)** - Similar patterns for Vue 3
- **[Next.js Integration](./nextjs.md)** - SSR and hybrid strategies
- **[Performance Guide](../guides/performance.md)** - Production optimization
- **[Dark Mode Guide](../guides/dark-mode.md)** - Complete dark mode implementation

---

**Questions?** Check the [Troubleshooting Guide](../guides/troubleshooting.md) or [open an issue](https://github.com/Bigetion/windrunner/issues).
