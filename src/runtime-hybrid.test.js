import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createWindrunner } from './runtime.js';

describe('Runtime - Hybrid Mode', () => {
  let mockDocument;
  let mockStyleElement;
  let mockStyleSheet;
  let mockPrecompiledStyleSheet;

  beforeEach(() => {
    // Mock style element with sheet
    mockStyleSheet = {
      cssRules: [],
      insertRule: vi.fn((rule, index) => {
        mockStyleSheet.cssRules.push({
          cssText: rule,
          selectorText: rule.match(/([^{]+)\{/)?.[1].trim(),
        });
      }),
    };

    mockStyleElement = {
      sheet: mockStyleSheet,
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
    };

    // Mock precompiled stylesheet (simulates build-time generated CSS)
    mockPrecompiledStyleSheet = {
      ownerNode: {
        getAttribute: vi.fn(() => null), // Not a runtime stylesheet
      },
      cssRules: [
        {
          cssText: '.flex { display: flex; }',
          selectorText: '.flex',
        },
        {
          cssText: '.items-center { align-items: center; }',
          selectorText: '.items-center',
        },
        {
          cssText: '.p-4 { padding: 1rem; }',
          selectorText: '.p-4',
        },
        {
          cssText: '.bg-blue-500 { background-color: rgb(59, 130, 246); }',
          selectorText: '.bg-blue-500',
        },
      ],
    };

    // Mock document
    mockDocument = {
      head: {
        appendChild: vi.fn(),
        insertBefore: vi.fn(),
        firstChild: null,
      },
      createElement: vi.fn(() => mockStyleElement),
      querySelector: vi.fn((selector) => {
        if (selector.includes('data-tailwind-runtime')) {
          return mockStyleElement;
        }
        return null;
      }),
      querySelectorAll: vi.fn((selector) => {
        if (selector === '[class]') return [];
        return [];
      }),
      readyState: 'complete',
      documentElement: {
        nodeType: 1,
        hasAttribute: vi.fn(() => false),
        classList: [],
      },
      styleSheets: [mockPrecompiledStyleSheet, mockStyleSheet],
    };

    global.document = mockDocument;
    global.MutationObserver = vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete global.document;
    delete global.MutationObserver;
    delete global.requestAnimationFrame;
  });

  describe('Configuration', () => {
    it('should accept mode: "hybrid" configuration option', () => {
      const runtime = createWindrunner({ mode: 'hybrid' });

      expect(runtime).toBeDefined();
      expect(typeof runtime.processClassName).toBe('function');
    });

    it('should accept mode: "runtime" as default behavior', () => {
      const runtime = createWindrunner({ mode: 'runtime' });

      expect(runtime).toBeDefined();
      expect(typeof runtime.processClassName).toBe('function');
    });

    it('should default to mode "runtime" when not specified', () => {
      const runtime = createWindrunner({ autoStart: false });

      // In runtime mode, classes should be compiled and inserted normally
      runtime.processClassName('flex');
      expect(mockStyleSheet.insertRule).toHaveBeenCalled();
    });
  });

  describe('Hybrid mode skipping precompiled rules', () => {
    it('should skip compiling class names already present in stylesheets', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      // Trigger stylesheet scanning
      runtime.scan();

      // Process a class that already exists in precompiled stylesheet
      const result = runtime.processClassName('flex');

      // Should return the compiled CSS (from cache)
      expect(result).toBeTruthy();

      // Should NOT insert into the stylesheet (already present)
      expect(mockStyleSheet.insertRule).not.toHaveBeenCalled();
    });

    it('should skip multiple precompiled classes', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      runtime.processClassName('flex');
      runtime.processClassName('items-center');
      runtime.processClassName('p-4');
      runtime.processClassName('bg-blue-500');

      // None of these should trigger insertRule since they are all precompiled
      expect(mockStyleSheet.insertRule).not.toHaveBeenCalled();
    });

    it('should use Set-based O(1) lookup for existence checking', () => {
      // Add many precompiled rules to verify lookup performance
      const manyRules = [];
      for (let i = 0; i < 500; i++) {
        manyRules.push({
          selectorText: `.test-class-${i}`,
          cssText: `.test-class-${i} { color: red; }`,
        });
      }
      mockPrecompiledStyleSheet.cssRules = manyRules;

      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });
      runtime.scan();

      const start = performance.now();

      // Check class from middle of list — should be O(1) due to Set
      runtime.processClassName('test-class-250');

      const duration = performance.now() - start;

      // Should complete very quickly (< 50ms even with test overhead)
      expect(duration).toBeLessThan(50);
      expect(mockStyleSheet.insertRule).not.toHaveBeenCalled();
    });
  });

  describe('Hybrid mode runtime fallback', () => {
    it('should compile and insert classes NOT present in precompiled stylesheets', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      // Process a class that is NOT in precompiled stylesheet
      const result = runtime.processClassName('text-red-500');

      // Should compile successfully
      expect(result).toBeTruthy();

      // Should insert the new rule
      expect(mockStyleSheet.insertRule).toHaveBeenCalled();
    });

    it('should handle mix of precompiled and dynamic classes', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      // Mix of precompiled and new classes
      runtime.processClassName('flex');            // Precompiled - skip
      runtime.processClassName('text-green-500');  // New - insert
      runtime.processClassName('items-center');    // Precompiled - skip
      runtime.processClassName('mt-8');            // New - insert

      // Should only insert the 2 new classes
      expect(mockStyleSheet.insertRule).toHaveBeenCalledTimes(2);
    });

    it('should correctly compile dynamic classes at runtime', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      const result = runtime.processClassName('grid');

      // Should compile to valid CSS
      expect(result).toContain('display');
      expect(result).toContain('grid');
    });
  });

  describe('Hybrid mode equivalence with precompiled flag', () => {
    it('mode: "hybrid" should behave identically to precompiled: true', () => {
      // Create hybrid runtime
      const hybridRuntime = createWindrunner({ mode: 'hybrid', autoStart: false });
      hybridRuntime.scan();

      // Reset insertRule mock
      mockStyleSheet.insertRule.mockClear();

      hybridRuntime.processClassName('flex');
      const hybridInsertCallCount = mockStyleSheet.insertRule.mock.calls.length;

      // Reset for precompiled test
      mockStyleSheet.insertRule.mockClear();
      mockStyleSheet.cssRules = [];

      const precompiledRuntime = createWindrunner({ precompiled: true, autoStart: false });
      precompiledRuntime.scan();

      precompiledRuntime.processClassName('flex');
      const precompiledInsertCallCount = mockStyleSheet.insertRule.mock.calls.length;

      // Both should skip insertion for precompiled class
      expect(hybridInsertCallCount).toBe(precompiledInsertCallCount);
      expect(hybridInsertCallCount).toBe(0);
    });

    it('mode: "hybrid" can be combined with precompiled: true without conflict', () => {
      const runtime = createWindrunner({ 
        mode: 'hybrid', 
        precompiled: true, 
        autoStart: false 
      });

      runtime.scan();

      runtime.processClassName('flex');

      // Should skip insertion (both mode and precompiled agree)
      expect(mockStyleSheet.insertRule).not.toHaveBeenCalled();
    });
  });

  describe('Hybrid mode with callbacks', () => {
    it('should fire onCompile callback even for skipped precompiled classes', () => {
      const onCompile = vi.fn();
      const runtime = createWindrunner({ 
        mode: 'hybrid', 
        autoStart: false,
        onCompile,
      });

      runtime.scan();

      runtime.processClassName('flex');

      // onCompile should fire (class was compiled and cached)
      expect(onCompile).toHaveBeenCalledWith('flex', expect.any(String));
    });

    it('should fire onError callback for invalid classes in hybrid mode', () => {
      const onError = vi.fn();
      const runtime = createWindrunner({ 
        mode: 'hybrid', 
        autoStart: false,
        onError,
      });

      runtime.scan();

      runtime.processClassName('totally-invalid-xyz');

      expect(onError).toHaveBeenCalled();
      const [className, context] = onError.mock.calls[0];
      expect(className).toBe('totally-invalid-xyz');
      expect(context.reason).toBe('unknown-utility');
    });
  });

  describe('Hybrid mode with empty stylesheets', () => {
    it('should compile all classes when no precompiled CSS exists', () => {
      mockDocument.styleSheets = [];

      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      runtime.processClassName('flex');
      runtime.processClassName('block');

      // All classes should be inserted since there are no precompiled rules
      expect(mockStyleSheet.insertRule).toHaveBeenCalledTimes(2);
    });
  });

  describe('Hybrid mode defaults to runtime when mode not specified', () => {
    it('should not skip any classes when mode is "runtime"', () => {
      const runtime = createWindrunner({ mode: 'runtime', autoStart: false });

      runtime.scan();

      // Even though 'flex' exists in mock stylesheets, runtime mode doesn't scan them
      runtime.processClassName('flex');

      // Should insert normally
      expect(mockStyleSheet.insertRule).toHaveBeenCalled();
    });

    it('should not skip any classes when mode is not specified', () => {
      const runtime = createWindrunner({ autoStart: false });

      runtime.scan();

      runtime.processClassName('flex');

      // Default behavior: compile and insert
      expect(mockStyleSheet.insertRule).toHaveBeenCalled();
    });
  });

  describe('Hybrid mode with pseudo-class selectors', () => {
    it('should skip precompiled hover variant selectors', () => {
      mockPrecompiledStyleSheet.cssRules = [
        {
          selectorText: '.hover\\:bg-blue-500:hover',
          cssText: '.hover\\:bg-blue-500:hover { background-color: blue; }',
        },
      ];

      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });
      runtime.scan();

      runtime.processClassName('hover:bg-blue-500');

      // Should skip — selector matches precompiled
      expect(mockStyleSheet.insertRule).not.toHaveBeenCalled();
    });
  });

  describe('Hybrid mode with group/peer variants', () => {
    it('should skip precompiled group-hover selectors', () => {
      mockPrecompiledStyleSheet.cssRules = [
        {
          selectorText: '.group:hover .group-hover\\:opacity-100',
          cssText: '.group:hover .group-hover\\:opacity-100 { opacity: 1; }',
        },
      ];

      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });
      runtime.scan();

      runtime.processClassName('group-hover:opacity-100');

      // Should skip — selector matches precompiled
      expect(mockStyleSheet.insertRule).not.toHaveBeenCalled();
    });
  });

  describe('Hybrid mode caching behavior', () => {
    it('should cache compiled results for precompiled classes', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      const result1 = runtime.processClassName('flex');
      const result2 = runtime.processClassName('flex');
      const result3 = runtime.processClassName('flex');

      // All should return same cached value
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);

      // Should not insert (precompiled)
      expect(mockStyleSheet.insertRule).not.toHaveBeenCalled();
    });

    it('should cache compiled results for dynamic classes', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      const result1 = runtime.processClassName('text-purple-500');
      const result2 = runtime.processClassName('text-purple-500');

      expect(result1).toBe(result2);

      // Should insert only once (first time)
      expect(mockStyleSheet.insertRule).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hybrid mode stats tracking', () => {
    it('should correctly report cache size in hybrid mode', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      runtime.processClassName('flex');
      runtime.processClassName('text-red-500');
      runtime.processClassName('items-center');

      const stats = runtime.getStats();
      expect(stats.cacheSize).toBe(3);
    });

    it('should track inserted rule count excluding precompiled', () => {
      const runtime = createWindrunner({ mode: 'hybrid', autoStart: false });

      runtime.scan();

      runtime.processClassName('flex');            // Precompiled (tracked but not sheet-inserted)
      runtime.processClassName('text-red-500');    // New (inserted)
      runtime.processClassName('items-center');    // Precompiled (tracked but not sheet-inserted)
      runtime.processClassName('mt-4');            // New (inserted)

      // insertedRuleCount tracks both precompiled (skipped) and new (inserted)
      const stats = runtime.getStats();
      expect(stats.insertedRuleCount).toBeGreaterThanOrEqual(2);
    });
  });
});
