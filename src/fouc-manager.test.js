import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FOUCManager } from './fouc-manager.js';

describe('FOUCManager', () => {
  let manager;
  let mockElements;
  
  beforeEach(() => {
    // Setup mock DOM
    mockElements = [
      {
        style: {
          opacity: '',
          visibility: '',
          transition: '',
        },
        offsetHeight: 100,
      },
      {
        style: {
          opacity: '0.5',
          visibility: 'visible',
          transition: 'all 0.3s',
        },
        offsetHeight: 200,
      },
    ];
    
    // Mock document.querySelectorAll
    global.document = {
      querySelectorAll: vi.fn((selector) => mockElements),
    };
    
    // Mock requestAnimationFrame - execute callbacks immediately for testing
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 0); // Execute async
      return 1;
    });
    
    // Mock setTimeout
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete global.document;
    delete global.requestAnimationFrame;
  });
  
  describe('constructor', () => {
    it('should use default values when no config provided', () => {
      manager = new FOUCManager(null, 'test-style');
      
      expect(manager.strategy).toBe('none');
      expect(manager.duration).toBe(150);
      expect(manager.selector).toBe('html');
      expect(manager.styleId).toBe('test-style');
      expect(manager.revealed).toBe(false);
    });
    
    it('should use provided config values', () => {
      manager = new FOUCManager(
        { strategy: 'opacity', duration: 300, selector: 'body' },
        'custom-style'
      );
      
      expect(manager.strategy).toBe('opacity');
      expect(manager.duration).toBe(300);
      expect(manager.selector).toBe('body');
      expect(manager.styleId).toBe('custom-style');
    });
    
    it('should use defaults for missing config properties', () => {
      manager = new FOUCManager({ strategy: 'visibility' }, 'test-style');
      
      expect(manager.strategy).toBe('visibility');
      expect(manager.duration).toBe(150);
      expect(manager.selector).toBe('html');
    });
  });
  
  describe('hide()', () => {
    it('should not apply styles when strategy is none', () => {
      manager = new FOUCManager({ strategy: 'none' }, 'test-style');
      
      manager.hide();
      
      expect(global.document.querySelectorAll).not.toHaveBeenCalled();
      expect(manager.hiddenElements).toHaveLength(0);
    });
    
    it('should not apply styles when document is not available', () => {
      delete global.document;
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      
      manager.hide();
      
      expect(manager.hiddenElements).toHaveLength(0);
    });
    
    it('should apply opacity hiding strategy', () => {
      manager = new FOUCManager({ strategy: 'opacity', selector: '.app' }, 'test-style');
      
      manager.hide();
      
      expect(global.document.querySelectorAll).toHaveBeenCalledWith('.app');
      expect(manager.hiddenElements).toHaveLength(2);
      
      // First element
      expect(mockElements[0].style.opacity).toBe('0');
      expect(mockElements[0].style.transition).toBe('none');
      
      // Second element
      expect(mockElements[1].style.opacity).toBe('0');
      expect(mockElements[1].style.transition).toBe('none');
      
      // Original values stored
      expect(manager.hiddenElements[0].opacity).toBe('');
      expect(manager.hiddenElements[1].opacity).toBe('0.5');
      expect(manager.hiddenElements[1].transition).toBe('all 0.3s');
    });
    
    it('should apply visibility hiding strategy', () => {
      manager = new FOUCManager({ strategy: 'visibility' }, 'test-style');
      
      manager.hide();
      
      // First element
      expect(mockElements[0].style.visibility).toBe('hidden');
      expect(mockElements[0].style.opacity).toBe(''); // Not touched
      
      // Second element
      expect(mockElements[1].style.visibility).toBe('hidden');
      
      // Original values stored
      expect(manager.hiddenElements[0].visibility).toBe('');
      expect(manager.hiddenElements[1].visibility).toBe('visible');
    });
  });
  
  describe('reveal()', () => {
    it('should not reveal when strategy is none', () => {
      manager = new FOUCManager({ strategy: 'none' }, 'test-style');
      manager.hiddenElements = [{ element: mockElements[0] }];
      
      manager.reveal();
      
      expect(manager.hiddenElements).toHaveLength(1); // Not cleared
      expect(manager.revealed).toBe(false);
    });
    
    it('should not reveal when already revealed', () => {
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      manager.revealed = true;
      manager.hiddenElements = [{ element: mockElements[0] }];
      
      manager.reveal();
      
      expect(manager.hiddenElements).toHaveLength(1); // Not cleared
    });
    
    it('should use double requestAnimationFrame for timing', async () => {
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      manager.hide();
      
      const rafSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      manager.reveal();
      
      // Wait for async execution
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      });
      
      // Double rAF called
      expect(rafSpy).toHaveBeenCalledTimes(2);
      
      rafSpy.mockRestore();
    });
    
    it('should reveal with opacity transition', async () => {
      manager = new FOUCManager({ strategy: 'opacity', duration: 200 }, 'test-style');
      manager.hide();
      
      manager.reveal();
      
      // Wait for async execution
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      });
      
      // Transition applied
      expect(mockElements[0].style.transition).toBe('opacity 200ms ease-in-out');
      expect(mockElements[1].style.transition).toBe('opacity 200ms ease-in-out');
      
      // Opacity restored to original values
      expect(mockElements[0].style.opacity).toBe('');
      expect(mockElements[1].style.opacity).toBe('0.5');
      
      // Manager state updated
      expect(manager.hiddenElements).toHaveLength(0);
    });
    
    it('should cleanup transition after duration', async () => {
      manager = new FOUCManager({ strategy: 'opacity', duration: 150 }, 'test-style');
      manager.hide();
      
      manager.reveal();
      
      // Wait for async execution
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      });
      
      // Before timeout
      expect(mockElements[0].style.transition).toBe('opacity 150ms ease-in-out');
      expect(mockElements[1].style.transition).toBe('opacity 150ms ease-in-out');
      
      // After timeout
      vi.advanceTimersByTime(150);
      
      expect(mockElements[0].style.transition).toBe('');
      expect(mockElements[1].style.transition).toBe('all 0.3s'); // Restored to original
    });
    
    it('should reveal with visibility strategy', async () => {
      manager = new FOUCManager({ strategy: 'visibility' }, 'test-style');
      manager.hide();
      
      manager.reveal();
      
      // Wait for async execution
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      });
      
      // Visibility restored
      expect(mockElements[0].style.visibility).toBe('');
      expect(mockElements[1].style.visibility).toBe('visible');
      
      // Manager state updated
      expect(manager.hiddenElements).toHaveLength(0);
    });
    
    it('should fallback to immediate reveal when requestAnimationFrame unavailable', () => {
      delete global.requestAnimationFrame;
      
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      manager.hide();
      
      manager.reveal();
      
      // Immediately revealed without transition
      expect(mockElements[0].style.opacity).toBe('');
      expect(mockElements[0].style.transition).toBe('');
      expect(manager.revealed).toBe(true);
    });
  });
  
  describe('isActive()', () => {
    it('should return false when strategy is none', () => {
      manager = new FOUCManager({ strategy: 'none' }, 'test-style');
      
      expect(manager.isActive()).toBe(false);
    });
    
    it('should return true when strategy is opacity', () => {
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      
      expect(manager.isActive()).toBe(true);
    });
    
    it('should return true when strategy is visibility', () => {
      manager = new FOUCManager({ strategy: 'visibility' }, 'test-style');
      
      expect(manager.isActive()).toBe(true);
    });
  });
  
  describe('edge cases', () => {
    it('should handle empty element list', async () => {
      global.document.querySelectorAll = vi.fn(() => []);
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      
      manager.hide();
      expect(manager.hiddenElements).toHaveLength(0);
      
      // Reveal should still mark as revealed even with empty list
      manager.reveal();
      
      // Wait for async execution
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      });
    });
    
    it('should handle elements without style properties', () => {
      const minimalElement = { style: {} };
      global.document.querySelectorAll = vi.fn(() => [minimalElement]);
      
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      
      expect(() => {
        manager.hide();
        manager.reveal();
      }).not.toThrow();
    });
    
    it('should be safe to call reveal multiple times', async () => {
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      manager.hide();
      
      manager.reveal();
      
      // Wait for first reveal
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      }, { timeout: 1000 });
      
      // Second call should not throw or cause issues
      expect(() => manager.reveal()).not.toThrow();
    });
    
    it('should handle selector that matches no elements', async () => {
      global.document.querySelectorAll = vi.fn(() => []);
      manager = new FOUCManager({ strategy: 'opacity', selector: '.non-existent' }, 'test-style');
      
      manager.hide();
      expect(manager.hiddenElements).toHaveLength(0);
      
      manager.reveal();
      
      // Wait for async execution
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      });
    });
    
    it('should preserve original empty string values', async () => {
      vi.useRealTimers(); // Use real timers for this test
      
      const el = {
        style: {
          opacity: '',
          visibility: '',
          transition: '',
        },
        offsetHeight: 100,
      };
      global.document.querySelectorAll = vi.fn(() => [el]);
      
      manager = new FOUCManager({ strategy: 'opacity', duration: 10 }, 'test-style'); // Short duration
      manager.hide();
      
      // After hide, opacity should be '0'
      expect(el.style.opacity).toBe('0');
      
      manager.reveal();
      
      // Wait for async execution and timeout
      await vi.waitFor(() => {
        expect(manager.revealed).toBe(true);
      }, { timeout: 1000 });
      
      // Wait for transition cleanup
      await new Promise(resolve => setTimeout(resolve, 15));
      
      // Should restore to empty string, not undefined
      expect(el.style.opacity).toBe('');
      expect(el.style.transition).toBe('');
      
      vi.useFakeTimers(); // Restore fake timers for other tests
    });
  });
  
  describe('selector targeting', () => {
    it('should default to html selector', () => {
      manager = new FOUCManager({ strategy: 'opacity' }, 'test-style');
      
      manager.hide();
      
      expect(global.document.querySelectorAll).toHaveBeenCalledWith('html');
    });
    
    it('should use custom selector when provided', () => {
      manager = new FOUCManager({ strategy: 'opacity', selector: '#app' }, 'test-style');
      
      manager.hide();
      
      expect(global.document.querySelectorAll).toHaveBeenCalledWith('#app');
    });
    
    it('should support complex selectors', () => {
      manager = new FOUCManager({ 
        strategy: 'visibility', 
        selector: 'main, .container, [data-page]' 
      }, 'test-style');
      
      manager.hide();
      
      expect(global.document.querySelectorAll).toHaveBeenCalledWith('main, .container, [data-page]');
    });
  });
});
