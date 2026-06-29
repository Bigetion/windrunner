/**
 * Glass Morphism Plugin for Windrunner
 * 
 * Adds glassmorphism effect utilities
 * 
 * Usage:
 *   glass, glass-sm, glass-lg
 */

import { plugin } from 'windrunner';

export const glassMorphismPlugin = plugin(({ addUtilities }) => {
  addUtilities({
    'glass': `
      backdrop-filter: blur(10px) saturate(180%);
      -webkit-backdrop-filter: blur(10px) saturate(180%);
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `,
    
    'glass-sm': `
      backdrop-filter: blur(5px) saturate(150%);
      -webkit-backdrop-filter: blur(5px) saturate(150%);
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `,
    
    'glass-lg': `
      backdrop-filter: blur(20px) saturate(200%);
      -webkit-backdrop-filter: blur(20px) saturate(200%);
      background-color: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
    `,
    
    'glass-dark': `
      backdrop-filter: blur(10px) saturate(180%);
      -webkit-backdrop-filter: blur(10px) saturate(180%);
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `,
  });
});

// Example usage in HTML:
/*
<div class="glass p-8 rounded-xl">
  <h2 class="text-2xl font-bold">Glass Card</h2>
  <p>Beautiful glassmorphism effect</p>
</div>
*/
