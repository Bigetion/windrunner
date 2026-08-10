/**
 * FOUC (Flash of Unstyled Content) prevention manager
 * Hides content before first scan, reveals after CSS injection
 * 
 * Supports three strategies:
 * - 'opacity': Fade in from opacity 0
 * - 'visibility': Hide with visibility hidden
 * - 'none': No automatic FOUC prevention
 */
export class FOUCManager {
  constructor(config, styleId) {
    this.strategy = config?.strategy || 'none';
    this.duration = config?.duration || 150;
    this.selector = config?.selector || 'html';
    this.styleId = styleId;
    this.revealed = false;
    this.hiddenElements = [];
  }
  
  /**
   * Apply hiding styles before first scan
   * Called synchronously before DOM observation starts
   */
  hide() {
    if (this.strategy === 'none' || typeof document !== 'object') return;
    
    const elements = document.querySelectorAll(this.selector);
    
    elements.forEach(el => {
      // Store original values for restoration
      const original = {
        element: el,
        opacity: el.style.opacity,
        visibility: el.style.visibility,
        transition: el.style.transition,
      };
      
      this.hiddenElements.push(original);
      
      // Apply hiding strategy
      if (this.strategy === 'opacity') {
        el.style.opacity = '0';
        el.style.transition = 'none';
      } else if (this.strategy === 'visibility') {
        el.style.visibility = 'hidden';
      }
    });
  }
  
  /**
   * Reveal content with smooth transition
   * Called after first scan completes
   * Uses double rAF to ensure reveal happens after browser paint
   */
  reveal() {
    if (this.revealed || this.strategy === 'none') return;
    if (typeof requestAnimationFrame !== 'function') {
      this._revealImmediate();
      return;
    }
    
    // Double rAF to ensure reveal happens after browser paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._revealWithTransition();
      });
    });
  }
  
  _revealWithTransition() {
    if (this.hiddenElements.length === 0) {
      // No elements to reveal, but still mark as revealed
      this.revealed = true;
      return;
    }
    
    this.hiddenElements.forEach(({ element, opacity, visibility, transition }) => {
      if (this.strategy === 'opacity') {
        // Apply transition
        element.style.transition = `opacity ${this.duration}ms ease-in-out`;
        
        // Trigger reflow
        element.offsetHeight; // eslint-disable-line no-unused-expressions
        
        // Restore opacity
        element.style.opacity = opacity || '';
        
        // Cleanup after transition
        setTimeout(() => {
          element.style.transition = transition || '';
        }, this.duration);
        
      } else if (this.strategy === 'visibility') {
        element.style.visibility = visibility || '';
      }
    });
    
    this.revealed = true;
    this.hiddenElements = [];
  }
  
  _revealImmediate() {
    this.hiddenElements.forEach(({ element, opacity, visibility }) => {
      if (this.strategy === 'opacity') {
        element.style.opacity = opacity || '';
        element.style.transition = '';
      } else if (this.strategy === 'visibility') {
        element.style.visibility = visibility || '';
      }
    });
    
    this.revealed = true;
    this.hiddenElements = [];
  }
  
  /**
   * Check if FOUC prevention is active
   */
  isActive() {
    return this.strategy !== 'none';
  }
}
