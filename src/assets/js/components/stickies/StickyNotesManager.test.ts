import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StickyNotesManager } from './StickyNotesManager';

describe('StickyNotesManager', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Set up DOM structure
    document.body.innerHTML = `
      <div id="sticky-notes-container">
        <div class="notes-wrapper desktop-canvas">
          <div class="sticky-note" data-note-id="1">
            <h4>Frontend</h4>
            <ul>
              <li>React</li>
              <li>TypeScript</li>
            </ul>
          </div>
          <div class="sticky-note" data-note-id="2">
            <h4>Backend</h4>
            <ul>
              <li>Node.js</li>
              <li>Python</li>
            </ul>
          </div>
          <div class="sticky-note" data-note-id="3">
            <h4>DevOps</h4>
            <ul>
              <li>Docker</li>
              <li>AWS</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    container = document.getElementById('sticky-notes-container')!;
    
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
      const manager = new StickyNotesManager();
      expect(manager).toBeInstanceOf(StickyNotesManager);
    });

    it('should find the container element', () => {
      new StickyNotesManager();
      expect(container).toBeTruthy();
    });

    it('should assign random colors to notes', () => {
      new StickyNotesManager();
      const notes = document.querySelectorAll('.sticky-note');
      
      notes.forEach(note => {
        const hasColor = note.classList.contains('sticky-yellow') ||
                        note.classList.contains('sticky-pink') ||
                        note.classList.contains('sticky-teal');
        expect(hasColor).toBe(true);
      });
    });

    it('should position notes randomly on desktop', () => {
      new StickyNotesManager();
      const notes = document.querySelectorAll('.sticky-note') as NodeListOf<HTMLElement>;
      
      notes.forEach(note => {
        expect(note.style.left).toBeTruthy();
        expect(note.style.top).toBeTruthy();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should use desktop layout for wide screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      new StickyNotesManager();
      const wrapper = document.querySelector('.notes-wrapper');
      
      expect(wrapper?.classList.contains('desktop-canvas')).toBe(true);
      expect(wrapper?.classList.contains('mobile-list')).toBe(false);
    });

    it('should use mobile layout for narrow screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      new StickyNotesManager();
      const wrapper = document.querySelector('.notes-wrapper');
      
      expect(wrapper?.classList.contains('mobile-list')).toBe(true);
      expect(wrapper?.classList.contains('desktop-canvas')).toBe(false);
    });
  });

  describe('Drag and Drop', () => {
    it('should add dragging class on mousedown', () => {
      new StickyNotesManager();
      const note = document.querySelector('.sticky-note') as HTMLElement;
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      });
      
      note.dispatchEvent(mouseDownEvent);
      expect(note.classList.contains('dragging')).toBe(true);
    });

    it('should remove dragging class on mouseup', () => {
      new StickyNotesManager();
      const note = document.querySelector('.sticky-note') as HTMLElement;
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      });
      note.dispatchEvent(mouseDownEvent);
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      document.dispatchEvent(mouseUpEvent);
      
      expect(note.classList.contains('dragging')).toBe(false);
    });

    it('should update note position on mousemove', () => {
      new StickyNotesManager();
      const note = document.querySelector('.sticky-note') as HTMLElement;
      
      const initialLeft = note.style.left;
      const initialTop = note.style.top;
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100
      });
      note.dispatchEvent(mouseDownEvent);
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 150,
        clientY: 150
      });
      document.dispatchEvent(mouseMoveEvent);
      
      // Position should have changed
      expect(note.style.left !== initialLeft || note.style.top !== initialTop).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing container gracefully', () => {
      document.body.innerHTML = '<div></div>';
      
      const consoleSpy = vi.spyOn(console, 'warn');
      new StickyNotesManager({ selectors: {
        container: 'non-existent-id',
        wrapper: '',
        note: ''
      } });
      
      expect(consoleSpy).toHaveBeenCalledWith('Sticky notes container not found');
    });

    it('should handle empty notes list', () => {
      document.body.innerHTML = `
        <div id="sticky-notes-container">
          <div class="notes-wrapper desktop-canvas"></div>
        </div>
      `;
      
      const manager = new StickyNotesManager();
      expect(manager).toBeInstanceOf(StickyNotesManager);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const manager = new StickyNotesManager();
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      manager.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});