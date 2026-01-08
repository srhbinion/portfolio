/* =========================
   Types
========================= */

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  currentItem: HTMLElement | null;
  offset: Position;
}

interface KeyboardDragState {
  isKeyboardDragging: boolean;
  currentItem: HTMLElement | null;
}

interface DragContainerConfig {
  selectors: {
    container: string;
    wrapper: string;
    item: string;
  };
  classes: {
    desktop: string;
    mobile: string;
    dragging: string;
    keyboardDragging: string;
  };
  layout: {
    desktopBreakpoint: number;
  };
  keyboard: {
    moveStep: number;
    fastMoveStep: number;
  };
}

/* =========================
   Default Config
========================= */

const DRAG_CONTAINER: DragContainerConfig = {
  selectors: {
    container: '#draggable-container',
    wrapper: '.items-wrapper',
    item: '.draggable-item',
  },
  classes: {
    desktop: 'desktop-canvas',
    mobile: 'mobile-list',
    dragging: 'dragging',
    keyboardDragging: 'keyboard-dragging',
  },
  layout: {
    desktopBreakpoint: 768,
  },
  keyboard: {
    moveStep: 10,
    fastMoveStep: 50,
  }
};

/* =========================
   Drag Drop Manager
========================= */

export class DragDropManager {
  private config: DragContainerConfig;

  private container: HTMLElement | null = null;
  private wrapper: HTMLElement | null = null;
  private items: HTMLElement[] = [];
  private isDesktop = false;
  private dragState: DragState = {
    isDragging: false,
    currentItem: null,
    offset: { x: 0, y: 0 },
  };
  private keyboardDragState: KeyboardDragState = {
    isKeyboardDragging: false,
    currentItem: null,
  };
  private isInitialized = false;
  private announcer: HTMLElement | null = null;

  constructor(config: Partial<DragContainerConfig> = {}) {
    this.config = {
      ...DRAG_CONTAINER,
      ...config,
      selectors: { ...DRAG_CONTAINER.selectors, ...config.selectors },
      classes: { ...DRAG_CONTAINER.classes, ...config.classes },
      layout: { ...DRAG_CONTAINER.layout, ...config.layout },
      keyboard: { ...DRAG_CONTAINER.keyboard, ...config.keyboard },
    };

    this.cacheDom();
    if (!this.container || !this.wrapper) {
      console.warn('No elements found to move around');
      return;
    }

    this.bindHandlers();
    this.init();
    this.isInitialized = true;
  }

  /* =========================
     Setup
  ========================= */

  private cacheDom(): void {
    this.container = document.querySelector(this.config.selectors.container);
    this.wrapper = this.container?.querySelector(
      this.config.selectors.wrapper
    ) ?? null;
    this.items = Array.from(
      this.container?.querySelectorAll(this.config.selectors.item) ?? []
    );
  }

