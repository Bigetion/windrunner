/**
 * Custom Variants Plugin for Windrunner
 * 
 * Adds useful custom state variants
 * 
 * Usage:
 *   parent-hover:bg-blue-500
 *   sibling-focus:text-red-500
 *   loading:opacity-50
 */

import { plugin } from 'windrunner';

export const customVariantsPlugin = plugin(({ addVariant, addVariants }) => {
  // Single variant
  addVariant('parent-hover', (selector) => {
    return `.parent:hover ${selector}`;
  });
  
  // Multiple variants at once
  addVariants({
    // Sibling state
    'sibling-hover': (selector) => `.sibling:hover ~ ${selector}`,
    'sibling-focus': (selector) => `.sibling:focus ~ ${selector}`,
    
    // Custom data attributes
    'loading': (selector) => `${selector}[data-loading="true"]`,
    'error': (selector) => `${selector}[data-error="true"]`,
    'success': (selector) => `${selector}[data-success="true"]`,
    
    // Custom states
    'expanded': (selector) => `${selector}[aria-expanded="true"]`,
    'collapsed': (selector) => `${selector}[aria-expanded="false"]`,
    
    // Direction variants
    'rtl': (selector) => `[dir="rtl"] ${selector}`,
    'ltr': (selector) => `[dir="ltr"] ${selector}`,
    
    // Print variant
    'print': (selector) => `@media print { ${selector} }`,
    
    // Reduced motion
    'motion-safe': (selector) => `@media (prefers-reduced-motion: no-preference) { ${selector} }`,
    'motion-reduce': (selector) => `@media (prefers-reduced-motion: reduce) { ${selector} }`,
  });
});

// Example usage in HTML:
/*
<div class="parent">
  <button class="parent-hover:bg-blue-600">
    Hover parent to change me
  </button>
</div>

<div data-loading="true" class="loading:opacity-50 loading:cursor-wait">
  Loading content...
</div>

<button aria-expanded="false" class="expanded:rotate-180">
  <svg>...</svg>
</button>
*/
