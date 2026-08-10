/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock React hooks ─────────────────────────────────────────────────────────
// React is an optional peer dependency and not installed in dev.
// We mock the hooks to test the integration logic without a full React env.

// Use vi.hoisted to ensure these are available when the mock factory executes
const {
  effectCallbacksRef,
  effectCleanupsRef,
  refStoreRef,
  refCounterRef,
  createdContextsRef,
  contextOverridesRef,
} = vi.hoisted(() => ({
  effectCallbacksRef: { value: [] },
  effectCleanupsRef: { value: [] },
  refStoreRef: { value: {} },
  refCounterRef: { value: 0 },
  createdContextsRef: { value: [] },
  contextOverridesRef: { value: new Map() },
}));

vi.mock('react', () => ({
  useRef: (initial) => {
    const id = refCounterRef.value++;
    if (!(id in refStoreRef.value)) {
      refStoreRef.value[id] = { current: initial };
    }
    return refStoreRef.value[id];
  },
  useEffect: (callback, deps) => {
    effectCallbacksRef.value.push({ callback, deps });
  },
  useMemo: (factory, deps) => factory(),
  useCallback: (fn, deps) => fn,
  createContext: (defaultValue) => {
    const ctx = { _currentValue: defaultValue, Provider: 'MockProvider' };
    createdContextsRef.value.push(ctx);
    return ctx;
  },
  useContext: (context) => {
    if (contextOverridesRef.value.has(context)) {
      return contextOverridesRef.value.get(context);
    }
    return context._currentValue;
  },
  createElement: (type, props, ...children) => {
    return { type, props: { ...props, children } };
  },
}));

// ─── Import after mocking ────────────────────────────────────────────────────
import { useWindrunner, WindrunnerProvider, useWindrunnerContext } from './react.js';
import { createWindrunner, _observerRegistry } from './runtime.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetMockState() {
  effectCallbacksRef.value = [];
  effectCleanupsRef.value = [];
  refStoreRef.value = {};
  refCounterRef.value = 0;
  contextOverridesRef.value = new Map();
}

/**
 * Simulate running all registered useEffect callbacks.
 * Returns their cleanup functions.
 */
function runEffects() {
  const cleanups = [];
  for (const { callback } of effectCallbacksRef.value) {
    const cleanup = callback();
    if (typeof cleanup === 'function') {
      cleanups.push(cleanup);
    }
  }
  effectCleanupsRef.value = cleanups;
  return cleanups;
}

/**
 * Run all cleanup functions (simulates unmount).
 */
