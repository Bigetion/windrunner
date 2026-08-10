/**
 * Tests for parseArbitraryVariant() and applyArbitraryVariant() functions
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7
 */

import { describe, it, expect } from 'vitest';
import { parseArbitraryVariant, applyArbitraryVariant } from './resolvers.js';

describe('parseArbitraryVariant', () => {
  describe('arbitrary selector variants', () => {
    it('should parse [&>selector] pattern', () => {
      const result = parseArbitraryVariant('[&>span]');
      expect(result).toEqual({
        type: 'selector',
        content: '&>span'
      });
    });

    it('should parse [& selector] pattern with space', () => {
      const result = parseArbitraryVariant('[& p]');
      expect(result).toEqual({
        type: 'selector',
        content: '& p'
      });
    });

    it('should parse [&_selector] pattern with underscore', () => {
      const result = parseArbitraryVariant('[&_a]');
      expect(result).toEqual({
        type: 'selector',
        content: '&_a'
      });
    });

    it('should parse [&:pseudo-class] pattern', () => {
      const result = parseArbitraryVariant('[&:hover]');
      expect(result).toEqual({
        type: 'selector',
        content: '&:hover'
      });
    });

    it('should parse [&::pseudo-element] pattern', () => {
      const result = parseArbitraryVariant('[&::before]');
      expect(result).toEqual({
        type: 'selector',
        content: '&::before'
      });
    });

    it('should parse complex arbitrary selectors', () => {
      const result = parseArbitraryVariant('[&>button:hover]');
      expect(result).toEqual({
        type: 'selector',
        content: '&>button:hover'
      });
    });

    it('should parse arbitrary selector with multiple descendants', () => {
      const result = parseArbitraryVariant('[&>div>span]');
      expect(result).toEqual({
        type: 'selector',
        content: '&>div>span'
      });
    });

    it('should parse arbitrary selector with adjacent sibling combinator', () => {
      const result = parseArbitraryVariant('[&+div]');
      expect(result).toEqual({
        type: 'selector',
        content: '&+div'
      });
    });

    it('should parse arbitrary selector with general sibling combinator', () => {
      const result = parseArbitraryVariant('[&~p]');
      expect(result).toEqual({
        type: 'selector',
        content: '&~p'
      });
    });
  });

  describe('arbitrary media query variants', () => {
    it('should parse [@media(...)] pattern', () => {
      const result = parseArbitraryVariant('[@media(hover:hover)]');
      expect(result).toEqual({
        type: 'media',
        content: '(hover:hover)'
      });
    });

    it('should parse [@media(...)] with min-width', () => {
      const result = parseArbitraryVariant('[@media(min-width:768px)]');
      expect(result).toEqual({
        type: 'media',
        content: '(min-width:768px)'
      });
    });

    it('should parse [@media(...)] with complex queries', () => {
      const result = parseArbitraryVariant('[@media(prefers-reduced-motion)]');
      expect(result).toEqual({
        type: 'media',
        content: '(prefers-reduced-motion)'
      });
    });

    it('should parse [@media(...)] with prefers-color-scheme', () => {
      const result = parseArbitraryVariant('[@media(prefers-color-scheme:dark)]');
      expect(result).toEqual({
        type: 'media',
        content: '(prefers-color-scheme:dark)'
      });
    });

    it('should parse [@media(...)] with orientation', () => {
      const result = parseArbitraryVariant('[@media(orientation:landscape)]');
      expect(result).toEqual({
        type: 'media',
        content: '(orientation:landscape)'
      });
    });

    it('should parse [@media(...)] with print media type', () => {
      const result = parseArbitraryVariant('[@media print]');
      expect(result).toEqual({
        type: 'media',
        content: 'print'
      });
    });

    it('should parse [@media(...)] with screen media type', () => {
      const result = parseArbitraryVariant('[@media screen]');
      expect(result).toEqual({
        type: 'media',
        content: 'screen'
      });
    });
  });

  describe('arbitrary container query variants', () => {
    it('should parse [@container(...)] pattern', () => {
      const result = parseArbitraryVariant('[@container(min-width:768px)]');
      expect(result).toEqual({
        type: 'container',
        content: '(min-width:768px)'
      });
    });

    it('should parse [@container(...)] with max-width', () => {
      const result = parseArbitraryVariant('[@container(max-width:1024px)]');
      expect(result).toEqual({
        type: 'container',
        content: '(max-width:1024px)'
      });
    });

    it('should parse [@container(...)] with aspect-ratio', () => {
      const result = parseArbitraryVariant('[@container(aspect-ratio>1)]');
      expect(result).toEqual({
        type: 'container',
        content: '(aspect-ratio>1)'
      });
    });
  });

  describe('arbitrary supports query variants', () => {
    it('should parse [@supports(...)] pattern', () => {
      const result = parseArbitraryVariant('[@supports(display:grid)]');
      expect(result).toEqual({
        type: 'supports',
        content: '(display:grid)'
      });
    });

    it('should parse [@supports(...)] with display:flex', () => {
      const result = parseArbitraryVariant('[@supports(display:flex)]');
      expect(result).toEqual({
        type: 'supports',
        content: '(display:flex)'
      });
    });

    it('should parse [@supports(...)] with backdrop-filter', () => {
      const result = parseArbitraryVariant('[@supports(backdrop-filter:blur(1px))]');
      expect(result).toEqual({
        type: 'supports',
        content: '(backdrop-filter:blur(1px))'
      });
    });

    it('should parse [@supports(...)] with not operator', () => {
      const result = parseArbitraryVariant('[@supports(not(display:grid))]');
      expect(result).toEqual({
        type: 'supports',
        content: '(not(display:grid))'
      });
    });
  });

  describe('invalid patterns', () => {
    it('should return null for empty string', () => {
      expect(parseArbitraryVariant('')).toBe(null);
    });

    it('should return null for null input', () => {
      expect(parseArbitraryVariant(null)).toBe(null);
    });

    it('should return null for undefined input', () => {
      expect(parseArbitraryVariant(undefined)).toBe(null);
    });

    it('should return null for non-bracketed patterns', () => {
      expect(parseArbitraryVariant('hover')).toBe(null);
      expect(parseArbitraryVariant('focus')).toBe(null);
      expect(parseArbitraryVariant('md')).toBe(null);
    });

    it('should return null for missing opening bracket', () => {
      expect(parseArbitraryVariant('&>span]')).toBe(null);
    });

    it('should return null for missing closing bracket', () => {
      expect(parseArbitraryVariant('[&>span')).toBe(null);
    });

    it('should return null for empty brackets', () => {
      expect(parseArbitraryVariant('[]')).toBe(null);
    });

    it('should return null for just whitespace inside brackets', () => {
      expect(parseArbitraryVariant('[   ]')).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should handle selectors with colons inside brackets', () => {
      const result = parseArbitraryVariant('[@media(min-width:768px)]');
      expect(result).not.toBe(null);
      expect(result.type).toBe('media');
      expect(result.content).toContain(':');
    });

    it('should handle nested parentheses in media queries', () => {
      const result = parseArbitraryVariant('[@media(min-width:calc(768px+1rem))]');
      expect(result).toEqual({
        type: 'media',
        content: '(min-width:calc(768px+1rem))'
      });
    });

    it('should handle complex selectors with multiple combinators', () => {
      const result = parseArbitraryVariant('[&>div+p~span]');
      expect(result).toEqual({
        type: 'selector',
        content: '&>div+p~span'
      });
    });

    it('should handle attribute selectors within arbitrary variants', () => {
      const result = parseArbitraryVariant('[&[data-active]]');
      expect(result).toEqual({
        type: 'selector',
        content: '&[data-active]'
      });
    });
  });
});

