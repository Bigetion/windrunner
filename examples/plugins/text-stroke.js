/**
 * Text Stroke Plugin for Windrunner
 * 
 * Adds text-stroke utilities for outlined text effects
 * 
 * Usage:
 *   text-stroke-1, text-stroke-2, etc.
 *   text-stroke-blue-500, text-stroke-red-600, etc.
 */

import { plugin } from 'windrunner';

export const textStrokePlugin = plugin(({ addUtility, addUtilities, theme }) => {
  // Add width utilities
  const borderWidths = theme('borderWidth') || { 1: '1px', 2: '2px', 4: '4px' };
  
  Object.entries(borderWidths).forEach(([key, value]) => {
    const className = key === 'DEFAULT' ? 'text-stroke' : `text-stroke-${key}`;
    addUtility(className, `-webkit-text-stroke-width: ${value}; text-stroke-width: ${value};`);
  });

  // Add color utilities
  const colors = theme('colors') || {};
  const colorUtilities = {};
  
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'string') {
      // Simple color (e.g., black, white)
      colorUtilities[`text-stroke-${colorName}`] = 
        `-webkit-text-stroke-color: ${colorValue}; text-stroke-color: ${colorValue};`;
    } else if (typeof colorValue === 'object') {
      // Color with shades (e.g., blue-500)
      Object.entries(colorValue).forEach(([shade, value]) => {
        colorUtilities[`text-stroke-${colorName}-${shade}`] =
          `-webkit-text-stroke-color: ${value}; text-stroke-color: ${value};`;
      });
    }
  });
  
  addUtilities(colorUtilities);
});

// Example usage in HTML:
/*
<h1 class="text-4xl font-bold text-white text-stroke-2 text-stroke-black">
  Outlined Text
</h1>
*/
