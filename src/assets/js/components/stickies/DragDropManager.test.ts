import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DragDropManager } from './DragDropManager';

describe('DragDropManager', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Set up DOM structure
    document.body.innerHTML = `
      <div id="draggable-container">
        <div class="items-wrapper desktop-canvas">
          <div class="draggable-item" data-x="100" data-y="50">
            <h4>Frontend</h4>
            <ul>
              <li>React</li>
              <li>TypeScript</li>
            </ul>
          </div>
          <div class="draggable-item" data-x="300" data-y="150">
            <h4>Backend</h4>
            <ul>
              <li>Node.js</li>
              <li>Python</li>
            </ul>
          </div>
          <div class="draggable-item" data-x="500" data-y="250">
            <h4>DevOps</h4>
            <ul>
              <li>Docker</li>
              <li>AWS</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    container = document.getElementById('draggable-container')!;
    
    // Mock window.innerWidth for desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create an instance successfully', () => {
      const manager = new DragDropManager();
      expect(manager).toBeInstanceOf(DragDropManager);
    });

    it('should find the container element', () => {
      new DragDropManager();
      expect(container).toBeTruthy();
    });

    it('should create accessibility announcer', () => {
      new DragDropManager();
      const announcer = document.querySelector('[role="status"][aria-live="polite"]');
      expect(announcer).toBeTruthy();
      expect(announcer?.classList.contains('sr-only')).toBe(true);
    });

    it('should create drag instructions element', () => {
      new DragDropManager();
      const instructions = document.getElementById('drag-instructions');
      expect(instructions).toBeTruthy();
      expect(instructions?.classList.contains('sr-only')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should add ARIA attributes to draggable items', () => {
      new DragDropManager();
      const items = document.querySelectorAll('.draggable-item');
      
      items.forEach((item, index) => {
        expect(item.getAttribute('tabindex')).toBe('0');
        expect(item.getAttribute('role')).toBe('button');
        expect(item.getAttribute('aria-label')).toBe(`Draggable item ${index + 1}`);
        expect(item.getAttribute('aria-describedby')).toBe('drag-instructions');
      });
    });

    it('should make items keyboard focusable', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      expect(item.tabIndex).toBe(0);
    });

    it('should remove accessibility attributes on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      new DragDropManager();
      const items = document.querySelectorAll('.draggable-item');
      
      items.forEach(item => {
        expect(item.getAttribute('tabindex')).toBeNull();
        expect(item.getAttribute('role')).toBeNull();
        expect(item.getAttribute('aria-label')).toBeNull();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should start keyboard drag on Enter key', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      });
      item.dispatchEvent(enterEvent);
      
      expect(item.classList.contains('keyboard-dragging')).toBe(true);
      expect(item.getAttribute('aria-grabbed')).toBe('true');
    });

    it('should start keyboard drag on Space key', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true
      });
      item.dispatchEvent(spaceEvent);
      
      expect(item.classList.contains('keyboard-dragging')).toBe(true);
      expect(item.getAttribute('aria-grabbed')).toBe('true');
    });

    it('should move item left with ArrowLeft key', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      const initialLeft = parseFloat(item.style.left) || 0;
      
      // Move left
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      
      const newLeft = parseFloat(item.style.left) || 0;
      expect(newLeft).toBeLessThan(initialLeft);
    });

    it('should move item right with ArrowRight key', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      const initialLeft = parseFloat(item.style.left) || 0;
      
      // Move right
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      
      const newLeft = parseFloat(item.style.left) || 0;
      expect(newLeft).toBeGreaterThan(initialLeft);
    });

    it('should move item up with ArrowUp key', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      const initialTop = parseFloat(item.style.top) || 0;
      
      // Move up
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      
      const newTop = parseFloat(item.style.top) || 0;
      expect(newTop).toBeLessThan(initialTop);
    });

    it('should move item down with ArrowDown key', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      const initialTop = parseFloat(item.style.top) || 0;
      
      // Move down
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      
      const newTop = parseFloat(item.style.top) || 0;
      expect(newTop).toBeGreaterThan(initialTop);
    });

    it('should move faster with Shift + arrow keys', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      const initialLeft = parseFloat(item.style.left) || 0;
      
      // Move right with Shift (fast move)
      item.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'ArrowRight', 
        shiftKey: true, 
        bubbles: true 
      }));
      
      const newLeft = parseFloat(item.style.left) || 0;
      const distance = newLeft - initialLeft;
      
      // Fast move should be larger than 10px (default step)
      expect(distance).toBeGreaterThan(10);
    });

    it('should end keyboard drag on Enter when dragging', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(item.classList.contains('keyboard-dragging')).toBe(true);
      
      // End dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(item.classList.contains('keyboard-dragging')).toBe(false);
      expect(item.getAttribute('aria-grabbed')).toBe('false');
    });

    it('should end keyboard drag on Escape key', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(item.classList.contains('keyboard-dragging')).toBe(true);
      
      // Cancel with Escape
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(item.classList.contains('keyboard-dragging')).toBe(false);
      expect(item.getAttribute('aria-grabbed')).toBe('false');
    });

    it('should update data attributes during keyboard movement', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      // Start dragging
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      // Move right
      item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      
      const dataX = item.getAttribute('data-x');
      const styleLeft = Math.round(parseFloat(item.style.left));
      
      expect(dataX).toBe(styleLeft.toString());
    });
  });

  describe('Responsive Layout', () => {
    it('should use desktop layout for wide screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      new DragDropManager();
      const wrapper = document.querySelector('.items-wrapper');
      
      expect(wrapper?.classList.contains('desktop-canvas')).toBe(true);
      expect(wrapper?.classList.contains('mobile-list')).toBe(false);
    });

    it('should use mobile layout for narrow screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      new DragDropManager();
      const wrapper = document.querySelector('.items-wrapper');
      
      expect(wrapper?.classList.contains('mobile-list')).toBe(true);
      expect(wrapper?.classList.contains('desktop-canvas')).toBe(false);
    });

    it('should switch layouts on resize', () => {
      const manager = new DragDropManager();
      const wrapper = document.querySelector('.items-wrapper');
      
      expect(wrapper?.classList.contains('desktop-canvas')).toBe(true);
      
      // Change to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      window.dispatchEvent(new Event('resize'));
      
      expect(wrapper?.classList.contains('mobile-list')).toBe(true);
      expect(wrapper?.classList.contains('desktop-canvas')).toBe(false);
    });
  });

  describe('Mouse Drag and Drop', () => {
    it('should add dragging class on mousedown', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      });
      
      item.dispatchEvent(mouseDownEvent);
      expect(item.classList.contains('dragging')).toBe(true);
      expect(item.getAttribute('aria-grabbed')).toBe('true');
    });

    it('should remove dragging class on mouseup', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      });
      item.dispatchEvent(mouseDownEvent);
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      document.dispatchEvent(mouseUpEvent);
      
      expect(item.classList.contains('dragging')).toBe(false);
      expect(item.getAttribute('aria-grabbed')).toBe('false');
    });

    it('should update item position on mousemove', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      const initialLeft = item.style.left;
      const initialTop = item.style.top;
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      });
      item.dispatchEvent(mouseDownEvent);
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 150,
        clientY: 150
      });
      document.dispatchEvent(mouseMoveEvent);
      
      // Position should have changed
      expect(item.style.left !== initialLeft || item.style.top !== initialTop).toBe(true);
    });

    it('should not start drag from clickable elements', () => {
      document.body.innerHTML = `
        <div id="draggable-container">
          <div class="items-wrapper desktop-canvas">
            <div class="draggable-item">
              <button id="test-button">Click me</button>
            </div>
          </div>
        </div>
      `;
      
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      const button = document.getElementById('test-button') as HTMLElement;
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      });
      
      Object.defineProperty(mouseDownEvent, 'target', {
        value: button,
        enumerable: true
      });
      
      item.dispatchEvent(mouseDownEvent);
      expect(item.classList.contains('dragging')).toBe(false);
    });
  });

  describe('Touch Support', () => {
    it('should add dragging class on touchstart', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      const touchStartEvent = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      
      item.dispatchEvent(touchStartEvent);
      expect(item.classList.contains('dragging')).toBe(true);
    });

    it('should update position on touchmove', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      const touchStartEvent = new TouchEvent('touchstart', {
        bubbles: true,
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      item.dispatchEvent(touchStartEvent);
      
      const initialLeft = item.style.left;
      
      const touchMoveEvent = new TouchEvent('touchmove', {
        bubbles: true,
        touches: [{ clientX: 150, clientY: 150 } as Touch]
      });
      document.dispatchEvent(touchMoveEvent);
      
      expect(item.style.left !== initialLeft).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing container gracefully', () => {
      document.body.innerHTML = '<div></div>';
      
      const consoleSpy = vi.spyOn(console, 'warn');
      new DragDropManager({ 
        selectors: {
          container: '#non-existent-id',
          wrapper: '',
          item: ''
        } 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('No elements found to move around');
    });

    it('should handle empty items list', () => {
      document.body.innerHTML = `
        <div id="draggable-container">
          <div class="items-wrapper desktop-canvas"></div>
        </div>
      `;
      
      const manager = new DragDropManager();
      expect(manager).toBeInstanceOf(DragDropManager);
    });

    it('should position items with data attributes', () => {
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      expect(item.style.left).toBe('100px');
      expect(item.style.top).toBe('50px');
    });

    it('should not position items without data attributes', () => {
      document.body.innerHTML = `
        <div id="draggable-container">
          <div class="items-wrapper desktop-canvas">
            <div class="draggable-item"></div>
          </div>
        </div>
      `;
      
      new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      
      expect(item.style.left).toBe('');
      expect(item.style.top).toBe('');
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const manager = new DragDropManager();
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      manager.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('should remove announcer element on destroy', () => {
      const manager = new DragDropManager();
      
      const announcer = document.querySelector('[role="status"][aria-live="polite"]');
      expect(announcer).toBeTruthy();
      
      manager.destroy();
      
      const announcerAfter = document.querySelector('[role="status"][aria-live="polite"]');
      expect(announcerAfter).toBeNull();
    });

    it('should remove instructions element on destroy', () => {
      const manager = new DragDropManager();
      
      const instructions = document.getElementById('drag-instructions');
      expect(instructions).toBeTruthy();
      
      manager.destroy();
      
      const instructionsAfter = document.getElementById('drag-instructions');
      expect(instructionsAfter).toBeNull();
    });

    it('should remove keyboard event listeners from items on destroy', () => {
      const manager = new DragDropManager();
      const item = document.querySelector('.draggable-item') as HTMLElement;
      const removeEventListenerSpy = vi.spyOn(item, 'removeEventListener');
      
      manager.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});