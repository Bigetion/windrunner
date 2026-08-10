import { createWindrunner } from './runtime-lite.js';
import { resolveRuntimeContextLite } from './compiler-lite.js';
import { plugin, defineUtilities, defineResponsiveUtilities } from './plugins.js';

// Export lite-specific compiler functions
export { compileClass, compileCriticalCss, compileCriticalCssFromHtml, compileCriticalCssFromFiles, extractClassNames } from './compiler-lite.js';
export { plugin, defineUtilities, defineResponsiveUtilities };

/**
 * Lite windrunner runtime with reduced utility coverage
 * Bundle size target: ≤ 35 KB minified
 * 
 * Included utilities:
 * - Layout (display, position, overflow, z-index, float, clear, aspect-ratio, columns, isolation, object-fit, object-position)
 * - Spacing (margin, padding, gap, space-x/y with negative values)
 * - Sizing (width, height, min-w/h, max-w/h, size)
 * - Flexbox (flex, grow, shrink, basis, direction, wrap, align, justify, place)
 * - Grid (grid-cols/rows, col/row-span, grid-flow, auto-cols/rows, place-items/content/self)
 * - Typography (font-size, font-weight, line-height, letter-spacing, text-align, text-color, text-decoration, text-transform, text-overflow, whitespace, word-break)
 * - Colors (full OKLCH palette with opacity modifiers)
 * - Borders (border-width, border-style, border-color, border-radius)
 * - Basic Effects (shadow, opacity, inset-shadow, ring, inset-ring)
 * 
 * Included variants:
 * - Responsive breakpoints (sm:, md:, lg:, xl:, 2xl:, @sm:, @md:, @lg:, @xl:, @2xl:)
 * - Basic state variants (hover:, focus:, active:, disabled:, focus-visible:, first:, last:)
 * - Dark mode (dark:)
 * 
 * Excluded from lite build:
 * - Transform utilities (rotate, scale, translate, skew, origin, perspective)
 * - Filter utilities (blur, brightness, contrast, grayscale, hue-rotate, invert, saturate, sepia, drop-shadow, backdrop-*)
 * - Transition utilities (transition, duration, delay, ease)
 * - Animation utilities (animate-spin, animate-ping, animate-pulse, animate-bounce)
 * - Advanced variants (group-*, peer-*, has-*, data-*, aria-*, arbitrary variants, named groups)
 * 
 * @param {object} options - Windrunner configuration options
 * @returns {object} - Windrunner runtime instance
 * 
 * @example
 * import windrunner from 'windrunner/lite';
 * 
 * windrunner({
 *   preflight: true,
 *   fouc: { strategy: 'opacity', duration: 150 }
 * });
 */
export default function windrunnerLite(options = {}) {
  const runtime = createWindrunner({
    ...options,
    __LITE_MODE__: true, // Internal flag for error messaging
  });
  
  if (typeof window === 'object' && options.autoStart !== false) {
    runtime.start();
  }
  
  return runtime;
}

/**
 * Create a lite windrunner runtime instance without auto-starting
 * 
 * @param {object} options - Windrunner configuration options
 * @returns {object} - Windrunner runtime instance
 * 
 * @example
 * import { createWindrunnerLite } from 'windrunner/lite';
 * 
 * const runtime = createWindrunnerLite({
 *   preflight: true,
 *   autoStart: false
 * });
 * 
 * // Manually start when ready
 * runtime.start();
 */
export function createWindrunnerLite(options = {}) {
  return createWindrunner({
    ...options,
    __LITE_MODE__: true,
  });
}
