/**
 * Tests for parseAdvancedVariant() function
 * Requirements: 6.1, 6.2
 */

import { describe, it, expect } from 'vitest';
import { parseAdvancedVariant } from './resolvers.js';

describe('parseAdvancedVariant', () => {
  describe('has-* pseudo-class variants', () => {
    it('should parse has-[selector] pattern', () => {
      const result = parseAdvancedVariant('has-[:checked]');
      expect(result).toEqual({
        type: 'has',
        content: ':checked'
      });
    });

    it('should parse has-[...] with complex selectors', () => {
      const result = parseAdvancedVariant('has-[:focus]');
      expect(result).toEqual({
        type: 'has',
        content: ':focus'
      });
    });

    it('should parse has-[...] with attribute selectors', () => {
      const result = parseAdvancedVariant('has-[[data-active]]');
      expect(result).toEqual({
        type: 'has',
        content: '[data-active]'
      });
    });

    it('should parse has-[...] with descendant selectors', () => {
      const result = parseAdvancedVariant('has-[>input:checked]');
      expect(result).toEqual({
        type: 'has',
        content: '>input:checked'
      });
    });

    it('should parse has-[...] with class selectors', () => {
      const result = parseAdvancedVariant('has-[.active]');
      expect(result).toEqual({
        type: 'has',
        content: '.active'
      });
    });
  });

  describe('group-has-* variants', () => {
    it('should parse group-has-[selector] pattern', () => {
      const result = parseAdvancedVariant('group-has-[:checked]');
      expect(result).toEqual({
        type: 'group-has',
        content: ':checked'
      });
    });

    it('should parse group-has-[...] with complex selectors', () => {
      const result = parseAdvancedVariant('group-has-[:focus]');
      expect(result).toEqual({
        type: 'group-has',
        content: ':focus'
      });
    });

    it('should parse group-has-[...] with attribute selectors', () => {
      const result = parseAdvancedVariant('group-has-[[data-state=open]]');
      expect(result).toEqual({
        type: 'group-has',
        content: '[data-state=open]'
      });
    });

    it('should parse group-has-[...] with descendant selectors', () => {
      const result = parseAdvancedVariant('group-has-[>button:hover]');
      expect(result).toEqual({
        type: 'group-has',
        content: '>button:hover'
      });
    });
  });

  describe('peer-has-* variants', () => {
    it('should parse peer-has-[selector] pattern', () => {
      const result = parseAdvancedVariant('peer-has-[:checked]');
      expect(result).toEqual({
        type: 'peer-has',
        content: ':checked'
      });
    });

    it('should parse peer-has-[...] with complex selectors', () => {
      const result = parseAdvancedVariant('peer-has-[:invalid]');
      expect(result).toEqual({
        type: 'peer-has',
        content: ':invalid'
      });
    });

    it('should parse peer-has-[...] with attribute selectors', () => {
      const result = parseAdvancedVariant('peer-has-[[aria-expanded=true]]');
      expect(result).toEqual({
        type: 'peer-has',
        content: '[aria-expanded=true]'
      });
    });

    it('should parse peer-has-[...] with descendant selectors', () => {
      const result = parseAdvancedVariant('peer-has-[>input:focus]');
      expect(result).toEqual({
        type: 'peer-has',
        content: '>input:focus'
      });
    });
  });

  describe('data-* attribute variants', () => {
    it('should parse data-[attr] pattern without value', () => {
      const result = parseAdvancedVariant('data-[loading]');
      expect(result).toEqual({
        type: 'data',
        attribute: 'loading',
        value: null
      });
    });

    it('should parse data-[attr=value] pattern', () => {
      const result = parseAdvancedVariant('data-[state=open]');
      expect(result).toEqual({
        type: 'data',
        attribute: 'state',
        value: 'open'
      });
    });

    it('should parse data-[attr=value] with hyphenated attributes', () => {
      const result = parseAdvancedVariant('data-[dropdown-open=true]');
      expect(result).toEqual({
        type: 'data',
        attribute: 'dropdown-open',
        value: 'true'
      });
    });

    it('should parse data-[attr=value] with numeric values', () => {
      const result = parseAdvancedVariant('data-[level=2]');
      expect(result).toEqual({
        type: 'data',
        attribute: 'level',
        value: '2'
      });
    });
  });

  describe('aria-* attribute variants', () => {
    it('should parse aria-[attr] pattern without value', () => {
      const result = parseAdvancedVariant('aria-[hidden]');
      expect(result).toEqual({
        type: 'aria',
        attribute: 'hidden',
        value: null
      });
    });

    it('should parse aria-[attr=value] pattern', () => {
      const result = parseAdvancedVariant('aria-[expanded=true]');
      expect(result).toEqual({
        type: 'aria',
        attribute: 'expanded',
        value: 'true'
      });
    });

    it('should parse aria-[attr=value] with hyphenated attributes', () => {
      const result = parseAdvancedVariant('aria-[current-page=true]');
      expect(result).toEqual({
        type: 'aria',
        attribute: 'current-page',
        value: 'true'
      });
    });

    it('should parse aria-[attr=value] with false values', () => {
      const result = parseAdvancedVariant('aria-[expanded=false]');
      expect(result).toEqual({
        type: 'aria',
        attribute: 'expanded',
        value: 'false'
      });
    });
  });

  describe('invalid patterns', () => {
    it('should return null for empty string', () => {
      expect(parseAdvancedVariant('')).toBe(null);
    });

    it('should return null for null input', () => {
      expect(parseAdvancedVariant(null)).toBe(null);
    });

    it('should return null for undefined input', () => {
      expect(parseAdvancedVariant(undefined)).toBe(null);
    });

    it('should return null for non-matching patterns', () => {
      expect(parseAdvancedVariant('hover')).toBe(null);
      expect(parseAdvancedVariant('focus')).toBe(null);
      expect(parseAdvancedVariant('group-hover')).toBe(null);
    });

    it('should return null for malformed has patterns', () => {
      expect(parseAdvancedVariant('has-')).toBe(null);
      expect(parseAdvancedVariant('has-[]')).toBe(null);
      expect(parseAdvancedVariant('has')).toBe(null);
    });

    it('should return null for malformed data patterns', () => {
      expect(parseAdvancedVariant('data-')).toBe(null);
      expect(parseAdvancedVariant('data-[]')).toBe(null);
      expect(parseAdvancedVariant('data')).toBe(null);
    });

    it('should return null for malformed aria patterns', () => {
      expect(parseAdvancedVariant('aria-')).toBe(null);
      expect(parseAdvancedVariant('aria-[]')).toBe(null);
      expect(parseAdvancedVariant('aria')).toBe(null);
    });

    it('should return null for unmatched brackets', () => {
      expect(parseAdvancedVariant('has-[:checked')).toBe(null);
      expect(parseAdvancedVariant('has-:checked]')).toBe(null);
      expect(parseAdvancedVariant('data-[state')).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should handle selectors with spaces', () => {
      const result = parseAdvancedVariant('has-[> .child]');
      expect(result).toEqual({
        type: 'has',
        content: '> .child'
      });
    });

    it('should handle selectors with multiple pseudo-classes', () => {
      const result = parseAdvancedVariant('has-[:hover:focus]');
      expect(result).toEqual({
        type: 'has',
        content: ':hover:focus'
      });
    });

    it('should handle data attributes with special characters in values', () => {
      const result = parseAdvancedVariant('data-[state=open-active]');
      expect(result).toEqual({
        type: 'data',
        attribute: 'state',
        value: 'open-active'
      });
    });

    it('should handle aria attributes with underscores', () => {
      const result = parseAdvancedVariant('aria-[aria_expanded=true]');
      expect(result).toEqual({
        type: 'aria',
        attribute: 'aria_expanded',
        value: 'true'
      });
    });
  });

  describe('selector extraction', () => {
    it('should extract simple pseudo-class selectors', () => {
      const variants = [
        'has-[:checked]',
        'has-[:hover]',
        'has-[:focus]',
        'has-[:disabled]',
        'has-[:invalid]'
      ];

      variants.forEach(variant => {
        const result = parseAdvancedVariant(variant);
        expect(result).not.toBe(null);
        expect(result.type).toBe('has');
        expect(result.content).toContain(':');
      });
    });

    it('should extract complex descendant selectors', () => {
      const result = parseAdvancedVariant('has-[>input:checked+label]');
      expect(result).toEqual({
        type: 'has',
        content: '>input:checked+label'
      });
    });

    it('should extract selectors with combinators', () => {
      const result = parseAdvancedVariant('has-[~.sibling]');
      expect(result).toEqual({
        type: 'has',
        content: '~.sibling'
      });
    });
  });

  describe('group and peer combinations', () => {
    it('should distinguish between has, group-has, and peer-has', () => {
      const has = parseAdvancedVariant('has-[:checked]');
      const groupHas = parseAdvancedVariant('group-has-[:checked]');
      const peerHas = parseAdvancedVariant('peer-has-[:checked]');

      expect(has.type).toBe('has');
      expect(groupHas.type).toBe('group-has');
      expect(peerHas.type).toBe('peer-has');

      expect(has.content).toBe(':checked');
      expect(groupHas.content).toBe(':checked');
      expect(peerHas.content).toBe(':checked');
    });

    it('should handle group-has with complex selectors', () => {
      const result = parseAdvancedVariant('group-has-[>button:hover]');
      expect(result).toEqual({
        type: 'group-has',
        content: '>button:hover'
      });
    });

    it('should handle peer-has with complex selectors', () => {
      const result = parseAdvancedVariant('peer-has-[+input:focus]');
      expect(result).toEqual({
        type: 'peer-has',
        content: '+input:focus'
      });
    });
  });
});
