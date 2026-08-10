/**
 * Integration tests for arbitrary variant CSS generation
 * Tests the full compilation pipeline from class name to CSS rule
 * Requirements: 7.4, 7.5, 7.6, 7.7, 7.8
 */

import { describe, it, expect } from 'vitest';
import { compileClass } from './compiler.js';

describe('Arbitrary Variants - Integration Tests', () => {
  describe('arbitrary selector variants', () => {
    it('should compile [&>span]:text-red-500 to child selector CSS', () => {
      const css = compileClass('[&>span]:text-red-500');
      // The selector should contain the & replaced by the escaped class selector,
      // followed by >span
      expect(css).toContain('>span');
      expect(css).toContain('color:');
    });

    it('should compile [& p]:font-bold to descendant selector CSS', () => {
      const css = compileClass('[& p]:font-bold');
      expect(css).toContain(' p');
      expect(css).toContain('font-weight:');
    });

    it('should compile [&_a]:underline to descendant selector with underscore', () => {
      const css = compileClass('[&_a]:underline');
      expect(css).toContain('_a');
      expect(css).toContain('text-decoration');
    });

    it('should compile [&:hover]:bg-blue-500 to pseudo-class selector', () => {
      const css = compileClass('[&:hover]:bg-blue-500');
      expect(css).toContain(':hover');
      expect(css).toContain('background-color:');
    });

    it('should compile [&::before]:content-[""] to pseudo-element selector', () => {
      const css = compileClass('[&::before]:content-[""]');
      expect(css).toContain('::before');
      expect(css).toContain('content:');
    });

    it('should compile [&>button:hover]:scale-110 to complex selector', () => {
      const css = compileClass('[&>button:hover]:scale-110');
      expect(css).toContain('>button:hover');
      expect(css).toContain('transform:');
    });

    it('should compile [&+div]:mt-4 to adjacent sibling combinator', () => {
      const css = compileClass('[&+div]:mt-4');
      expect(css).toContain('+div');
      expect(css).toContain('margin-top:');
    });

    it('should compile [&~p]:text-gray-600 to general sibling combinator', () => {
      const css = compileClass('[&~p]:text-gray-600');
      expect(css).toContain('~p');
      expect(css).toContain('color:');
    });
  });

  describe('arbitrary media query variants', () => {
    it('should compile [@media(hover:hover)]:hover:underline to media query wrapper', () => {
      const css = compileClass('[@media(hover:hover)]:hover:underline');
      expect(css).toContain('@media (hover:hover)');
      expect(css).toContain(':hover');
      expect(css).toContain('text-decoration');
    });

    it('should compile [@media(min-width:768px)]:bg-blue-500 to min-width media query', () => {
      const css = compileClass('[@media(min-width:768px)]:bg-blue-500');
      expect(css).toContain('@media (min-width:768px)');
      expect(css).toContain('background-color:');
    });

    it('should compile [@media(prefers-reduced-motion)]:transition-none', () => {
      const css = compileClass('[@media(prefers-reduced-motion)]:transition-none');
      expect(css).toContain('@media (prefers-reduced-motion)');
      expect(css).toContain('transition-property:');
    });

    it('should compile [@media(prefers-color-scheme:dark)]:bg-gray-900', () => {
      const css = compileClass('[@media(prefers-color-scheme:dark)]:bg-gray-900');
      expect(css).toContain('@media (prefers-color-scheme:dark)');
      expect(css).toContain('background-color:');
    });

    it('should compile [@media(orientation:landscape)]:w-full', () => {
      const css = compileClass('[@media(orientation:landscape)]:w-full');
      expect(css).toContain('@media (orientation:landscape)');
      expect(css).toContain('width:');
    });
  });

  describe('arbitrary container query variants', () => {
    it('should compile [@container(min-width:768px)]:text-lg', () => {
      const css = compileClass('[@container(min-width:768px)]:text-lg');
      expect(css).toContain('@container (min-width:768px)');
      expect(css).toContain('font-size:');
    });

    it('should compile [@container(max-width:1024px)]:hidden', () => {
      const css = compileClass('[@container(max-width:1024px)]:hidden');
      expect(css).toContain('@container (max-width:1024px)');
      expect(css).toContain('display:');
    });
  });

  describe('arbitrary supports query variants', () => {
    it('should compile [@supports(display:grid)]:grid', () => {
      const css = compileClass('[@supports(display:grid)]:grid');
      expect(css).toContain('@supports (display:grid)');
      expect(css).toContain('display:');
    });

    it('should compile [@supports(backdrop-filter:blur(1px))]:backdrop-blur-sm', () => {
      const css = compileClass('[@supports(backdrop-filter:blur(1px))]:backdrop-blur-sm');
      expect(css).toContain('@supports (backdrop-filter:blur(1px))');
      expect(css).toContain('backdrop-filter:');
    });

    it('should compile [@supports(not(display:grid))]:flex', () => {
      const css = compileClass('[@supports(not(display:grid))]:flex');
      expect(css).toContain('@supports (not(display:grid))');
      expect(css).toContain('display:');
    });
  });

  describe('multiple arbitrary variants - order preservation (Req 7.7)', () => {
    it('should apply multiple arbitrary variants in order', () => {
      const css = compileClass('[@media(hover:hover)]:[&>span]:hover:text-blue-500');
      
      // Should contain both the media query and the selector transformation
      expect(css).toContain('@media (hover:hover)');
      expect(css).toContain('>span');
      expect(css).toContain(':hover');
      expect(css).toContain('color:');
    });

    it('should preserve order with multiple at-rule wrappers', () => {
      const css = compileClass('[@media(hover:hover)]:[@supports(display:grid)]:grid');
      
      // The left-most wrapper (@media) should be outermost in the CSS
      expect(css).toContain('@media (hover:hover)');
      expect(css).toContain('@supports (display:grid)');
      expect(css).toContain('display:');
      
      // Check correct nesting order (media wraps supports)
      const mediaIndex = css.indexOf('@media (hover:hover)');
      const supportsIndex = css.indexOf('@supports (display:grid)');
      expect(mediaIndex).toBeLessThan(supportsIndex);
    });

    it('should combine arbitrary selector with arbitrary media query', () => {
      const css = compileClass('[&>button]:[@media(hover:hover)]:hover:bg-blue-500');
      
      expect(css).toContain('>button');
      expect(css).toContain('@media (hover:hover)');
      expect(css).toContain(':hover');
      expect(css).toContain('background-color:');
    });
  });

  describe('combining arbitrary variants with standard variants', () => {
    it('should combine arbitrary selector with hover', () => {
      const css = compileClass('[&>span]:hover:text-red-500');
      expect(css).toContain('>span');
      expect(css).toContain(':hover');
      expect(css).toContain('color:');
    });

    it('should combine arbitrary media with focus variant', () => {
      const css = compileClass('[@media(hover:hover)]:focus:ring-2');
      expect(css).toContain('@media (hover:hover)');
      expect(css).toContain(':focus');
      expect(css).toContain('box-shadow:');
    });

    it('should combine arbitrary selector with responsive breakpoint', () => {
      const css = compileClass('md:[&>img]:w-full');
      
      // Should have both responsive media query AND arbitrary selector
      expect(css).toContain('@media');
      expect(css).toContain('>img');
      expect(css).toContain('width:');
    });

    it('should combine arbitrary variants with important modifier', () => {
      const css = compileClass('[&>div]:!hidden');
      expect(css).toContain('>div');
      expect(css).toContain('display:');
      expect(css).toContain('!important');
    });
  });

  describe('ampersand replacement in complex scenarios', () => {
    it('should replace multiple & occurrences', () => {
      const css = compileClass('[&:hover&:focus]:ring-2');
      // The & should be replaced with the escaped class selector
      expect(css).toContain(':hover');
      expect(css).toContain(':focus');
      expect(css).toContain('box-shadow:');
    });

    it('should handle & with attribute selectors', () => {
      const css = compileClass('[&[data-active]]:bg-blue-500');
      expect(css).toContain('[data-active]');
      expect(css).toContain('background-color:');
    });

    it('should handle & with class selectors', () => {
      const css = compileClass('[&.active]:font-bold');
      expect(css).toContain('.active');
      expect(css).toContain('font-weight:');
    });

    it('should handle & with ID selectors', () => {
      const css = compileClass('[&#main]:text-lg');
      expect(css).toContain('#main');
      expect(css).toContain('font-size:');
    });

    it('should handle & with nth-child', () => {
      const css = compileClass('[&:nth-child(2n)]:bg-gray-100');
      expect(css).toContain(':nth-child(2n)');
      expect(css).toContain('background-color:');
    });

    it('should handle complex combinator chains', () => {
      const css = compileClass('[&>div+p~span]:text-red-500');
      expect(css).toContain('>div+p~span');
      expect(css).toContain('color:');
    });
  });

  describe('wrapper generation integration (Req 7.5)', () => {
    it('should generate media wrapper that wraps the CSS rule', () => {
      const css = compileClass('[@media(hover:hover)]:underline');
      
      // Media query should wrap the entire rule
      expect(css).toMatch(/@media \(hover:hover\) \{.*?\}/s);
    });

    it('should generate container wrapper that wraps the CSS rule', () => {
      const css = compileClass('[@container(min-width:768px)]:text-lg');
      
      // Container query should wrap the entire rule
      expect(css).toMatch(/@container \(min-width:768px\) \{.*?\}/s);
    });

    it('should generate supports wrapper that wraps the CSS rule', () => {
      const css = compileClass('[@supports(display:grid)]:grid');
      
      // Supports query should wrap the entire rule
      expect(css).toMatch(/@supports \(display:grid\) \{.*?\}/s);
    });

    it('should nest wrappers correctly', () => {
      const css = compileClass('[@media(hover:hover)]:[@container(min-width:768px)]:text-lg');
      
      // Should have both media and container, properly nested
      expect(css).toContain('@media (hover:hover)');
      expect(css).toContain('@container (min-width:768px)');
      
      // Media should wrap container
      const structure = css.match(/@media.*?@container.*?\}/s);
      expect(structure).toBeTruthy();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle arbitrary variant without base utility (invalid)', () => {
      const css = compileClass('[&>span]');
      // Should not compile (no base utility)
      expect(css).toBe('');
    });

    it('should handle arbitrary variant with unknown utility', () => {
      const css = compileClass('[&>span]:unknown-utility');
      // Should not compile (unknown utility)
      expect(css).toBe('');
    });

    it('should handle malformed arbitrary variants gracefully', () => {
      const css = compileClass('[&>span:text-red-500'); // Missing closing bracket
      // Should not compile due to parse error
      expect(css).toBe('');
    });

    it('should handle empty arbitrary variant brackets', () => {
      const css = compileClass('[]:text-red-500');
      // Should not compile (empty brackets)
      expect(css).toBe('');
    });
  });

  describe('complex real-world scenarios', () => {
    it('should compile responsive arbitrary selector variant', () => {
      const css = compileClass('lg:[&>img]:w-1/2');
      
      expect(css).toContain('@media');
      expect(css).toContain('>img');
      expect(css).toContain('width:');
    });

    it('should compile hover-capable device detection', () => {
      const css = compileClass('[@media(hover:hover)]:[&>button]:hover:scale-110');
      
      expect(css).toContain('@media (hover:hover)');
      expect(css).toContain('>button');
      expect(css).toContain(':hover');
      expect(css).toContain('transform:');
    });

    it('should compile grid fallback with supports query', () => {
      const css = compileClass('[@supports(not(display:grid))]:flex');
      
      expect(css).toContain('@supports (not(display:grid))');
      expect(css).toContain('display:');
    });

    it('should compile container-based responsive typography', () => {
      const css = compileClass('[@container(min-width:768px)]:text-2xl');
      
      expect(css).toContain('@container (min-width:768px)');
      expect(css).toContain('font-size:');
    });

    it('should combine multiple arbitrary variants with standard variants', () => {
      const css = compileClass('md:[@media(hover:hover)]:[&>button]:hover:focus:bg-blue-600');
      
      // Should have responsive breakpoint
      expect(css).toContain('@media');
      
      // Should have arbitrary media query
      expect(css).toContain('(hover:hover)');
      
      // Should have arbitrary selector
      expect(css).toContain('>button');
      
      // Should have standard variants
      expect(css).toContain(':hover');
      expect(css).toContain(':focus');
      
      // Should have utility
      expect(css).toContain('background-color:');
    });
  });

  describe('at-rule nesting order verification', () => {
    it('should nest arbitrary media inside responsive breakpoint', () => {
      const css = compileClass('md:[@media(hover:hover)]:text-red-500');
      
      // Responsive breakpoint (@media min-width) should be outermost
      const firstMedia = css.indexOf('@media');
      const hoverMedia = css.indexOf('(hover:hover)');
      
      expect(firstMedia).toBeLessThan(hoverMedia);
    });

    it('should preserve order of multiple arbitrary at-rules', () => {
      const css = compileClass('[@media(hover:hover)]:[@supports(display:grid)]:[@container(min-width:768px)]:grid');
      
      // Left-to-right order: media (outermost), supports, container (innermost)
      const mediaIndex = css.indexOf('@media (hover:hover)');
      const supportsIndex = css.indexOf('@supports (display:grid)');
      const containerIndex = css.indexOf('@container (min-width:768px)');
      
      expect(mediaIndex).toBeGreaterThanOrEqual(0);
      expect(supportsIndex).toBeGreaterThanOrEqual(0);
      expect(containerIndex).toBeGreaterThanOrEqual(0);
      expect(mediaIndex).toBeLessThan(supportsIndex);
      expect(supportsIndex).toBeLessThan(containerIndex);
    });
  });
});