describe('applyArbitraryVariant', () => {
  describe('selector variant application', () => {
    it('should replace & with selector for child combinator', () => {
      const parsed = { type: 'selector', content: '&>span' };
      const result = applyArbitraryVariant('.text-red-500', parsed);
      expect(result).toBe('.text-red-500>span');
    });

    it('should replace & with selector for descendant combinator', () => {
      const parsed = { type: 'selector', content: '& p' };
      const result = applyArbitraryVariant('.container', parsed);
      expect(result).toBe('.container p');
    });

    it('should replace & with selector for underscore descendant', () => {
      const parsed = { type: 'selector', content: '&_a' };
      const result = applyArbitraryVariant('.nav', parsed);
      expect(result).toBe('.nav_a');
    });

    it('should replace & with selector for pseudo-class', () => {
      const parsed = { type: 'selector', content: '&:hover' };
      const result = applyArbitraryVariant('.button', parsed);
      expect(result).toBe('.button:hover');
    });

    it('should replace & with selector for pseudo-element', () => {
      const parsed = { type: 'selector', content: '&::before' };
      const result = applyArbitraryVariant('.heading', parsed);
      expect(result).toBe('.heading::before');
    });

    it('should replace multiple & occurrences', () => {
      const parsed = { type: 'selector', content: '&:hover&:focus' };
      const result = applyArbitraryVariant('.input', parsed);
      expect(result).toBe('.input:hover.input:focus');
    });

    it('should replace & in complex selectors', () => {
      const parsed = { type: 'selector', content: '&>button:hover' };
      const result = applyArbitraryVariant('.toolbar', parsed);
      expect(result).toBe('.toolbar>button:hover');
    });

    it('should replace & with adjacent sibling combinator', () => {
      const parsed = { type: 'selector', content: '&+div' };
      const result = applyArbitraryVariant('.item', parsed);
      expect(result).toBe('.item+div');
    });

    it('should replace & with general sibling combinator', () => {
      const parsed = { type: 'selector', content: '&~p' };
      const result = applyArbitraryVariant('.header', parsed);
      expect(result).toBe('.header~p');
    });
  });

  describe('media query wrapper generation', () => {
    it('should return wrapper object for media query', () => {
      const parsed = { type: 'media', content: '(hover:hover)' };
      const result = applyArbitraryVariant('.interactive', parsed);
      
      expect(result).toEqual({
        __type: 'media-wrapper',
        query: '(hover:hover)',
        selector: '.interactive'
      });
    });

    it('should return wrapper object for min-width media query', () => {
      const parsed = { type: 'media', content: '(min-width:768px)' };
      const result = applyArbitraryVariant('.responsive', parsed);
      
      expect(result).toEqual({
        __type: 'media-wrapper',
        query: '(min-width:768px)',
        selector: '.responsive'
      });
    });

    it('should return wrapper object for prefers-reduced-motion', () => {
      const parsed = { type: 'media', content: '(prefers-reduced-motion)' };
      const result = applyArbitraryVariant('.animated', parsed);
      
      expect(result).toEqual({
        __type: 'media-wrapper',
        query: '(prefers-reduced-motion)',
        selector: '.animated'
      });
    });
  });

  describe('container query wrapper generation', () => {
    it('should return wrapper object for container query', () => {
      const parsed = { type: 'container', content: '(min-width:768px)' };
      const result = applyArbitraryVariant('.card', parsed);
      
      expect(result).toEqual({
        __type: 'container-wrapper',
        query: '(min-width:768px)',
        selector: '.card'
      });
    });

    it('should return wrapper object for max-width container query', () => {
      const parsed = { type: 'container', content: '(max-width:1024px)' };
      const result = applyArbitraryVariant('.widget', parsed);
      
      expect(result).toEqual({
        __type: 'container-wrapper',
        query: '(max-width:1024px)',
        selector: '.widget'
      });
    });
  });

  describe('supports query wrapper generation', () => {
    it('should return wrapper object for supports query', () => {
      const parsed = { type: 'supports', content: '(display:grid)' };
      const result = applyArbitraryVariant('.layout', parsed);
      
      expect(result).toEqual({
        __type: 'supports-wrapper',
        query: '(display:grid)',
        selector: '.layout'
      });
    });

    it('should return wrapper object for backdrop-filter supports query', () => {
      const parsed = { type: 'supports', content: '(backdrop-filter:blur(1px))' };
      const result = applyArbitraryVariant('.modal', parsed);
      
      expect(result).toEqual({
        __type: 'supports-wrapper',
        query: '(backdrop-filter:blur(1px))',
        selector: '.modal'
      });
    });

    it('should return wrapper object for not supports query', () => {
      const parsed = { type: 'supports', content: '(not(display:grid))' };
      const result = applyArbitraryVariant('.fallback', parsed);
      
      expect(result).toEqual({
        __type: 'supports-wrapper',
        query: '(not(display:grid))',
        selector: '.fallback'
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should return selector unchanged for null parsed object', () => {
      const result = applyArbitraryVariant('.class', null);
      expect(result).toBe('.class');
    });

    it('should return selector unchanged for undefined parsed object', () => {
      const result = applyArbitraryVariant('.class', undefined);
      expect(result).toBe('.class');
    });

    it('should return selector unchanged for unknown type', () => {
      const parsed = { type: 'unknown', content: 'test' };
      const result = applyArbitraryVariant('.class', parsed);
      expect(result).toBe('.class');
    });

    it('should handle selector without & placeholder', () => {
      const parsed = { type: 'selector', content: '>span' };
      const result = applyArbitraryVariant('.parent', parsed);
      expect(result).toBe('>span'); // No & to replace
    });

    it('should handle empty content', () => {
      const parsed = { type: 'selector', content: '' };
      const result = applyArbitraryVariant('.class', parsed);
      expect(result).toBe(''); // Empty replacement
    });
  });

  describe('complex selector transformations', () => {
    it('should handle multiple descendants', () => {
      const parsed = { type: 'selector', content: '&>div>span' };
      const result = applyArbitraryVariant('.wrapper', parsed);
      expect(result).toBe('.wrapper>div>span');
    });

    it('should handle attribute selectors', () => {
      const parsed = { type: 'selector', content: '&[data-active]' };
      const result = applyArbitraryVariant('.item', parsed);
      expect(result).toBe('.item[data-active]');
    });

    it('should handle class selectors', () => {
      const parsed = { type: 'selector', content: '&.active' };
      const result = applyArbitraryVariant('.button', parsed);
      expect(result).toBe('.button.active');
    });

    it('should handle ID selectors', () => {
      const parsed = { type: 'selector', content: '&#main' };
      const result = applyArbitraryVariant('.container', parsed);
      expect(result).toBe('.container#main');
    });

    it('should handle nth-child pseudo-class', () => {
      const parsed = { type: 'selector', content: '&:nth-child(2n)' };
      const result = applyArbitraryVariant('.item', parsed);
      expect(result).toBe('.item:nth-child(2n)');
    });

    it('should handle complex combinators', () => {
      const parsed = { type: 'selector', content: '&>div+p~span' };
      const result = applyArbitraryVariant('.container', parsed);
      expect(result).toBe('.container>div+p~span');
    });
  });

  describe('wrapper preservation requirements', () => {
    it('should preserve selector in wrapper objects', () => {
      const parsed = { type: 'media', content: '(hover:hover)' };
      const result = applyArbitraryVariant('.hover\\:text-blue-500', parsed);
      
      expect(result.selector).toBe('.hover\\:text-blue-500');
    });

    it('should preserve query content in wrapper objects', () => {
      const parsed = { type: 'media', content: '(min-width:768px)' };
      const result = applyArbitraryVariant('.class', parsed);
      
      expect(result.query).toBe('(min-width:768px)');
    });

    it('should use correct wrapper type', () => {
      const mediaResult = applyArbitraryVariant('.class', { type: 'media', content: '(hover:hover)' });
      const containerResult = applyArbitraryVariant('.class', { type: 'container', content: '(min-width:768px)' });
      const supportsResult = applyArbitraryVariant('.class', { type: 'supports', content: '(display:grid)' });
      
      expect(mediaResult.__type).toBe('media-wrapper');
      expect(containerResult.__type).toBe('container-wrapper');
      expect(supportsResult.__type).toBe('supports-wrapper');
    });
  });
});