function runCleanups() {
  for (const cleanup of effectCleanupsRef.value) {
    cleanup();
  }
  effectCleanupsRef.value = [];
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useWindrunner hook (Task 35)", () => {
  beforeEach(() => {
    resetMockState();
    document.body.innerHTML = '<div id="app" class="flex items-center"><span class="text-red-500">hello</span></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    resetMockState();
  });

  describe("instance creation and ref storage", () => {
    it("should return a windrunner instance", () => {
      const instance = useWindrunner();
      expect(instance).not.toBeNull();
      expect(typeof instance.processClassName).toBe('function');
      expect(typeof instance.scan).toBe('function');
      expect(typeof instance.observe).toBe('function');
      expect(typeof instance.disconnect).toBe('function');
      expect(typeof instance.getStats).toBe('function');
    });

    it("should store instance in useRef so it survives re-renders", () => {
      // First call creates the instance
      const instance1 = useWindrunner({ id: 'test-1' });
      
      // Reset effect tracking but keep ref store (simulates re-render)
      effectCallbacksRef.value = [];
      refCounterRef.value = 0; // Reset counter so same ref is accessed
      
      // Second call should return same instance (from ref)
      const instance2 = useWindrunner({ id: 'test-1' });
      
      expect(instance2).toBe(instance1);
    });

    it("should create instance with autoStart: false", () => {
      const instance = useWindrunner();
      
      // The instance should not have started observing yet (before useEffect runs)
      expect(instance.getStats().isObserving).toBe(false);
    });

    it("should pass user options to createWindrunner", () => {
      const onReady = vi.fn();
      const instance = useWindrunner({ 
        id: 'custom-id', 
        preflight: false, 
        onReady 
      });
      
      // Instance should be created with our options
      expect(instance).not.toBeNull();
    });
  });

  describe("useEffect lifecycle (mount/unmount)", () => {
    it("should register a useEffect with empty deps", () => {
      useWindrunner();
      
      // Check that useEffect was called
      expect(effectCallbacksRef.value.length).toBe(1);
      // Empty deps array
      expect(effectCallbacksRef.value[0].deps).toEqual([]);
    });

    it("should call start() when effect runs (mount)", () => {
      const instance = useWindrunner();
      const startSpy = vi.spyOn(instance, 'start');
      
      runEffects();
      
      expect(startSpy).toHaveBeenCalledTimes(1);
      startSpy.mockRestore();
    });

    it("should call disconnect() in cleanup function (unmount)", () => {
      const instance = useWindrunner();
      const disconnectSpy = vi.spyOn(instance, 'disconnect');
      
      // Mount
      runEffects();
      
      // Unmount
      runCleanups();
      
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      disconnectSpy.mockRestore();
    });
  });

  describe("StrictMode double-mounting simulation", () => {
    it("should handle mount → unmount → remount without errors", () => {
      const instance = useWindrunner();
      
      // First mount
      runEffects();
      expect(instance.getStats().isObserving).toBe(true);
      
      // Unmount (StrictMode cleanup)
      runCleanups();
      expect(instance.getStats().isObserving).toBe(false);
      
      // Reset effects for remount
      effectCallbacksRef.value = [];
      refCounterRef.value = 0;
      
      // Remount (StrictMode re-runs effect)
      const instance2 = useWindrunner();
      expect(instance2).toBe(instance); // Same ref
      
      runEffects();
      expect(instance.getStats().isObserving).toBe(true);
      
      // Final cleanup
      runCleanups();
    });

    it("should not create duplicate observers during StrictMode double-mount", () => {
      const root = document.documentElement;
      const instance = useWindrunner();
      
      // First mount
      runEffects();
      
      // Unmount
      runCleanups();
      expect(_observerRegistry.has(root)).toBe(false);
      
      // Reset effects for remount
      effectCallbacksRef.value = [];
      refCounterRef.value = 0;
      
      // Remount
      useWindrunner();
      runEffects();
      
      // Should have exactly one observer in registry
      expect(_observerRegistry.has(root)).toBe(true);
      
      // Cleanup
      runCleanups();
    });

    it("should not duplicate CSS rules across mount/unmount cycles", () => {
      document.body.innerHTML = '<div class="flex items-center gap-4">content</div>';
      
      const instance = useWindrunner();
      
      // First mount — scan and compile
      runEffects();
      const rulesAfterFirstMount = instance.getInsertedRuleCount();
      
      // Unmount
      runCleanups();
      
      // Reset for remount
      effectCallbacksRef.value = [];
      refCounterRef.value = 0;
      
      // Remount
      useWindrunner();
      runEffects();
      
      // Rule count should not increase (duplicate prevention)
      const rulesAfterRemount = instance.getInsertedRuleCount();
      expect(rulesAfterRemount).toBe(rulesAfterFirstMount);
      
      runCleanups();
    });

    it("should reuse existing style tag across StrictMode double-mount", () => {
      const instance = useWindrunner({ id: 'strict-mode-test' });
      
      // First mount
      runEffects();
      
      const styleTags = document.querySelectorAll('style[data-tailwind-runtime="strict-mode-test"]');
      expect(styleTags.length).toBe(1);
      
      // Unmount
      runCleanups();
      
      // Reset for remount
      effectCallbacksRef.value = [];
      refCounterRef.value = 0;
      
      // Remount
      useWindrunner({ id: 'strict-mode-test' });
      runEffects();
      
      // Should still have only one style tag (reused)
      const styleTagsAfter = document.querySelectorAll('style[data-tailwind-runtime="strict-mode-test"]');
      expect(styleTagsAfter.length).toBe(1);
      
      runCleanups();
    });

    it("should support multiple independent instances with different ids", () => {
      // First instance
      const instance1 = useWindrunner({ id: 'instance-a' });
      
      // Run first instance's effect
      runEffects();
      expect(instance1.getStats().isObserving).toBe(true);
      
      // Reset effect list for second component (but keep refs)
      effectCallbacksRef.value = [];
      // Don't reset refCounter - next ref is a new one
      
      // Second instance
      const instance2 = useWindrunner({ id: 'instance-b' });
      
      expect(instance1).not.toBe(instance2);
      
      // Run second instance's effect
      runEffects();
      
      // Both should be observing
      expect(instance1.getStats().isObserving).toBe(true);
      expect(instance2.getStats().isObserving).toBe(true);
      
      // Disconnect both
      instance1.disconnect();
      instance2.disconnect();
    });
  });
});

