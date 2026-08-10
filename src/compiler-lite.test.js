import { describe, it, expect } from 'vitest';
import {
  compileClass,
  compileCriticalCss,
  parseClass,
  compileBaseTokenLite,
  LITE_PREFIX_ROUTER,
  LITE_VARIANT_MAP,
  applyVariantsLite,
} from './compiler-lite.js';

/**
 * Comprehensive test suite for Windrunner Lite Build
 * 
 * Tests Requirements 2.2-2.10 (included utilities)
 * Tests Requirements 2.13-2.16 (excluded utilities)
 * Tests Requirements 2.11-2.12 (included variants)
 * Tests Requirements 2.17 (excluded variants)
 * 
 * This test suite verifies:
 * 1. Layout utilities compile correctly
 * 2. Spacing utilities compile correctly
 * 3. Sizing utilities compile correctly
 * 4. Flexbox utilities compile correctly
 * 5. Grid utilities compile correctly
 * 6. Typography utilities compile correctly
 * 7. Color utilities compile correctly
 * 8. Border utilities compile correctly
 * 9. Basic effects compile correctly
 * 10. Transform utilities return undefined
 * 11. Filter utilities return undefined
 * 12. Transition utilities return undefined
 * 13. Animation utilities return undefined
 * 14. Responsive breakpoints work with core utilities
 * 15. Basic variants work with core utilities
 * 16. Advanced variants return undefined
 */