  private bindHandlers(): void {
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  private init(): void {
    this.createAnnouncer();
    this.updateViewportMode();
    this.applyLayout();
    if (this.isDesktop) {
      this.positionItems();
      this.bindDragEvents();
      this.makeItemsAccessible();
    }

    window.addEventListener('resize', this.handleResize);
  }

  /* =========================
     Accessibility Setup
  ========================= */

  private createAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('role', 'status');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announcer);
  }

  private announce(message: string): void {
    if (!this.announcer) return;
    this.announcer.textContent = '';
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = message;
      }
    }, 100);
  }

  private makeItemsAccessible(): void {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Draggable item ${index + 1}`);
      item.setAttribute(
        'aria-describedby',
        this.getOrCreateInstructions().id
      );
      
      item.addEventListener('keydown', this.handleKeyDown);
    });
  }

  private getOrCreateInstructions(): HTMLElement {
    const existingInstructions = document.getElementById('drag-instructions');
    if (existingInstructions) return existingInstructions;

    const instructions = document.createElement('div');
    instructions.id = 'drag-instructions';
    instructions.className = 'sr-only';
    instructions.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    instructions.textContent = 
      'Press Enter or Space to start dragging. Use arrow keys to move. ' +
      'Hold Shift for larger movements. Press Enter, Space, or Escape to drop.';
    document.body.appendChild(instructions);
    return instructions;
  }

  /* =========================
     Layout
  ========================= */

  private updateViewportMode(): void {
    this.isDesktop =
      window.innerWidth > this.config.layout.desktopBreakpoint;
  }

  private applyLayout(): void {
    if (!this.wrapper) return;

    this.wrapper.classList.toggle(
      this.config.classes.desktop,
      this.isDesktop
    );
    this.wrapper.classList.toggle(
      this.config.classes.mobile,
      !this.isDesktop
    );
  }

  private positionItems(): void {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();

    this.items.forEach((item) => {
      const dataLeft = item.getAttribute('data-x');
      const dataTop = item.getAttribute('data-y');

      if (dataLeft !== null && dataTop !== null) {
        item.style.left = `${dataLeft}px`;
        item.style.top = `${dataTop}px`;
      } else {
        return;
      }
    });
  }

  /* =========================
     Keyboard Handling
  ========================= */

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isDesktop) return;

    const item = e.currentTarget as HTMLElement;
    const key = e.key;

    // Start/stop keyboard dragging with Enter or Space
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      if (this.keyboardDragState.isKeyboardDragging) {
        this.endKeyboardDrag();
      } else {
        this.startKeyboardDrag(item);
      }
      return;
    }

    // Cancel dragging with Escape
    if (key === 'Escape' && this.keyboardDragState.isKeyboardDragging) {
      e.preventDefault();
      this.endKeyboardDrag();
      return;
    }

    // Move item with arrow keys
    if (this.keyboardDragState.isKeyboardDragging && 
        this.keyboardDragState.currentItem === item) {
      
      const moveStep = e.shiftKey 
        ? this.config.keyboard.fastMoveStep 
        : this.config.keyboard.moveStep;

      switch (key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.moveItemKeyboard(-moveStep, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.moveItemKeyboard(moveStep, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.moveItemKeyboard(0, -moveStep);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.moveItemKeyboard(0, moveStep);
          break;
      }
    }
  }

  private startKeyboardDrag(item: HTMLElement): void {
    this.keyboardDragState = {
      isKeyboardDragging: true,
      currentItem: item,
    };

    item.classList.add(this.config.classes.keyboardDragging);
    item.setAttribute('aria-grabbed', 'true');
    
    const index = this.items.indexOf(item) + 1;
    this.announce(
      `Item ${index} grabbed. Use arrow keys to move, Shift + arrow keys for larger movements. Press Enter, Space, or Escape to drop.`
    );
  }

  private moveItemKeyboard(deltaX: number, deltaY: number): void {
    if (!this.keyboardDragState.currentItem || !this.container) return;

    const item = this.keyboardDragState.currentItem;
    const containerRect = this.container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const currentLeft = parseFloat(item.style.left) || 0;
    const currentTop = parseFloat(item.style.top) || 0;

    let newLeft = currentLeft + deltaX;
    let newTop = currentTop + deltaY;

    newLeft = Math.max(0, Math.min(newLeft, containerRect.width - itemRect.width));
    newTop = Math.max(0, Math.min(newTop, containerRect.height - itemRect.height));

    item.style.left = `${newLeft}px`;
    item.style.top = `${newTop}px`;

    // Update data attributes
    item.setAttribute('data-x', Math.round(newLeft).toString());
    item.setAttribute('data-y', Math.round(newTop).toString());
  }

  private endKeyboardDrag(): void {
    if (!this.keyboardDragState.currentItem) return;

    const item = this.keyboardDragState.currentItem;
    item.classList.remove(this.config.classes.keyboardDragging);
    item.setAttribute('aria-grabbed', 'false');
    
    const index = this.items.indexOf(item) + 1;
    const left = Math.round(parseFloat(item.style.left) || 0);
    const top = Math.round(parseFloat(item.style.top) || 0);
    
    this.announce(`Item ${index} dropped at position ${left}, ${top}.`);

    this.keyboardDragState = {
      isKeyboardDragging: false,
      currentItem: null,
    };
  }

  /* =========================
     Drag Handling
  ========================= */

  private bindDragEvents(): void {
    this.items.forEach((item) => {
      item.addEventListener('mousedown', this.handleMouseDown);
      item.addEventListener('touchstart', this.handleTouchStart, {
        passive: false,
      });
    });

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchmove', this.handleTouchMove, {
      passive: false,
    });
    document.addEventListener('touchend', this.handleTouchEnd);
  }

  private isClickableElement(el: HTMLElement): boolean {
    const clickableTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];
    return clickableTags.includes(el.tagName) || 
           el.closest('a, button, input, textarea, select') !== null;
  }

  private handleMouseDown(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (this.isClickableElement(target)) return;

    this.startDrag(e.currentTarget as HTMLElement, e.clientX, e.clientY);
    e.preventDefault();
  }

  private handleTouchStart(e: TouchEvent): void {
    const target = e.target as HTMLElement;
    if (this.isClickableElement(target)) return;
  
    const t = e.touches[0];
    this.startDrag(e.currentTarget as HTMLElement, t.clientX, t.clientY);
    e.preventDefault();
  }

  private startDrag(item: HTMLElement, x: number, y: number): void {
    if (!this.isDesktop) return;

    const rect = item.getBoundingClientRect();
    this.dragState = {
      isDragging: true,
      currentItem: item,
      offset: { x: x - rect.left, y: y - rect.top },
    };

    item.classList.add(this.config.classes.dragging);
    item.setAttribute('aria-grabbed', 'true');
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.dragState.isDragging) return;
    this.moveItem(e.clientX, e.clientY);
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.dragState.isDragging) return;
    const t = e.touches[0];
    this.moveItem(t.clientX, t.clientY);
    e.preventDefault();
  }

  private moveItem(x: number, y: number): void {
    if (!this.dragState.currentItem || !this.container) return;

    const containerRect = this.container.getBoundingClientRect();
    const itemRect = this.dragState.currentItem.getBoundingClientRect();

    let left = x - this.dragState.offset.x - containerRect.left;
    let top = y - this.dragState.offset.y - containerRect.top;

    left = Math.max(0, Math.min(left, containerRect.width - itemRect.width));
    top = Math.max(0, Math.min(top, containerRect.height - itemRect.height));

    this.dragState.currentItem.style.left = `${left}px`;
    this.dragState.currentItem.style.top = `${top}px`;
    
    // Update data attributes
    this.dragState.currentItem.setAttribute('data-x', Math.round(left).toString());
    this.dragState.currentItem.setAttribute('data-y', Math.round(top).toString());
  }

  private handleMouseUp(): void {
    this.endDrag();
  }

  private handleTouchEnd(): void {
    this.endDrag();
  }

  private endDrag(): void {
    if (this.dragState.currentItem) {
      this.dragState.currentItem.classList.remove(
        this.config.classes.dragging
      );
      this.dragState.currentItem.setAttribute('aria-grabbed', 'false');
    }

    this.dragState = {
      isDragging: false,
      currentItem: null,
      offset: { x: 0, y: 0 },
    };
  }

  /* =========================
     Resize
  ========================= */

  private handleResize(): void {
    const wasDesktop = this.isDesktop;
    this.updateViewportMode();

    if (wasDesktop !== this.isDesktop) {
      this.applyLayout();

      if (this.isDesktop) {
        this.positionItems();
        this.bindDragEvents();
        this.makeItemsAccessible();
      } else {
        this.items.forEach((item) => {
          item.style.left = '';
          item.style.top = '';
          item.removeAttribute('tabindex');
          item.removeAttribute('role');
          item.removeAttribute('aria-label');
          item.removeAttribute('aria-describedby');
          item.removeAttribute('aria-grabbed');
        });
      }
    }
  }

  /* =========================
     Teardown
  ========================= */

  public destroy(): void {
    if (!this.isInitialized) return;

    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);

    this.items.forEach((item) => {
      item.removeEventListener('keydown', this.handleKeyDown);
    });

    if (this.announcer) {
      this.announcer.remove();
    }

    const instructions = document.getElementById('drag-instructions');
    if (instructions) {
      instructions.remove();
    }
  }
}