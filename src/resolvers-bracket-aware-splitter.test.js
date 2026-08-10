/**
 * Tests for splitByVariantDelimiterBracketAware() - bracket-aware variant delimiter splitting
 * Requirement 7.3: Parse arbitrary variants using bracket-aware delimiter splitting
 * to correctly handle nested brackets
 * 
 * This function is critical for parsing arbitrary variants like:
 * - [@media(min-width:768px)]:bg-blue-500
 * - [@media(hover:hover)]:underline
 * - [&>span]:text-red-500
 * 
 * The colon inside brackets should NOT be treated as a variant delimiter.
 */

import { describe, it, expect } from 'vitest';
import { splitByVariantDelimiterBracketAware, splitByVariantDelimiter } from './resolvers.js';

describe('splitByVariantDelimiterBracketAware - bracket-aware splitting', () => {
  // Note: Testing both the new explicit name and the legacy alias
  const testFunction = splitByVariantDelimiterBracketAware;
  describe('basic variant splitting', () => {
    it('should split simple variants by colon', () => {
      const result = testFunction('hover:bg-blue-500');
      expect(result).toEqual(['hover', 'bg-blue-500']);
    });

    it('should split multiple variants', () => {
      const result = testFunction('md:hover:bg-blue-500');
      expect(result).toEqual(['md', 'hover', 'bg-blue-500']);
    });

    it('should split responsive and state variants', () => {
      const result = testFunction('lg:focus:text-red-500');
      expect(result).toEqual(['lg', 'focus', 'text-red-500']);
    });

    it('should handle single token without variants', () => {
      const result = testFunction('bg-blue-500');
      expect(result).toEqual(['bg-blue-500']);
    });
  });

  describe('arbitrary value with colons', () => {
    it('should not split on colons inside brackets - arbitrary color', () => {
      const result = testFunction('bg-[rgb(255:128:64)]');
      expect(result).toEqual(['bg-[rgb(255:128:64)]']);
    });

    it('should not split on colons inside brackets - arbitrary spacing', () => {
      const result = testFunction('p-[calc(100vw:2)]');
      expect(result).toEqual(['p-[calc(100vw:2)]']);
    });

    it('should handle variants with arbitrary values containing colons', () => {
      const result = testFunction('hover:bg-[hsl(200:50%:50%)]');
      expect(result).toEqual(['hover', 'bg-[hsl(200:50%:50%)]']);
    });

    it('should handle multiple variants with arbitrary values', () => {
      const result = testFunction('md:hover:bg-[oklch(0.5:0.2:180)]');
      expect(result).toEqual(['md', 'hover', 'bg-[oklch(0.5:0.2:180)]']);
    });
  });

  describe('arbitrary media query variants', () => {
    it('should not split on colons inside [@media(...)] - min-width', () => {
      const result = testFunction('[@media(min-width:768px)]:bg-blue-500');
      expect(result).toEqual(['[@media(min-width:768px)]', 'bg-blue-500']);
    });

    it('should not split on colons inside [@media(...)] - hover capability', () => {
      const result = testFunction('[@media(hover:hover)]:underline');
      expect(result).toEqual(['[@media(hover:hover)]', 'underline']);
    });

    it('should not split on colons inside [@media(...)] - prefers-reduced-motion', () => {
      const result = testFunction('[@media(prefers-reduced-motion:reduce)]:transition-none');
      expect(result).toEqual(['[@media(prefers-reduced-motion:reduce)]', 'transition-none']);
    });

    it('should handle media queries with multiple colons', () => {
      const result = testFunction('[@media(min-width:768px)and(max-width:1024px)]:block');
      expect(result).toEqual(['[@media(min-width:768px)and(max-width:1024px)]', 'block']);
    });

    it('should handle media query with standard variant', () => {
      const result = testFunction('[@media(hover:hover)]:hover:bg-blue-500');
      expect(result).toEqual(['[@media(hover:hover)]', 'hover', 'bg-blue-500']);
    });

    it('should handle multiple arbitrary media variants', () => {
      const result = testFunction('[@media(hover:hover)]:[@media(prefers-color-scheme:dark)]:bg-gray-900');
      expect(result).toEqual([
        '[@media(hover:hover)]',
        '[@media(prefers-color-scheme:dark)]',
        'bg-gray-900'
      ]);
    });
  });

  describe('arbitrary selector variants', () => {
    it('should not split on colons inside [&...] selector', () => {
      const result = testFunction('[&>span]:text-red-500');
      expect(result).toEqual(['[&>span]', 'text-red-500']);
    });

    it('should handle selector with pseudo-class containing colon', () => {
      const result = testFunction('[&:hover]:underline');
      expect(result).toEqual(['[&:hover]', 'underline']);
    });

    it('should handle selector with descendant combinator', () => {
      const result = testFunction('[&_p]:font-bold');
      expect(result).toEqual(['[&_p]', 'font-bold']);
    });

    it('should handle complex selector with multiple colons', () => {
      const result = testFunction('[&>div:first-child:hover]:bg-blue-500');
      expect(result).toEqual(['[&>div:first-child:hover]', 'bg-blue-500']);
    });

    it('should handle arbitrary selector with standard variants', () => {
      const result = testFunction('md:[&>span]:text-red-500');
      expect(result).toEqual(['md', '[&>span]', 'text-red-500']);
    });
  });

  describe('arbitrary container queries', () => {
    it('should not split on colons inside [@container(...)]', () => {
      const result = testFunction('[@container(min-width:400px)]:grid');
      expect(result).toEqual(['[@container(min-width:400px)]', 'grid']);
    });

    it('should handle container query with standard variant', () => {
      const result = testFunction('[@container(min-width:400px)]:hover:bg-gray-100');
      expect(result).toEqual(['[@container(min-width:400px)]', 'hover', 'bg-gray-100']);
    });
  });

  describe('arbitrary supports queries', () => {
    it('should not split on colons inside [@supports(...)]', () => {
      const result = testFunction('[@supports(display:grid)]:grid');
      expect(result).toEqual(['[@supports(display:grid)]', 'grid']);
    });

    it('should handle supports query with standard variant', () => {
      const result = testFunction('[@supports(backdrop-filter:blur(10px))]:backdrop-blur-xl');
      expect(result).toEqual(['[@supports(backdrop-filter:blur(10px))]', 'backdrop-blur-xl']);
    });
  });

  describe('nested brackets', () => {
    it('should handle nested brackets in arbitrary values', () => {
      const result = testFunction('bg-[url(data:image/svg+xml;base64,abc)]');
      expect(result).toEqual(['bg-[url(data:image/svg+xml;base64,abc)]']);
    });

    it('should handle deeply nested brackets', () => {
      const result = testFunction('bg-[calc(100%:var(--custom:[nested]))]');
      expect(result).toEqual(['bg-[calc(100%:var(--custom:[nested]))]']);
    });

    it('should handle multiple levels of bracket nesting in media query', () => {
      const result = testFunction('[@media(min-width:calc(100vw:[2]))]:block');
      expect(result).toEqual(['[@media(min-width:calc(100vw:[2]))]', 'block']);
    });

    it('should handle arbitrary selector with nested pseudo-classes', () => {
      const result = testFunction('[&:has([data-state:open])]:block');
      expect(result).toEqual(['[&:has([data-state:open])]', 'block']);
    });
  });

  describe('complex combinations', () => {
    it('should handle responsive + arbitrary media + arbitrary selector', () => {
      const result = testFunction('md:[@media(hover:hover)]:[&>span]:text-blue-500');
      expect(result).toEqual([
        'md',
        '[@media(hover:hover)]',
        '[&>span]',
        'text-blue-500'
      ]);
    });

    it('should handle all types of arbitrary variants together', () => {
      const result = testFunction('[@media(hover:hover)]:[@supports(display:grid)]:[&>div]:grid');
      expect(result).toEqual([
        '[@media(hover:hover)]',
        '[@supports(display:grid)]',
        '[&>div]',
        'grid'
      ]);
    });

    it('should handle standard variants mixed with arbitrary variants', () => {
      const result = testFunction('lg:hover:[@media(prefers-color-scheme:dark)]:[&>button]:bg-gray-800');
      expect(result).toEqual([
        'lg',
        'hover',
        '[@media(prefers-color-scheme:dark)]',
        '[&>button]',
        'bg-gray-800'
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = testFunction('');
      expect(result).toEqual(['']);
    });

    it('should handle single colon', () => {
      const result = testFunction(':');
      expect(result).toEqual(['', '']);
    });

    it('should handle multiple consecutive colons', () => {
      const result = testFunction('a::b');
      expect(result).toEqual(['a', '', 'b']);
    });

    it('should handle trailing colon', () => {
      const result = testFunction('hover:');
      expect(result).toEqual(['hover', '']);
    });

    it('should handle leading colon', () => {
      const result = testFunction(':bg-blue-500');
      expect(result).toEqual(['', 'bg-blue-500']);
    });

    it('should handle unmatched opening bracket', () => {
      // This is malformed, but function should handle gracefully
      const result = testFunction('bg-[color:red');
      expect(result).toEqual(['bg-[color:red']);
    });

    it('should handle unmatched closing bracket', () => {
      // This is malformed, but function should handle gracefully
      const result = testFunction('bg-color:red]');
      expect(result).toEqual(['bg-color', 'red]']);
    });

    it('should handle multiple unmatched brackets', () => {
      const result = testFunction('[[[bg-blue-500');
      expect(result).toEqual(['[[[bg-blue-500']);
    });

    it('should decrement bracket depth safely (never go below 0)', () => {
      // Extra closing brackets should not break the parsing
      const result = testFunction('bg-]blue]:500');
      expect(result).toEqual(['bg-]blue]', '500']);
    });
  });

  describe('real-world examples from design document', () => {
    it('should handle example from section 7.3 - media query with colon', () => {
      const result = testFunction('[@media(min-width:768px)]:bg-blue-500');
      expect(result).toEqual(['[@media(min-width:768px)]', 'bg-blue-500']);
    });

    it('should handle example from section 7.5 - arbitrary selector', () => {
      const result = testFunction('[&>span]:text-red-500');
      expect(result).toEqual(['[&>span]', 'text-red-500']);
    });

    it('should handle example from section 7.6 - multiple arbitrary variants', () => {
      const result = testFunction('[@media(hover:hover)]:[&>span]:hover:text-blue-500');
      expect(result).toEqual([
        '[@media(hover:hover)]',
        '[&>span]',
        'hover',
        'text-blue-500'
      ]);
    });
  });

  describe('performance characteristics', () => {
    it('should handle long class names efficiently', () => {
      const longClass = 'md:lg:xl:2xl:hover:focus:active:group-hover:peer-checked:has-[:focus]:data-[state=open]:aria-[expanded=true]:[@media(min-width:768px)]:[@supports(display:grid)]:[&>div>span>p]:bg-gradient-to-r:from-blue-500:via-purple-500:to-pink-500';
      const result = testFunction(longClass);
      
      // Should successfully parse all variants
      expect(result.length).toBeGreaterThan(10);
      // Last element should be the gradient utility
      expect(result[result.length - 1]).toContain('to-pink-500');
    });

    it('should handle deeply nested brackets without stack overflow', () => {
      const deeplyNested = 'bg-[calc(100%:[[[nested:value]]])]';
      const result = testFunction(deeplyNested);
      expect(result).toEqual(['bg-[calc(100%:[[[nested:value]]])]']);
    });
  });

  describe('bracket depth tracking', () => {
    it('should correctly track increasing bracket depth', () => {
      const result = testFunction('[a[b[c]:d]:e]:utility');
      expect(result).toEqual(['[a[b[c]:d]:e]', 'utility']);
    });

    it('should correctly track decreasing bracket depth', () => {
      const result = testFunction('[a[b]c]]:utility');
      expect(result).toEqual(['[a[b]c]]', 'utility']);
    });

    it('should split after bracket depth returns to 0', () => {
      const result = testFunction('[a:b]:md:[c:d]:utility');
      expect(result).toEqual(['[a:b]', 'md', '[c:d]', 'utility']);
    });
  });

  describe('compliance with Requirement 7.3', () => {
    it('should only split on colons outside of bracket context', () => {
      // Inside brackets: should NOT split
      const insideBrackets = testFunction('[@media(min-width:768px)]');
      expect(insideBrackets).toEqual(['[@media(min-width:768px)]']);

      // Outside brackets: should split
      const outsideBrackets = testFunction('md:hover:bg-blue');
      expect(outsideBrackets).toEqual(['md', 'hover', 'bg-blue']);

      // Mixed: split only outside brackets
      const mixed = testFunction('md:[@media(min-width:768px)]:hover');
      expect(mixed).toEqual(['md', '[@media(min-width:768px)]', 'hover']);
    });

    it('should correctly handle nested brackets in arbitrary variants', () => {
      const result = testFunction('[@media(min-width:calc(100vw:[2]))]:bg-blue-500');
      expect(result).toEqual([
        '[@media(min-width:calc(100vw:[2]))]',
        'bg-blue-500'
      ]);
    });
  });

  describe('backward compatibility - legacy alias', () => {
    it('should work with splitByVariantDelimiter alias', () => {
      const result = splitByVariantDelimiter('[@media(min-width:768px)]:bg-blue-500');
      expect(result).toEqual(['[@media(min-width:768px)]', 'bg-blue-500']);
    });

    it('should produce identical results for both functions', () => {
      const testCases = [
        'hover:bg-blue-500',
        'md:hover:bg-blue-500',
        '[@media(min-width:768px)]:bg-blue-500',
        '[&>span]:text-red-500',
        'bg-[rgb(255:128:64)]'
      ];

      testCases.forEach(testCase => {
        const newResult = splitByVariantDelimiterBracketAware(testCase);
        const oldResult = splitByVariantDelimiter(testCase);
        expect(newResult).toEqual(oldResult);
      });
    });
  });
});
