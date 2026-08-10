/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WINDRUNNER v2.0 — React Integration Examples
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This file demonstrates React integration patterns for Windrunner v2.0.
 * It's a conceptual reference — to run it, set up a React project with:
 * 
 *   npm create vite@latest my-app -- --template react
 *   cd my-app
 *   npm install windrunner
 * 
 * Then copy the patterns below into your components.
 * 
 * Key React APIs:
 * - useWindrunner()          — Main hook, manages instance lifecycle
 * - useCompileClass()        — Compile individual classes on demand
 * - WindrunnerProvider       — Share instance via React Context
 * - useWindrunnerContext()   — Access shared instance from context
 * 
 * StrictMode Safety:
 * - Instances stored in useRef survive double-mounting
 * - useEffect cleanup calls disconnect() properly
 * - Style tags are reused (not duplicated) across mount cycles
 * - Observer registry (WeakMap) prevents duplicate observers
 */

import React, { useState, useRef } from 'react';
import {
  useWindrunner,
  useCompileClass,
  WindrunnerProvider,
  useWindrunnerContext,
} from 'windrunner/react';
// Or: import { useWindrunner, ... } from '../../dist/react.esm.js';

// ─── Example 1: Basic useWindrunner Hook ────────────────────────────────────

/**
 * The simplest way to use Windrunner in React.
 * The hook handles:
 * - Creating the runtime instance (once, via useRef)
 * - Starting observation on mount
 * - Disconnecting on unmount
 * - StrictMode double-mount safety
 */
export function BasicApp() {
  const windrunner = useWindrunner({
    // All standard windrunner options work here
    theme: {
      colors: {
        brand: { 500: '#8b5cf6', 600: '#7c3aed' },
      },
    },
    fouc: {
      strategy: 'opacity',
      duration: 200,
    },
    debug: process.env.NODE_ENV === 'development',
    onReady: () => console.log('Windrunner ready!'),
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold text-brand-500 mb-4">
        Hello Windrunner + React
      </h1>
      <p className="text-slate-400 text-lg">
        All utility classes are compiled at runtime, just like in vanilla HTML.
      </p>
      <button className="mt-4 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors">
        Click Me
      </button>
    </div>
  );
}

// ─── Example 2: useCompileClass for Dynamic Classes ─────────────────────────

/**
 * When you need to compile classes dynamically (e.g., based on props),
 * useCompileClass gives you a function that compiles individual class names.
 * This is useful for:
 * - Dynamic color/size props
 * - Theme-driven components
 * - Animation classes generated at runtime
 */
export function DynamicCard({ color = 'violet', size = 'md' }) {
  const compile = useCompileClass();
  
  // Compile dynamic classes based on props
  const bgClass = `bg-${color}-500/10`;
  const borderClass = `border-${color}-500/50`;
  const textClass = `text-${color}-400`;
  
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-5 text-base',
    lg: 'p-8 text-lg',
  };

  // The compile function ensures CSS is generated for these dynamic classes
  compile(bgClass);
  compile(borderClass);
  compile(textClass);

  return (
    <div className={`rounded-xl border ${bgClass} ${borderClass} ${sizeClasses[size]}`}>
      <h3 className={`font-semibold ${textClass}`}>
        Dynamic {color} Card
      </h3>
      <p className="text-slate-400 mt-2">
        Color and size driven by props. CSS compiled on demand.
      </p>
    </div>
  );
}

// ─── Example 3: WindrunnerProvider (Shared Instance) ────────────────────────

/**
 * For larger apps, use WindrunnerProvider to share a single instance
 * across your component tree. Child components access it via context.
 */
export function AppWithProvider() {
  return (
    <WindrunnerProvider
      theme={{
        colors: {
          primary: { 500: '#3b82f6', 600: '#2563eb' },
          accent: { 500: '#f59e0b', 600: '#d97706' },
        },
      }}
      fouc={{ strategy: 'opacity', duration: 200 }}
      debug={true}
      onReady={() => console.log('Shared Windrunner instance ready!')}
    >
      <Layout>
        <Dashboard />
      </Layout>
    </WindrunnerProvider>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

function Header() {
  // Access the shared instance via context
  const windrunner = useWindrunnerContext();
  
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <span className="text-lg font-bold text-white">My App</span>
        <button 
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold"
          onClick={() => {
            // Access runtime methods from context
            const stats = windrunner.getStats();
            console.log('Runtime stats:', stats);
          }}
        >
          Show Stats
        </button>
      </nav>
    </header>
  );
}

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Users" value="12,345" color="primary" />
      <StatCard title="Revenue" value="$98,765" color="accent" />
      <StatCard title="Orders" value="1,234" color="primary" />
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-6`}>
      <h3 className={`text-sm font-medium text-${color}-500`}>{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

// ─── Example 4: StrictMode Safety Demonstration ─────────────────────────────

/**
 * React.StrictMode double-mounts components in development.
 * Windrunner v2.0 handles this correctly:
 * 
 * Mount 1:  useEffect → instance.start() → observing
 * Unmount:  cleanup   → instance.disconnect() → observer removed
 * Mount 2:  useEffect → instance.start() → observing again (same instance via ref)
 * 
 * The instance is stored in useRef, so it survives the unmount/remount cycle.
 * The style tag is reused (queried by id), not duplicated.
 * The observer registry prevents duplicate observers on the same root.
 */
export function StrictModeApp() {
  return (
    <React.StrictMode>
      <BasicApp />
    </React.StrictMode>
  );
}

// ─── Example 5: Conditional Rendering with Windrunner ───────────────────────

/**
 * Windrunner automatically handles dynamically added/removed elements.
 * The MutationObserver detects new class names and compiles them on the fly.
 */
export function ConditionalExample() {
  const [showPanel, setShowPanel] = useState(false);
  const [theme, setTheme] = useState('violet');
  
  useWindrunner({ debug: true });

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="flex gap-4 mb-6">
        <button
          className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm"
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? 'Hide' : 'Show'} Panel
        </button>
        <select
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="violet">Violet</option>
          <option value="emerald">Emerald</option>
          <option value="amber">Amber</option>
        </select>
      </div>

      {/* Dynamic panel — Windrunner compiles new classes when mounted */}
      {showPanel && (
        <div className={`rounded-xl border border-${theme}-500/30 bg-${theme}-500/5 p-6`}>
          <h2 className={`text-xl font-bold text-${theme}-400`}>
            Dynamic Panel
          </h2>
          <p className="text-slate-400 mt-2">
            This panel uses <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">
              {theme}
            </code> theme colors. Classes are compiled when the panel mounts.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Example 6: Using with Portals ──────────────────────────────────────────

/**
 * For React Portals (rendered outside the main DOM tree),
 * you may need to manually scan the portal root.
 * The useScanElement hook handles this automatically.
 */
import { useScanElement } from 'windrunner/react';
import { createPortal } from 'react-dom';

export function ModalWithPortal() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  
  // Scan the modal element when it mounts
  useScanElement(modalRef);

  return (
    <>
      <button
        className="px-4 py-2 rounded-lg bg-violet-600 text-white"
        onClick={() => setIsOpen(true)}
      >
        Open Modal
      </button>

      {isOpen && createPortal(
        <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Portal Modal</h2>
            <p className="text-slate-400 mb-6">
              This modal is rendered via React Portal. Windrunner scans it via useScanElement.
            </p>
            <button
              className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Default Export ─────────────────────────────────────────────────────────

export default function App() {
  return (
    <React.StrictMode>
      <AppWithProvider />
    </React.StrictMode>
  );
}