describe('Lite Build - Compiler', () => {
  describe('Category 1: Layout Utilities (Requirement 2.2)', () => {
    it('should compile display utilities', () => {
      expect(compileClass('block')).toContain('display: block');
      expect(compileClass('inline-block')).toContain('display: inline-block');
      expect(compileClass('flex')).toContain('display: flex');
      expect(compileClass('inline-flex')).toContain('display: inline-flex');
      expect(compileClass('grid')).toContain('display: grid');
      expect(compileClass('inline-grid')).toContain('display: inline-grid');
      expect(compileClass('hidden')).toContain('display: none');
      expect(compileClass('table')).toContain('display: table');
    });

    it('should compile position utilities', () => {
      expect(compileClass('static')).toContain('position: static');
      expect(compileClass('fixed')).toContain('position: fixed');
      expect(compileClass('absolute')).toContain('position: absolute');
      expect(compileClass('relative')).toContain('position: relative');
      expect(compileClass('sticky')).toContain('position: sticky');
    });

    it('should compile position inset utilities', () => {
      expect(compileClass('top-0')).toContain('top: 0');
      expect(compileClass('right-4')).toContain('right: 1rem');
      expect(compileClass('bottom-8')).toContain('bottom: 2rem');
      expect(compileClass('left-auto')).toContain('left: auto');
      // inset-0 expands to top, right, bottom, left properties
      expect(compileClass('inset-0')).toContain('top: 0');
      expect(compileClass('inset-x-4')).toContain('left: 1rem');
      expect(compileClass('inset-y-8')).toContain('top: 2rem');
    });

    it('should compile overflow utilities', () => {
      expect(compileClass('overflow-auto')).toContain('overflow: auto');
      expect(compileClass('overflow-hidden')).toContain('overflow: hidden');
      expect(compileClass('overflow-visible')).toContain('overflow: visible');
      expect(compileClass('overflow-scroll')).toContain('overflow: scroll');
      expect(compileClass('overflow-x-auto')).toContain('overflow-x: auto');
      expect(compileClass('overflow-y-hidden')).toContain('overflow-y: hidden');
    });

    it('should compile z-index utilities', () => {
      expect(compileClass('z-0')).toContain('z-index: 0');
      expect(compileClass('z-10')).toContain('z-index: 10');
      expect(compileClass('z-20')).toContain('z-index: 20');
      expect(compileClass('z-30')).toContain('z-index: 30');
      expect(compileClass('z-40')).toContain('z-index: 40');
      expect(compileClass('z-50')).toContain('z-index: 50');
      expect(compileClass('z-auto')).toContain('z-index: auto');
    });

    it('should compile float utilities', () => {
      expect(compileClass('float-left')).toContain('float: left');
      expect(compileClass('float-right')).toContain('float: right');
      expect(compileClass('float-none')).toContain('float: none');
    });

    it('should compile clear utilities', () => {
      expect(compileClass('clear-left')).toContain('clear: left');
      expect(compileClass('clear-right')).toContain('clear: right');
      expect(compileClass('clear-both')).toContain('clear: both');
      expect(compileClass('clear-none')).toContain('clear: none');
    });

    it('should compile aspect-ratio utilities', () => {
      expect(compileClass('aspect-auto')).toContain('aspect-ratio: auto');
      expect(compileClass('aspect-square')).toContain('aspect-ratio: 1 / 1');
      expect(compileClass('aspect-video')).toContain('aspect-ratio: 16 / 9');
    });

    it('should compile columns utilities', () => {
      expect(compileClass('columns-1')).toContain('columns: 1');
      expect(compileClass('columns-2')).toContain('columns: 2');
      expect(compileClass('columns-3')).toContain('columns: 3');
      expect(compileClass('columns-auto')).toContain('columns: auto');
    });

    it('should compile isolation utilities', () => {
      expect(compileClass('isolate')).toContain('isolation: isolate');
      expect(compileClass('isolation-auto')).toContain('isolation: auto');
    });

    it('should compile object-fit utilities', () => {
      expect(compileClass('object-contain')).toContain('object-fit: contain');
      expect(compileClass('object-cover')).toContain('object-fit: cover');
      expect(compileClass('object-fill')).toContain('object-fit: fill');
      expect(compileClass('object-none')).toContain('object-fit: none');
      expect(compileClass('object-scale-down')).toContain('object-fit: scale-down');
    });

    it('should compile object-position utilities', () => {
      expect(compileClass('object-bottom')).toContain('object-position: bottom');
      expect(compileClass('object-center')).toContain('object-position: center');
      expect(compileClass('object-left')).toContain('object-position: left');
      expect(compileClass('object-right')).toContain('object-position: right');
      expect(compileClass('object-top')).toContain('object-position: top');
    });
  });

  describe('Category 2: Spacing Utilities (Requirement 2.3)', () => {
    it('should compile margin utilities', () => {
      expect(compileClass('m-0')).toContain('margin: 0');
      expect(compileClass('m-4')).toContain('margin: 1rem');
      expect(compileClass('m-8')).toContain('margin: 2rem');
      expect(compileClass('m-auto')).toContain('margin: auto');
      
      expect(compileClass('mx-4')).toContain('margin-left: 1rem');
      expect(compileClass('my-8')).toContain('margin-top: 2rem');
      
      expect(compileClass('mt-4')).toContain('margin-top: 1rem');
      expect(compileClass('mr-4')).toContain('margin-right: 1rem');
      expect(compileClass('mb-4')).toContain('margin-bottom: 1rem');
      expect(compileClass('ml-4')).toContain('margin-left: 1rem');
    });

    it('should compile negative margin utilities', () => {
      expect(compileClass('-m-4')).toContain('margin: -1rem');
      expect(compileClass('-mt-8')).toContain('margin-top: -2rem');
      expect(compileClass('-mx-4')).toContain('margin-left: -1rem');
      expect(compileClass('-my-8')).toContain('margin-top: -2rem');
    });

    it('should compile padding utilities', () => {
      expect(compileClass('p-0')).toContain('padding: 0');
      expect(compileClass('p-4')).toContain('padding: 1rem');
      expect(compileClass('p-8')).toContain('padding: 2rem');
      
      expect(compileClass('px-4')).toContain('padding-left: 1rem');
      expect(compileClass('py-8')).toContain('padding-top: 2rem');
      
      expect(compileClass('pt-4')).toContain('padding-top: 1rem');
      expect(compileClass('pr-4')).toContain('padding-right: 1rem');
      expect(compileClass('pb-4')).toContain('padding-bottom: 1rem');
      expect(compileClass('pl-4')).toContain('padding-left: 1rem');
    });

    it('should compile gap utilities', () => {
      expect(compileClass('gap-0')).toContain('gap: 0');
      expect(compileClass('gap-4')).toContain('gap: 1rem');
      expect(compileClass('gap-8')).toContain('gap: 2rem');
      expect(compileClass('gap-x-4')).toContain('column-gap: 1rem');
      expect(compileClass('gap-y-8')).toContain('row-gap: 2rem');
    });

    it('should compile space utilities', () => {
      const spaceX = compileClass('space-x-4');
      // space-x uses CSS custom properties for logical properties
      expect(spaceX).toContain('margin-inline-start');
      
      const spaceY = compileClass('space-y-4');
      expect(spaceY).toContain('margin-top');
      
      const negativeSpaceX = compileClass('space-x-reverse');
      expect(negativeSpaceX).toBeTruthy();
    });
  });

  describe('Category 3: Sizing Utilities (Requirement 2.4)', () => {
    it('should compile width utilities', () => {
      expect(compileClass('w-0')).toContain('width: 0');
      expect(compileClass('w-4')).toContain('width: 1rem');
      expect(compileClass('w-8')).toContain('width: 2rem');
      expect(compileClass('w-auto')).toContain('width: auto');
      expect(compileClass('w-full')).toContain('width: 100%');
      expect(compileClass('w-screen')).toContain('width: 100vw');
      expect(compileClass('w-1/2')).toContain('width: 50%');
      expect(compileClass('w-1/3')).toContain('width: 33.333333%');
      expect(compileClass('w-2/3')).toContain('width: 66.666667%');
    });

    it('should compile height utilities', () => {
      expect(compileClass('h-0')).toContain('height: 0');
      expect(compileClass('h-4')).toContain('height: 1rem');
      expect(compileClass('h-8')).toContain('height: 2rem');
      expect(compileClass('h-auto')).toContain('height: auto');
      expect(compileClass('h-full')).toContain('height: 100%');
      expect(compileClass('h-screen')).toContain('height: 100vh');
      expect(compileClass('h-1/2')).toContain('height: 50%');
    });

    it('should compile min-width utilities', () => {
      expect(compileClass('min-w-0')).toContain('min-width: 0');
      expect(compileClass('min-w-full')).toContain('min-width: 100%');
      expect(compileClass('min-w-min')).toContain('min-width: min-content');
      expect(compileClass('min-w-max')).toContain('min-width: max-content');
      expect(compileClass('min-w-fit')).toContain('min-width: fit-content');
    });

    it('should compile max-width utilities', () => {
      expect(compileClass('max-w-none')).toContain('max-width: none');
      expect(compileClass('max-w-xs')).toContain('max-width: 20rem');
      expect(compileClass('max-w-sm')).toContain('max-width: 24rem');
      expect(compileClass('max-w-md')).toContain('max-width: 28rem');
      expect(compileClass('max-w-lg')).toContain('max-width: 32rem');
      expect(compileClass('max-w-full')).toContain('max-width: 100%');
    });

    it('should compile min-height utilities', () => {
      expect(compileClass('min-h-0')).toContain('min-height: 0');
      expect(compileClass('min-h-full')).toContain('min-height: 100%');
      expect(compileClass('min-h-screen')).toContain('min-height: 100vh');
    });

    it('should compile max-height utilities', () => {
      expect(compileClass('max-h-full')).toContain('max-height: 100%');
      expect(compileClass('max-h-screen')).toContain('max-height: 100vh');
      expect(compileClass('max-h-min')).toContain('max-height: min-content');
      expect(compileClass('max-h-max')).toContain('max-height: max-content');
      expect(compileClass('max-h-fit')).toContain('max-height: fit-content');
    });

    it('should compile size utilities', () => {
      expect(compileClass('size-4')).toContain('width: 1rem');
      expect(compileClass('size-8')).toContain('height: 2rem');
      expect(compileClass('size-full')).toContain('width: 100%');
    });
  });

  describe('Category 4: Flexbox Utilities (Requirement 2.5)', () => {
    it('should compile flex display', () => {
      expect(compileClass('flex')).toContain('display: flex');
      expect(compileClass('inline-flex')).toContain('display: inline-flex');
    });

    it('should compile flex-direction utilities', () => {
      expect(compileClass('flex-row')).toContain('flex-direction: row');
      expect(compileClass('flex-row-reverse')).toContain('flex-direction: row-reverse');
      expect(compileClass('flex-col')).toContain('flex-direction: column');
      expect(compileClass('flex-col-reverse')).toContain('flex-direction: column-reverse');
    });

    it('should compile flex-wrap utilities', () => {
      expect(compileClass('flex-wrap')).toContain('flex-wrap: wrap');
      expect(compileClass('flex-wrap-reverse')).toContain('flex-wrap: wrap-reverse');
      expect(compileClass('flex-nowrap')).toContain('flex-wrap: nowrap');
    });

    it('should compile flex utilities', () => {
      expect(compileClass('flex-1')).toContain('flex: 1 1 0%');
      expect(compileClass('flex-auto')).toContain('flex: 1 1 auto');
      expect(compileClass('flex-initial')).toContain('flex: 0 1 auto');
      expect(compileClass('flex-none')).toContain('flex: none');
    });

    it('should compile flex-grow utilities', () => {
      expect(compileClass('grow')).toContain('flex-grow: 1');
      expect(compileClass('grow-0')).toContain('flex-grow: 0');
    });

    it('should compile flex-shrink utilities', () => {
      expect(compileClass('shrink')).toContain('flex-shrink: 1');
      expect(compileClass('shrink-0')).toContain('flex-shrink: 0');
    });

    it('should compile flex-basis utilities', () => {
      expect(compileClass('basis-0')).toContain('flex-basis: 0');
      expect(compileClass('basis-auto')).toContain('flex-basis: auto');
      expect(compileClass('basis-full')).toContain('flex-basis: 100%');
      expect(compileClass('basis-1/2')).toContain('flex-basis: 50%');
    });

    it('should compile align-items utilities', () => {
      expect(compileClass('items-start')).toContain('align-items: flex-start');
      expect(compileClass('items-end')).toContain('align-items: flex-end');
      expect(compileClass('items-center')).toContain('align-items: center');
      expect(compileClass('items-baseline')).toContain('align-items: baseline');
      expect(compileClass('items-stretch')).toContain('align-items: stretch');
    });

    it('should compile justify-content utilities', () => {
      expect(compileClass('justify-start')).toContain('justify-content: flex-start');
      expect(compileClass('justify-end')).toContain('justify-content: flex-end');
      expect(compileClass('justify-center')).toContain('justify-content: center');
      expect(compileClass('justify-between')).toContain('justify-content: space-between');
      expect(compileClass('justify-around')).toContain('justify-content: space-around');
      expect(compileClass('justify-evenly')).toContain('justify-content: space-evenly');
    });

    it('should compile place utilities', () => {
      expect(compileClass('place-content-center')).toContain('place-content: center');
      expect(compileClass('place-content-start')).toContain('place-content: start');
      expect(compileClass('place-items-center')).toContain('place-items: center');
      expect(compileClass('place-self-center')).toContain('place-self: center');
    });

    it('should compile align-self utilities', () => {
      expect(compileClass('self-auto')).toContain('align-self: auto');
      expect(compileClass('self-start')).toContain('align-self: flex-start');
      expect(compileClass('self-end')).toContain('align-self: flex-end');
      expect(compileClass('self-center')).toContain('align-self: center');
      expect(compileClass('self-stretch')).toContain('align-self: stretch');
    });

    it('should compile order utilities', () => {
      expect(compileClass('order-1')).toContain('order: 1');
      expect(compileClass('order-2')).toContain('order: 2');
      expect(compileClass('order-first')).toContain('order: -9999');
      expect(compileClass('order-last')).toContain('order: 9999');
      expect(compileClass('order-none')).toContain('order: 0');
    });
  });

  describe('Category 5: Grid Utilities (Requirement 2.6)', () => {
    it('should compile grid display', () => {
      expect(compileClass('grid')).toContain('display: grid');
      expect(compileClass('inline-grid')).toContain('display: inline-grid');
    });

    it('should compile grid-template-columns utilities', () => {
      expect(compileClass('grid-cols-1')).toContain('grid-template-columns: repeat(1, minmax(0, 1fr))');
      expect(compileClass('grid-cols-2')).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
      expect(compileClass('grid-cols-3')).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
      expect(compileClass('grid-cols-none')).toContain('grid-template-columns: none');
    });

    it('should compile grid-template-rows utilities', () => {
      expect(compileClass('grid-rows-1')).toContain('grid-template-rows: repeat(1, minmax(0, 1fr))');
      expect(compileClass('grid-rows-2')).toContain('grid-template-rows: repeat(2, minmax(0, 1fr))');
      expect(compileClass('grid-rows-3')).toContain('grid-template-rows: repeat(3, minmax(0, 1fr))');
      expect(compileClass('grid-rows-none')).toContain('grid-template-rows: none');
    });

    it('should compile grid-column utilities', () => {
      expect(compileClass('col-auto')).toContain('grid-column: auto');
      expect(compileClass('col-span-1')).toContain('grid-column: span 1 / span 1');
      expect(compileClass('col-span-2')).toContain('grid-column: span 2 / span 2');
      expect(compileClass('col-span-full')).toContain('grid-column: 1 / -1');
      expect(compileClass('col-start-1')).toContain('grid-column-start: 1');
      expect(compileClass('col-end-3')).toContain('grid-column-end: 3');
    });

    it('should compile grid-row utilities', () => {
      expect(compileClass('row-auto')).toContain('grid-row: auto');
      expect(compileClass('row-span-1')).toContain('grid-row: span 1 / span 1');
      expect(compileClass('row-span-2')).toContain('grid-row: span 2 / span 2');
      expect(compileClass('row-span-full')).toContain('grid-row: 1 / -1');
      expect(compileClass('row-start-1')).toContain('grid-row-start: 1');
      expect(compileClass('row-end-3')).toContain('grid-row-end: 3');
    });

    it('should compile grid-flow utilities', () => {
      expect(compileClass('grid-flow-row')).toContain('grid-auto-flow: row');
      expect(compileClass('grid-flow-col')).toContain('grid-auto-flow: column');
      expect(compileClass('grid-flow-dense')).toContain('grid-auto-flow: dense');
      expect(compileClass('grid-flow-row-dense')).toContain('grid-auto-flow: row dense');
    });

    it('should compile auto-columns utilities', () => {
      expect(compileClass('auto-cols-auto')).toContain('grid-auto-columns: auto');
      expect(compileClass('auto-cols-min')).toContain('grid-auto-columns: min-content');
      expect(compileClass('auto-cols-max')).toContain('grid-auto-columns: max-content');
      expect(compileClass('auto-cols-fr')).toContain('grid-auto-columns: minmax(0, 1fr)');
    });

    it('should compile auto-rows utilities', () => {
      expect(compileClass('auto-rows-auto')).toContain('grid-auto-rows: auto');
      expect(compileClass('auto-rows-min')).toContain('grid-auto-rows: min-content');
      expect(compileClass('auto-rows-max')).toContain('grid-auto-rows: max-content');
      expect(compileClass('auto-rows-fr')).toContain('grid-auto-rows: minmax(0, 1fr)');
    });

    it('should compile grid place utilities', () => {
      expect(compileClass('place-items-start')).toContain('place-items: start');
      expect(compileClass('place-items-center')).toContain('place-items: center');
      expect(compileClass('place-content-between')).toContain('place-content: space-between');
      expect(compileClass('place-self-auto')).toContain('place-self: auto');
    });
  });

  describe('Category 6: Typography Utilities (Requirement 2.7)', () => {
    it('should compile font-size utilities', () => {
      expect(compileClass('text-xs')).toContain('font-size: 0.75rem');
      expect(compileClass('text-sm')).toContain('font-size: 0.875rem');
      expect(compileClass('text-base')).toContain('font-size: 1rem');
      expect(compileClass('text-lg')).toContain('font-size: 1.125rem');
      expect(compileClass('text-xl')).toContain('font-size: 1.25rem');
      expect(compileClass('text-2xl')).toContain('font-size: 1.5rem');
      expect(compileClass('text-3xl')).toContain('font-size: 1.875rem');
    });

    it('should compile font-weight utilities', () => {
      expect(compileClass('font-thin')).toContain('font-weight: 100');
      expect(compileClass('font-extralight')).toContain('font-weight: 200');
      expect(compileClass('font-light')).toContain('font-weight: 300');
      expect(compileClass('font-normal')).toContain('font-weight: 400');
      expect(compileClass('font-medium')).toContain('font-weight: 500');
      expect(compileClass('font-semibold')).toContain('font-weight: 600');
      expect(compileClass('font-bold')).toContain('font-weight: 700');
      expect(compileClass('font-extrabold')).toContain('font-weight: 800');
      expect(compileClass('font-black')).toContain('font-weight: 900');
    });

    it('should compile line-height utilities', () => {
      expect(compileClass('leading-none')).toContain('line-height: 1');
      expect(compileClass('leading-tight')).toContain('line-height: 1.25');
      expect(compileClass('leading-snug')).toContain('line-height: 1.375');
      expect(compileClass('leading-normal')).toContain('line-height: 1.5');
      expect(compileClass('leading-relaxed')).toContain('line-height: 1.625');
      expect(compileClass('leading-loose')).toContain('line-height: 2');
    });

    it('should compile letter-spacing utilities', () => {
      expect(compileClass('tracking-tighter')).toContain('letter-spacing: -0.05em');
      expect(compileClass('tracking-tight')).toContain('letter-spacing: -0.025em');
      expect(compileClass('tracking-normal')).toContain('letter-spacing: 0em');
      expect(compileClass('tracking-wide')).toContain('letter-spacing: 0.025em');
      expect(compileClass('tracking-wider')).toContain('letter-spacing: 0.05em');
      expect(compileClass('tracking-widest')).toContain('letter-spacing: 0.1em');
    });

    it('should compile text-align utilities', () => {
      expect(compileClass('text-left')).toContain('text-align: left');
      expect(compileClass('text-center')).toContain('text-align: center');
      expect(compileClass('text-right')).toContain('text-align: right');
      expect(compileClass('text-justify')).toContain('text-align: justify');
    });

    it('should compile text-decoration utilities', () => {
      expect(compileClass('underline')).toContain('text-decoration-line: underline');
      expect(compileClass('overline')).toContain('text-decoration-line: overline');
      expect(compileClass('line-through')).toContain('text-decoration-line: line-through');
      expect(compileClass('no-underline')).toContain('text-decoration-line: none');
    });

    it('should compile text-transform utilities', () => {
      expect(compileClass('uppercase')).toContain('text-transform: uppercase');
      expect(compileClass('lowercase')).toContain('text-transform: lowercase');
      expect(compileClass('capitalize')).toContain('text-transform: capitalize');
      expect(compileClass('normal-case')).toContain('text-transform: none');
    });

    it('should compile text-overflow utilities', () => {
      expect(compileClass('truncate')).toContain('overflow: hidden');
      expect(compileClass('text-ellipsis')).toContain('text-overflow: ellipsis');
      expect(compileClass('text-clip')).toContain('text-overflow: clip');
    });

    it('should compile whitespace utilities', () => {
      expect(compileClass('whitespace-normal')).toContain('white-space: normal');
      expect(compileClass('whitespace-nowrap')).toContain('white-space: nowrap');
      expect(compileClass('whitespace-pre')).toContain('white-space: pre');
      expect(compileClass('whitespace-pre-line')).toContain('white-space: pre-line');
      expect(compileClass('whitespace-pre-wrap')).toContain('white-space: pre-wrap');
    });

    it('should compile word-break utilities', () => {
      expect(compileClass('break-normal')).toContain('overflow-wrap: normal');
      expect(compileClass('break-words')).toContain('overflow-wrap: break-word');
      expect(compileClass('break-all')).toContain('word-break: break-all');
    });
  });

  describe('Category 7: Color Utilities (Requirement 2.8)', () => {
    it('should compile text color utilities', () => {
      expect(compileClass('text-black')).toContain('color:');
      expect(compileClass('text-white')).toContain('color:');
      expect(compileClass('text-red-500')).toContain('color:');
      expect(compileClass('text-blue-500')).toContain('color:');
      expect(compileClass('text-green-500')).toContain('color:');
      expect(compileClass('text-yellow-500')).toContain('color:');
      expect(compileClass('text-purple-500')).toContain('color:');
    });

    it('should compile background color utilities', () => {
      expect(compileClass('bg-black')).toContain('background-color:');
      expect(compileClass('bg-white')).toContain('background-color:');
      expect(compileClass('bg-red-500')).toContain('background-color:');
      expect(compileClass('bg-blue-500')).toContain('background-color:');
      expect(compileClass('bg-green-500')).toContain('background-color:');
    });

    it('should compile border color utilities', () => {
      expect(compileClass('border-black')).toContain('border-color:');
      expect(compileClass('border-white')).toContain('border-color:');
      expect(compileClass('border-red-500')).toContain('border-color:');
      expect(compileClass('border-blue-500')).toContain('border-color:');
    });

    it('should compile color with opacity modifier', () => {
      expect(compileClass('text-red-500/50')).toContain('color:');
      expect(compileClass('bg-blue-500/75')).toContain('background-color:');
      expect(compileClass('border-green-500/25')).toContain('border-color:');
    });

    it('should compile fill and stroke colors', () => {
      expect(compileClass('fill-red-500')).toContain('fill:');
      expect(compileClass('stroke-blue-500')).toContain('stroke:');
    });
  });

  describe('Category 8: Border Utilities (Requirement 2.9)', () => {
    it('should compile border-width utilities', () => {
      expect(compileClass('border')).toContain('border-width: 1px');
      expect(compileClass('border-0')).toContain('border-width: 0');
      expect(compileClass('border-2')).toContain('border-width: 2px');
      expect(compileClass('border-4')).toContain('border-width: 4px');
      expect(compileClass('border-8')).toContain('border-width: 8px');
      
      expect(compileClass('border-x')).toContain('border-left-width: 1px');
      expect(compileClass('border-y')).toContain('border-top-width: 1px');
      expect(compileClass('border-t')).toContain('border-top-width: 1px');
      expect(compileClass('border-r')).toContain('border-right-width: 1px');
      expect(compileClass('border-b')).toContain('border-bottom-width: 1px');
      expect(compileClass('border-l')).toContain('border-left-width: 1px');
    });

    it('should compile border-style utilities', () => {
      expect(compileClass('border-solid')).toContain('border-style: solid');
      expect(compileClass('border-dashed')).toContain('border-style: dashed');
      expect(compileClass('border-dotted')).toContain('border-style: dotted');
      expect(compileClass('border-double')).toContain('border-style: double');
      expect(compileClass('border-none')).toContain('border-style: none');
    });

    it('should compile border-radius utilities', () => {
      expect(compileClass('rounded-none')).toContain('border-radius: 0');
      expect(compileClass('rounded-sm')).toContain('border-radius: 0.125rem');
      expect(compileClass('rounded')).toContain('border-radius: 0.25rem');
      expect(compileClass('rounded-md')).toContain('border-radius: 0.375rem');
      expect(compileClass('rounded-lg')).toContain('border-radius: 0.5rem');
      expect(compileClass('rounded-xl')).toContain('border-radius: 0.75rem');
      expect(compileClass('rounded-2xl')).toContain('border-radius: 1rem');
      expect(compileClass('rounded-3xl')).toContain('border-radius: 1.5rem');
      expect(compileClass('rounded-full')).toContain('border-radius: 9999px');
    });

    it('should compile border-radius for specific corners', () => {
      expect(compileClass('rounded-t')).toContain('border-top-left-radius:');
      expect(compileClass('rounded-r')).toContain('border-top-right-radius:');
      expect(compileClass('rounded-b')).toContain('border-bottom-right-radius:');
      expect(compileClass('rounded-l')).toContain('border-bottom-left-radius:');
      expect(compileClass('rounded-tl')).toContain('border-top-left-radius:');
      expect(compileClass('rounded-tr')).toContain('border-top-right-radius:');
      expect(compileClass('rounded-bl')).toContain('border-bottom-left-radius:');
      expect(compileClass('rounded-br')).toContain('border-bottom-right-radius:');
    });

    it('should compile divide utilities', () => {
      const divideX = compileClass('divide-x');
      // divide-x uses CSS custom properties for logical properties
      expect(divideX).toContain('border-inline-start-width');
      
      const divideY = compileClass('divide-y');
      expect(divideY).toContain('border-top-width');
    });
  });

  describe('Category 9: Basic Effects (Requirement 2.10)', () => {
    it('should compile shadow utilities', () => {
      expect(compileClass('shadow-sm')).toContain('box-shadow:');
      expect(compileClass('shadow')).toContain('box-shadow:');
      expect(compileClass('shadow-md')).toContain('box-shadow:');
      expect(compileClass('shadow-lg')).toContain('box-shadow:');
      expect(compileClass('shadow-xl')).toContain('box-shadow:');
      expect(compileClass('shadow-2xl')).toContain('box-shadow:');
      // shadow-none compiles to 'box-shadow: none'
      expect(compileClass('shadow-none')).toContain('box-shadow: none');
    });

    it('should compile opacity utilities', () => {
      expect(compileClass('opacity-0')).toContain('opacity: 0');
      expect(compileClass('opacity-25')).toContain('opacity: 0.25');
      expect(compileClass('opacity-50')).toContain('opacity: 0.5');
      expect(compileClass('opacity-75')).toContain('opacity: 0.75');
      expect(compileClass('opacity-100')).toContain('opacity: 1');
    });

    it('should compile ring utilities', () => {
      expect(compileClass('ring')).toContain('box-shadow:');
      expect(compileClass('ring-0')).toContain('box-shadow:');
      expect(compileClass('ring-1')).toContain('box-shadow:');
      expect(compileClass('ring-2')).toContain('box-shadow:');
      expect(compileClass('ring-4')).toContain('box-shadow:');
    });

    it('should compile inset-shadow utilities', () => {
      expect(compileClass('inset-shadow-sm')).toContain('box-shadow:');
      expect(compileClass('inset-shadow')).toContain('box-shadow:');
      expect(compileClass('inset-shadow-lg')).toContain('box-shadow:');
    });

    it('should compile inset-ring utilities', () => {
      expect(compileClass('inset-ring')).toContain('box-shadow:');
      expect(compileClass('inset-ring-1')).toContain('box-shadow:');
      expect(compileClass('inset-ring-2')).toContain('box-shadow:');
    });
  });

  describe('Category 10: Excluded Transform Utilities (Requirement 2.13)', () => {
    it('should NOT compile transform utilities', () => {
      expect(compileClass('rotate-45')).toBe('');
      expect(compileClass('rotate-90')).toBe('');
      expect(compileClass('-rotate-45')).toBe('');
      
      expect(compileClass('scale-50')).toBe('');
      expect(compileClass('scale-75')).toBe('');
      expect(compileClass('scale-100')).toBe('');
      expect(compileClass('scale-x-50')).toBe('');
      expect(compileClass('scale-y-50')).toBe('');
      
      expect(compileClass('translate-x-4')).toBe('');
      expect(compileClass('translate-y-4')).toBe('');
      expect(compileClass('-translate-x-4')).toBe('');
      expect(compileClass('-translate-y-4')).toBe('');
      
      expect(compileClass('skew-x-3')).toBe('');
      expect(compileClass('skew-y-6')).toBe('');
      expect(compileClass('-skew-x-3')).toBe('');
      
      expect(compileClass('origin-center')).toBe('');
      expect(compileClass('origin-top')).toBe('');
      expect(compileClass('origin-bottom-right')).toBe('');
    });
  });

  describe('Category 11: Excluded Filter Utilities (Requirement 2.14)', () => {
    it('should NOT compile filter utilities', () => {
      expect(compileClass('blur')).toBe('');
      expect(compileClass('blur-sm')).toBe('');
      expect(compileClass('blur-md')).toBe('');
      expect(compileClass('blur-lg')).toBe('');
      
      expect(compileClass('brightness-50')).toBe('');
      expect(compileClass('brightness-100')).toBe('');
      expect(compileClass('brightness-150')).toBe('');
      
      expect(compileClass('contrast-50')).toBe('');
      expect(compileClass('contrast-100')).toBe('');
      
      expect(compileClass('grayscale')).toBe('');
      expect(compileClass('grayscale-0')).toBe('');
      
      expect(compileClass('hue-rotate-15')).toBe('');
      expect(compileClass('hue-rotate-30')).toBe('');
      
      expect(compileClass('invert')).toBe('');
      expect(compileClass('invert-0')).toBe('');
      
      expect(compileClass('saturate-50')).toBe('');
      expect(compileClass('saturate-100')).toBe('');
      
      expect(compileClass('sepia')).toBe('');
      expect(compileClass('sepia-0')).toBe('');
      
      expect(compileClass('drop-shadow')).toBe('');
      expect(compileClass('drop-shadow-lg')).toBe('');
    });

    it('should NOT compile backdrop filter utilities', () => {
      expect(compileClass('backdrop-blur')).toBe('');
      expect(compileClass('backdrop-brightness-50')).toBe('');
      expect(compileClass('backdrop-contrast-100')).toBe('');
      expect(compileClass('backdrop-grayscale')).toBe('');
      expect(compileClass('backdrop-hue-rotate-15')).toBe('');
      expect(compileClass('backdrop-invert')).toBe('');
      expect(compileClass('backdrop-saturate-100')).toBe('');
      expect(compileClass('backdrop-sepia')).toBe('');
    });
  });

  describe('Category 12: Excluded Transition Utilities (Requirement 2.15)', () => {
    it('should NOT compile transition utilities', () => {
      expect(compileClass('transition')).toBe('');
      expect(compileClass('transition-none')).toBe('');
      expect(compileClass('transition-all')).toBe('');
      expect(compileClass('transition-colors')).toBe('');
      expect(compileClass('transition-opacity')).toBe('');
      expect(compileClass('transition-shadow')).toBe('');
      expect(compileClass('transition-transform')).toBe('');
      
      expect(compileClass('duration-75')).toBe('');
      expect(compileClass('duration-100')).toBe('');
      expect(compileClass('duration-150')).toBe('');
      expect(compileClass('duration-200')).toBe('');
      
      expect(compileClass('delay-75')).toBe('');
      expect(compileClass('delay-100')).toBe('');
      
      expect(compileClass('ease-linear')).toBe('');
      expect(compileClass('ease-in')).toBe('');
      expect(compileClass('ease-out')).toBe('');
      expect(compileClass('ease-in-out')).toBe('');
    });
  });

  describe('Category 13: Excluded Animation Utilities (Requirement 2.16)', () => {
    it('should NOT compile animation utilities', () => {
      expect(compileClass('animate-none')).toBe('');
      expect(compileClass('animate-spin')).toBe('');
      expect(compileClass('animate-ping')).toBe('');
      expect(compileClass('animate-pulse')).toBe('');
      expect(compileClass('animate-bounce')).toBe('');
    });
  });

  describe('Category 14: Responsive Breakpoints (Requirement 2.11)', () => {
    it('should compile sm: responsive variants', () => {
      const css = compileClass('sm:flex');
      expect(css).toContain('@media');
      expect(css).toContain('min-width:');
      expect(css).toContain('display: flex');
    });

    it('should compile md: responsive variants', () => {
      const css = compileClass('md:grid');
      expect(css).toContain('@media');
      expect(css).toContain('min-width:');
      expect(css).toContain('display: grid');
    });

    it('should compile lg: responsive variants', () => {
      const css = compileClass('lg:block');
      expect(css).toContain('@media');
      expect(css).toContain('min-width:');
      expect(css).toContain('display: block');
    });

    it('should compile xl: and 2xl: responsive variants', () => {
      const cssXl = compileClass('xl:hidden');
      expect(cssXl).toContain('@media');
      expect(cssXl).toContain('display: none');
      
      const css2xl = compileClass('2xl:flex');
      expect(css2xl).toContain('@media');
      expect(css2xl).toContain('display: flex');
    });

    it('should compile container breakpoints (@sm:, @md:, etc.)', () => {
      const cssSm = compileClass('@sm:flex');
      expect(cssSm).toContain('@container');
      expect(cssSm).toContain('min-width:');
      expect(cssSm).toContain('display: flex');
      
      const cssMd = compileClass('@md:grid');
      expect(cssMd).toContain('@container');
      expect(cssMd).toContain('display: grid');
    });

    it('should combine responsive with core utilities', () => {
      expect(compileClass('sm:m-4')).toContain('margin: 1rem');
      expect(compileClass('md:p-8')).toContain('padding: 2rem');
      expect(compileClass('lg:text-xl')).toContain('font-size: 1.25rem');
      expect(compileClass('xl:bg-blue-500')).toContain('background-color:');
      expect(compileClass('2xl:border-2')).toContain('border-width: 2px');
    });
  });

  describe('Category 15: Basic State Variants (Requirement 2.12)', () => {
    it('should compile hover variant', () => {
      const css = compileClass('hover:bg-blue-500');
      expect(css).toContain(':hover');
      expect(css).toContain('background-color:');
    });

    it('should compile focus variant', () => {
      const css = compileClass('focus:border-red-500');
      expect(css).toContain(':focus');
      expect(css).toContain('border-color:');
    });

    it('should compile active variant', () => {
      const css = compileClass('active:bg-green-500');
      expect(css).toContain(':active');
      expect(css).toContain('background-color:');
    });

    it('should compile disabled variant', () => {
      const css = compileClass('disabled:opacity-50');
      expect(css).toContain(':disabled');
      expect(css).toContain('opacity: 0.5');
    });

    it('should compile focus-visible variant', () => {
      const css = compileClass('focus-visible:ring-2');
      expect(css).toContain(':focus-visible');
      expect(css).toContain('box-shadow:');
    });

    it('should compile first and last variants', () => {
      const first = compileClass('first:mt-0');
      expect(first).toContain(':first-child');
      expect(first).toContain('margin-top: 0');
      
      const last = compileClass('last:mb-0');
      expect(last).toContain(':last-child');
      expect(last).toContain('margin-bottom: 0');
    });

    it('should compile dark mode variant', () => {
      const css = compileClass('dark:bg-gray-900');
      expect(css).toContain('.dark');
      expect(css).toContain('background-color:');
    });

    it('should combine variants with responsive breakpoints', () => {
      const css = compileClass('md:hover:bg-blue-500');
      expect(css).toContain('@media');
      expect(css).toContain(':hover');
      expect(css).toContain('background-color:');
    });

    it('should compile multiple variants on same utility', () => {
      const css = compileClass('hover:focus:bg-blue-500');
      expect(css).toContain(':hover');
      expect(css).toContain(':focus');
      expect(css).toContain('background-color:');
    });
  });

  describe('Category 16: Excluded Advanced Variants (Requirement 2.17)', () => {
    it('should NOT compile group-* variants', () => {
      expect(compileClass('group-hover:bg-blue-500')).toBe('');
      expect(compileClass('group-focus:text-white')).toBe('');
      expect(compileClass('group-active:opacity-75')).toBe('');
    });

    it('should NOT compile peer-* variants', () => {
      expect(compileClass('peer-hover:bg-blue-500')).toBe('');
      expect(compileClass('peer-focus:text-white')).toBe('');
      expect(compileClass('peer-checked:block')).toBe('');
      expect(compileClass('peer-disabled:opacity-50')).toBe('');
    });

    it('should NOT compile has-* variants', () => {
      expect(compileClass('has-[:checked]:bg-blue-500')).toBe('');
      expect(compileClass('has-[:focus]:border-red-500')).toBe('');
    });

    it('should NOT compile data-* variants', () => {
      expect(compileClass('data-[state=open]:block')).toBe('');
      expect(compileClass('data-[active]:bg-blue-500')).toBe('');
    });

    it('should NOT compile aria-* variants', () => {
      expect(compileClass('aria-[expanded=true]:rotate-180')).toBe('');
      expect(compileClass('aria-[hidden]:hidden')).toBe('');
    });

    it('should NOT compile arbitrary variants', () => {
      expect(compileClass('[&>span]:text-red-500')).toBe('');
      expect(compileClass('[@media(hover:hover)]:underline')).toBe('');
    });

    it('should NOT compile named group variants', () => {
      expect(compileClass('group/sidebar')).toBe('');
      expect(compileClass('group-hover/sidebar:bg-blue-500')).toBe('');
      expect(compileClass('peer/toggle')).toBe('');
      expect(compileClass('peer-checked/toggle:bg-green-500')).toBe('');
    });
  });

  describe('compileCriticalCss', () => {
    it('should compile multiple class names', () => {
      const css = compileCriticalCss(['flex', 'items-center', 'justify-between']);
      
      expect(css).toContain('display: flex');
      expect(css).toContain('align-items: center');
      expect(css).toContain('justify-content: space-between');
    });

    it('should deduplicate identical classes', () => {
      const css = compileCriticalCss(['flex', 'flex', 'flex']);
      const matches = (css.match(/display: flex/g) || []).length;
      
      expect(matches).toBe(1);
    });

    it('should handle empty input', () => {
      expect(compileCriticalCss([])).toBe('');
      expect(compileCriticalCss('')).toBe('');
    });

    it('should handle space-separated string input', () => {
      const css = compileCriticalCss('flex items-center p-4');
      
      expect(css).toContain('display: flex');
      expect(css).toContain('align-items: center');
      expect(css).toContain('padding: 1rem');
    });

    it('should skip excluded utilities', () => {
      const css = compileCriticalCss(['flex', 'rotate-45', 'blur', 'transition']);
      
      expect(css).toContain('display: flex');
      expect(css).not.toContain('rotate');
      expect(css).not.toContain('blur');
      expect(css).not.toContain('transition');
    });
  });

  describe('parseClass', () => {
    it('should parse basic class names', () => {
      const parsed = parseClass('flex');
      
      expect(parsed).toBeDefined();
      expect(parsed.baseToken).toBe('flex');
      expect(parsed.variants).toEqual([]);
      expect(parsed.important).toBe(false);
    });

    it('should parse responsive breakpoints', () => {
      const parsed = parseClass('md:flex', { md: '768px' });
      
      expect(parsed.baseToken).toBe('flex');
      expect(parsed.breakpoint).toBe('md');
      expect(parsed.variants).toEqual([]);
    });

    it('should parse variants', () => {
      const parsed = parseClass('hover:bg-blue-500');
      
      expect(parsed.baseToken).toBe('bg-blue-500');
      expect(parsed.variants).toEqual(['hover']);
      expect(parsed.breakpoint).toBeNull();
    });

    it('should parse important modifier', () => {
      const parsed = parseClass('!flex');
      
      expect(parsed.baseToken).toBe('flex');
      expect(parsed.important).toBe(true);
    });

    it('should parse container breakpoints', () => {
      const parsed = parseClass('@sm:flex', {}, { sm: '384px' });
      
      expect(parsed.baseToken).toBe('flex');
      expect(parsed.containerBreakpoint).toBe('sm');
    });

    it('should parse starting variant', () => {
      const parsed = parseClass('starting:opacity-0');
      
      expect(parsed.baseToken).toBe('opacity-0');
      expect(parsed.starting).toBe(true);
    });
  });

  describe('Lite Builder Registry', () => {
    it('should have correct prefix mappings', () => {
      // Core utilities should be mapped
      expect(LITE_PREFIX_ROUTER['flex']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['grid']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['text']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['bg']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['border']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['m']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['p']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['w']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['h']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['shadow']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['opacity']).toBeDefined();
      expect(LITE_PREFIX_ROUTER['ring']).toBeDefined();
    });

    it('should NOT have excluded utility mappings', () => {
      // Extended utilities should not be mapped
      expect(LITE_PREFIX_ROUTER['rotate']).toBeUndefined();
      expect(LITE_PREFIX_ROUTER['scale']).toBeUndefined();
      expect(LITE_PREFIX_ROUTER['translate']).toBeUndefined();
      expect(LITE_PREFIX_ROUTER['blur']).toBeUndefined();
      expect(LITE_PREFIX_ROUTER['brightness']).toBeUndefined();
      expect(LITE_PREFIX_ROUTER['transition']).toBeUndefined();
      expect(LITE_PREFIX_ROUTER['duration']).toBeUndefined();
      expect(LITE_PREFIX_ROUTER['animate']).toBeUndefined();
    });
  });

  describe('Lite Variant Map', () => {
    it('should have basic state variants', () => {
      expect(LITE_VARIANT_MAP.has('hover')).toBe(true);
      expect(LITE_VARIANT_MAP.has('focus')).toBe(true);
      expect(LITE_VARIANT_MAP.has('active')).toBe(true);
      expect(LITE_VARIANT_MAP.has('disabled')).toBe(true);
      expect(LITE_VARIANT_MAP.has('focus-visible')).toBe(true);
      expect(LITE_VARIANT_MAP.has('dark')).toBe(true);
    });

    it('should have structural pseudo-classes', () => {
      expect(LITE_VARIANT_MAP.has('first')).toBe(true);
      expect(LITE_VARIANT_MAP.has('last')).toBe(true);
      expect(LITE_VARIANT_MAP.has('odd')).toBe(true);
      expect(LITE_VARIANT_MAP.has('even')).toBe(true);
      expect(LITE_VARIANT_MAP.has('only')).toBe(true);
      expect(LITE_VARIANT_MAP.has('empty')).toBe(true);
    });

    it('should NOT have advanced variants', () => {
      expect(LITE_VARIANT_MAP.has('group-hover')).toBe(false);
      expect(LITE_VARIANT_MAP.has('peer-hover')).toBe(false);
      expect(LITE_VARIANT_MAP.has('peer-checked')).toBe(false);
      expect(LITE_VARIANT_MAP.has('peer-focus')).toBe(false);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle arbitrary values in core utilities', () => {
      expect(compileClass('w-[32px]')).toContain('width: 32px');
      expect(compileClass('h-[100vh]')).toContain('height: 100vh');
      expect(compileClass('m-[1.5rem]')).toContain('margin: 1.5rem');
      expect(compileClass('text-[#ff0000]')).toContain('color: #ff0000');
    });

    it('should handle negative values', () => {
      expect(compileClass('-m-4')).toContain('margin: -1rem');
      expect(compileClass('-mt-8')).toContain('margin-top: -2rem');
      expect(compileClass('-mx-4')).toContain('margin-left: -1rem');
    });

    it('should handle important modifier with all utilities', () => {
      expect(compileClass('!flex')).toContain('!important');
      expect(compileClass('!m-4')).toContain('!important');
      expect(compileClass('!text-xl')).toContain('!important');
      expect(compileClass('!bg-blue-500')).toContain('!important');
    });

    it('should handle complex class combinations', () => {
      // Test combination of variants
      const css = compileClass('hover:focus:bg-blue-500');
      expect(css).toContain(':hover');
      expect(css).toContain(':focus');
      expect(css).toContain('background-color:');
      
      // Test with important modifier (! must come before variants)
      const cssImportant = compileClass('!hover:bg-blue-500');
      expect(cssImportant).toContain(':hover');
      expect(cssImportant).toContain('background-color:');
      expect(cssImportant).toContain('!important');
      
      // Test with responsive when screens provided
      const cssResponsive = compileClass('md:hover:bg-blue-500', {
        theme: { screens: { md: '768px' } }
      });
      expect(cssResponsive).toContain('@media');
      expect(cssResponsive).toContain(':hover');
      expect(cssResponsive).toContain('background-color:');
    });

    it('should return empty string for invalid class names', () => {
      expect(compileClass('')).toBe('');
      expect(compileClass('   ')).toBe('');
      expect(compileClass(null)).toBe('');
      expect(compileClass(undefined)).toBe('');
    });

    it('should handle fractional values', () => {
      expect(compileClass('w-1/2')).toContain('width: 50%');
      expect(compileClass('w-1/3')).toContain('width: 33.333333%');
      expect(compileClass('w-2/3')).toContain('width: 66.666667%');
      expect(compileClass('w-1/4')).toContain('width: 25%');
      expect(compileClass('w-3/4')).toContain('width: 75%');
    });

    it('should verify all 10 categories compile successfully', () => {
      // Layout
      expect(compileClass('block')).toBeTruthy();
      expect(compileClass('flex')).toBeTruthy();
      expect(compileClass('relative')).toBeTruthy();
      expect(compileClass('overflow-hidden')).toBeTruthy();
      
      // Spacing
      expect(compileClass('m-4')).toBeTruthy();
      expect(compileClass('p-8')).toBeTruthy();
      expect(compileClass('gap-4')).toBeTruthy();
      
      // Sizing
      expect(compileClass('w-full')).toBeTruthy();
      expect(compileClass('h-screen')).toBeTruthy();
      expect(compileClass('max-w-lg')).toBeTruthy();
      
      // Flexbox
      expect(compileClass('items-center')).toBeTruthy();
      expect(compileClass('justify-between')).toBeTruthy();
      expect(compileClass('flex-col')).toBeTruthy();
      
      // Grid
      expect(compileClass('grid-cols-3')).toBeTruthy();
      expect(compileClass('col-span-2')).toBeTruthy();
      expect(compileClass('grid-flow-row')).toBeTruthy();
      
      // Typography
      expect(compileClass('text-xl')).toBeTruthy();
      expect(compileClass('font-bold')).toBeTruthy();
      expect(compileClass('leading-relaxed')).toBeTruthy();
      
      // Colors
      expect(compileClass('text-red-500')).toBeTruthy();
      expect(compileClass('bg-blue-500')).toBeTruthy();
      expect(compileClass('border-green-500')).toBeTruthy();
      
      // Borders
      expect(compileClass('border-2')).toBeTruthy();
      expect(compileClass('rounded-lg')).toBeTruthy();
      expect(compileClass('border-solid')).toBeTruthy();
      
      // Basic Effects
      expect(compileClass('shadow-lg')).toBeTruthy();
      expect(compileClass('opacity-75')).toBeTruthy();
      expect(compileClass('ring-2')).toBeTruthy();
      
      // Responsive Breakpoints
      expect(compileClass('md:flex')).toBeTruthy();
      expect(compileClass('lg:grid')).toBeTruthy();
      
      // Basic Variants
      expect(compileClass('hover:bg-blue-500')).toBeTruthy();
      expect(compileClass('focus:border-red-500')).toBeTruthy();
      expect(compileClass('dark:bg-gray-900')).toBeTruthy();
    });

    it('should verify excluded utilities return empty string', () => {
      // Transforms
      expect(compileClass('rotate-45')).toBe('');
      expect(compileClass('scale-50')).toBe('');
      expect(compileClass('translate-x-4')).toBe('');
      
      // Filters
      expect(compileClass('blur')).toBe('');
      expect(compileClass('brightness-50')).toBe('');
      expect(compileClass('grayscale')).toBe('');
      
      // Transitions
      expect(compileClass('transition')).toBe('');
      expect(compileClass('duration-300')).toBe('');
      expect(compileClass('ease-in-out')).toBe('');
      
      // Animations
      expect(compileClass('animate-spin')).toBe('');
      expect(compileClass('animate-pulse')).toBe('');
    });

    it('should verify excluded variants return empty string', () => {
      expect(compileClass('group-hover:bg-blue-500')).toBe('');
      expect(compileClass('peer-focus:text-white')).toBe('');
      expect(compileClass('has-[:checked]:block')).toBe('');
      expect(compileClass('data-[state=open]:flex')).toBe('');
      expect(compileClass('aria-[expanded=true]:rotate-180')).toBe('');
      expect(compileClass('[&>span]:text-red-500')).toBe('');
    });
  });

  describe('Performance and Caching', () => {
    it('should cache parsed classes', () => {
      const first = parseClass('flex');
      const second = parseClass('flex');
      
      // Both should return valid parsed objects
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect(first.baseToken).toBe('flex');
      expect(second.baseToken).toBe('flex');
    });

    it('should handle large批量 compilation efficiently', () => {
      const classes = [
        'flex', 'items-center', 'justify-between', 'p-4', 'bg-white',
        'shadow-lg', 'rounded-xl', 'text-gray-900', 'font-semibold',
        'hover:shadow-xl', 'focus:ring-2', 'active:bg-gray-100',
        'md:flex-row', 'lg:p-8', 'xl:rounded-2xl',
        'w-full', 'h-auto', 'max-w-4xl', 'mx-auto', 'my-8',
      ];
      
      const startTime = Date.now();
      const css = compileCriticalCss(classes);
      const endTime = Date.now();
      
      // Should compile all classes
      expect(css).toContain('display: flex');
      expect(css).toContain('align-items: center');
      expect(css).toContain('padding: 1rem');
      
      // Should complete reasonably fast (< 100ms for 20 classes)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Real-world Examples', () => {
    it('should compile a complete card component', () => {
      const cardClasses = 'flex flex-col gap-4 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl';
      const css = compileCriticalCss(cardClasses);
      
      expect(css).toContain('display: flex');
      expect(css).toContain('flex-direction: column');
      expect(css).toContain('gap: 1rem');
      expect(css).toContain('padding: 1.5rem');
      expect(css).toContain('background-color:');
      expect(css).toContain('border-radius: 0.5rem');
      expect(css).toContain('box-shadow:');
      expect(css).toContain(':hover');
    });

    it('should compile a responsive navigation bar', () => {
      const navClasses = 'flex items-center justify-between p-4 bg-white md:px-8 lg:px-12';
      const css = compileCriticalCss(navClasses);
      
      expect(css).toContain('display: flex');
      expect(css).toContain('align-items: center');
      expect(css).toContain('justify-content: space-between');
      expect(css).toContain('padding: 1rem');
      expect(css).toContain('@media');
    });

    it('should compile a form input with states', () => {
      const inputClasses = 'w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 disabled:opacity-50';
      const css = compileCriticalCss(inputClasses);
      
      expect(css).toContain('width: 100%');
      expect(css).toContain('padding: 0.75rem');
      expect(css).toContain('border-width: 1px');
      expect(css).toContain('border-radius: 0.375rem');
      expect(css).toContain(':focus');
      expect(css).toContain(':disabled');
      expect(css).toContain('opacity: 0.5');
    });

    it('should compile a grid layout', () => {
      const gridClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      const css = compileCriticalCss(gridClasses);
      
      expect(css).toContain('display: grid');
      expect(css).toContain('grid-template-columns:');
      expect(css).toContain('gap: 1.5rem');
      expect(css).toContain('@media');
    });
  });
});
