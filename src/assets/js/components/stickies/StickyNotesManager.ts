/* =========================
   Types
========================= */

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  currentNote: HTMLElement | null;
  offset: Position;
}

interface StickyNotesConfig {
  selectors: {
    container: string;
    wrapper: string;
    note: string;
  };
  classes: {
    desktop: string;
    mobile: string;
    dragging: string;
    colorPrefix: string;
  };
  layout: {
    desktopBreakpoint: number;
    padding: number;
    noteWidth: number;
    noteHeight: number;
  };
  colors: string[];
}

/* =========================
   Default Config
========================= */

const STICKY_NOTES: StickyNotesConfig = {
  selectors: {
    container: '#sticky-notes-container',
    wrapper: '.notes-wrapper',
    note: '.sticky-note',
  },
  classes: {
    desktop: 'desktop-canvas',
    mobile: 'mobile-list',
    dragging: 'dragging',
    colorPrefix: 'sticky-',
  },
  layout: {
    desktopBreakpoint: 768,
    padding: 40,
    noteWidth: 220,
    noteHeight: 150,
  },
  colors: ['yellow', 'pink', 'teal'],
};

/* =========================
   Sticky Notes Manager
========================= */

export class StickyNotesManager {
  private config: StickyNotesConfig;

  private container: HTMLElement | null = null;
  private wrapper: HTMLElement | null = null;
  private notes: HTMLElement[] = [];

  private isDesktop = false;
  private dragState: DragState = {
    isDragging: false,
    currentNote: null,
    offset: { x: 0, y: 0 },
  };

  private isInitialized = false;

  constructor(config: Partial<StickyNotesConfig> = {}) {
    this.config = {
      ...STICKY_NOTES,
      ...config,
      selectors: { ...STICKY_NOTES.selectors, ...config.selectors },
      classes: { ...STICKY_NOTES.classes, ...config.classes },
      layout: { ...STICKY_NOTES.layout, ...config.layout },
    };

    this.cacheDom();
    if (!this.container || !this.wrapper) {
      console.warn('Sticky notes elements not found');
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
    this.notes = Array.from(
      this.container?.querySelectorAll(this.config.selectors.note) ?? []
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
  }

  private init(): void {
    this.updateViewportMode();
    this.applyLayout();
    this.assignColors();

    if (this.isDesktop) {
      this.positionNotes();
      this.bindDragEvents();
    }

    window.addEventListener('resize', this.handleResize);
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

  private assignColors(): void {
    this.notes.forEach((note) => {
      const color =
        this.config.colors[
          Math.floor(Math.random() * this.config.colors.length)
        ];
      note.classList.add(`${this.config.classes.colorPrefix}${color}`);
    });
  }

  private positionNotes(): void {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    const { padding, noteWidth, noteHeight } = this.config.layout;

    this.notes.forEach((note) => {
      const maxX = rect.width - noteWidth - padding;
      const maxY = rect.height - noteHeight - padding;

      note.style.left = `${Math.random() * maxX + padding}px`;
      note.style.top = `${Math.random() * maxY + padding}px`;
    });
  }

  /* =========================
     Drag Handling
  ========================= */

  private bindDragEvents(): void {
    this.notes.forEach((note) => {
      note.addEventListener('mousedown', this.handleMouseDown);
      note.addEventListener('touchstart', this.handleTouchStart, {
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

  private handleMouseDown(e: MouseEvent): void {
    this.startDrag(e.currentTarget as HTMLElement, e.clientX, e.clientY);
    e.preventDefault();
  }

  private handleTouchStart(e: TouchEvent): void {
    const t = e.touches[0];
    this.startDrag(e.currentTarget as HTMLElement, t.clientX, t.clientY);
    e.preventDefault();
  }

  private startDrag(note: HTMLElement, x: number, y: number): void {
    if (!this.isDesktop) return;

    const rect = note.getBoundingClientRect();
    this.dragState = {
      isDragging: true,
      currentNote: note,
      offset: { x: x - rect.left, y: y - rect.top },
    };

    note.classList.add(this.config.classes.dragging);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.dragState.isDragging) return;
    this.moveNote(e.clientX, e.clientY);
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.dragState.isDragging) return;
    const t = e.touches[0];
    this.moveNote(t.clientX, t.clientY);
    e.preventDefault();
  }

  private moveNote(x: number, y: number): void {
    if (!this.dragState.currentNote || !this.container) return;

    const containerRect = this.container.getBoundingClientRect();
    const noteRect = this.dragState.currentNote.getBoundingClientRect();

    let left = x - this.dragState.offset.x - containerRect.left;
    let top = y - this.dragState.offset.y - containerRect.top;

    left = Math.max(0, Math.min(left, containerRect.width - noteRect.width));
    top = Math.max(0, Math.min(top, containerRect.height - noteRect.height));

    this.dragState.currentNote.style.left = `${left}px`;
    this.dragState.currentNote.style.top = `${top}px`;
  }

  private handleMouseUp(): void {
    this.endDrag();
  }

  private handleTouchEnd(): void {
    this.endDrag();
  }

  private endDrag(): void {
    this.dragState.currentNote?.classList.remove(
      this.config.classes.dragging
    );

    this.dragState = {
      isDragging: false,
      currentNote: null,
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
        this.positionNotes();
        this.bindDragEvents();
      } else {
        this.notes.forEach((note) => {
          note.style.left = '';
          note.style.top = '';
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
  }
}