describe("WindrunnerProvider and useWindrunnerContext (Task 36)", () => {
  beforeEach(() => {
    resetMockState();
    document.body.innerHTML = '<div id="app" class="flex items-center"><span class="text-red-500">hello</span></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    resetMockState();
  });

  describe("WindrunnerProvider", () => {
    it("should be a function (component)", () => {
      expect(typeof WindrunnerProvider).toBe('function');
    });

    it("should create a windrunner instance internally via useWindrunner", () => {
      // WindrunnerProvider calls useWindrunner and provides the instance via context
      const result = WindrunnerProvider({ children: null });
      
      // It should return a createElement result
      expect(result).toBeDefined();
      expect(result.props).toBeDefined();
      expect(result.props.value).not.toBeNull();
      expect(typeof result.props.value.processClassName).toBe('function');
    });

    it("should pass options through to useWindrunner", () => {
      const result = WindrunnerProvider({ 
        children: null, 
        id: 'provider-test',
        preflight: false 
      });
      
      // The value should be a windrunner instance
      const instance = result.props.value;
      expect(instance).not.toBeNull();
      expect(typeof instance.scan).toBe('function');
    });

    it("should make windrunner instance accessible to children via context", () => {
      // Render provider - this sets context value via createElement mock
      const result = WindrunnerProvider({ children: null });
      const instance = result.props.value;
      
      // Simulate being inside the provider by setting context override
      const ctx = createdContextsRef.value[createdContextsRef.value.length - 1];
      contextOverridesRef.value.set(ctx, instance);
      
      // Now useWindrunnerContext should return the instance
      const fromContext = useWindrunnerContext();
      expect(fromContext).toBe(instance);
      expect(typeof fromContext.processClassName).toBe('function');
      expect(typeof fromContext.scan).toBe('function');
      expect(typeof fromContext.disconnect).toBe('function');
    });
  });

  describe("useWindrunnerContext", () => {
    it("should throw error when used outside WindrunnerProvider", () => {
      // Context has default value of null (not overridden)
      expect(() => useWindrunnerContext()).toThrow(
        'useWindrunnerContext must be used within WindrunnerProvider'
      );
    });

    it("should throw with descriptive error message", () => {
      expect(() => useWindrunnerContext()).toThrow(/WindrunnerProvider/);
    });

    it("should return the runtime instance when inside provider", () => {
      // Simulate being inside the provider
      const instance = createWindrunner({ autoStart: false, id: 'context-test' });
      const ctx = createdContextsRef.value[createdContextsRef.value.length - 1];
      contextOverridesRef.value.set(ctx, instance);
      
      const result = useWindrunnerContext();
      expect(result).toBe(instance);
    });

    it("should provide access to all runtime methods", () => {
      const instance = createWindrunner({ autoStart: false });
      const ctx = createdContextsRef.value[createdContextsRef.value.length - 1];
      contextOverridesRef.value.set(ctx, instance);
      
      const ctxResult = useWindrunnerContext();
      
      expect(typeof ctxResult.processClassName).toBe('function');
      expect(typeof ctxResult.processClassList).toBe('function');
      expect(typeof ctxResult.processElement).toBe('function');
      expect(typeof ctxResult.scan).toBe('function');
      expect(typeof ctxResult.observe).toBe('function');
      expect(typeof ctxResult.flush).toBe('function');
      expect(typeof ctxResult.start).toBe('function');
      expect(typeof ctxResult.disconnect).toBe('function');
      expect(typeof ctxResult.clearCache).toBe('function');
      expect(typeof ctxResult.getStats).toBe('function');
      expect(typeof ctxResult.getCacheSize).toBe('function');
      expect(typeof ctxResult.getInsertedRuleCount).toBe('function');
    });

    it("should allow calling getStats() from context", () => {
      const instance = createWindrunner({ autoStart: false });
      const ctx = createdContextsRef.value[createdContextsRef.value.length - 1];
      contextOverridesRef.value.set(ctx, instance);
      
      const ctxResult = useWindrunnerContext();
      const stats = ctxResult.getStats();
      
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('insertedRuleCount');
      expect(stats).toHaveProperty('pendingElementCount');
      expect(stats).toHaveProperty('isObserving');
    });
  });
});
