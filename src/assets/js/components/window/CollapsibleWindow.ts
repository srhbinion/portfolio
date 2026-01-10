/**
 * CollapsibleWindow Component
 * Manages collapsible window UI with proper state management and accessibility
 */

interface WindowElements {
  container: HTMLElement;
  body: HTMLElement;
  collapseButton: HTMLElement;
  closeButton: HTMLElement;
}

interface WindowState {
  isCollapsed: boolean;
  isExpanded: boolean;
}

class CollapsibleWindow {
  private readonly elements: WindowElements;
  private state: WindowState;
  private readonly boundHandlers: Map<string, EventListener>;

  constructor() {
    this.state = this.initializeState();
    this.elements = this.queryElements();
    this.boundHandlers = new Map();
    
    this.validateElements();
    this.setupAccessibility();
    this.attachEventListeners();
  }

  /**
   * Initialize component state
   */
  private initializeState = (): WindowState => {
    return {
      isCollapsed: false,
      isExpanded: false
    };
  };

  /**
   * Query and cache DOM elements
   */
  private queryElements = (): WindowElements => {
    const container = document.querySelector('.window') as HTMLElement;
    const body = document.querySelector('.window-body') as HTMLElement;
    const collapseButton = document.querySelector('.window-button.window__button--collapse') as HTMLElement;
    const closeButton = document.querySelector('.window-button.window__button--expanded') as HTMLElement;

    return { container, body, collapseButton, closeButton };
  };

  /**
   * Validate that all required elements exist
   */
  private validateElements = (): void => {
    const { container, body, collapseButton, closeButton } = this.elements;

    if (!container) {
      throw new Error('CollapsibleWindow: .window container not found');
    }
    if (!body) {
      throw new Error('CollapsibleWindow: .window-body not found');
    }
    if (!collapseButton) {
      throw new Error('CollapsibleWindow: collapse button not found');
    }
    if (!closeButton) {
      throw new Error('CollapsibleWindow: close button not found');
    }
  };

  /**
   * Setup accessibility attributes
   */
  private setupAccessibility = (): void => {
    const { collapseButton, closeButton, body, container } = this.elements;

    // Make container focusable for accessibility
    if (!container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
    }

    // Set ARIA attributes for collapse button
    collapseButton.setAttribute('aria-expanded', 'true');
    collapseButton.setAttribute('aria-controls', body.id || 'window-body');
    
    // Ensure body has an ID for aria-controls
    if (!body.id) {
      body.id = 'window-body';
    }

    // Set ARIA label for close button
    closeButton.setAttribute('aria-label', 'Expand window');
    
    // Add keyboard support indicators
    collapseButton.setAttribute('title', 'Collapse window (Space or Enter)');
    closeButton.setAttribute('title', 'Expand window (Space or Enter)');
  };

  /**
   * Attach event listeners with bound handlers
   */
  private attachEventListeners = (): void => {
    this.boundHandlers.set('collapse', this.handleCollapse);
    this.boundHandlers.set('close', this.handleClose);

    this.elements.collapseButton.addEventListener('click', this.handleCollapse);
    this.elements.closeButton.addEventListener('click', this.handleClose);
  };

  /**
   * Handle collapse button click
   */
  private handleCollapse = (event: Event): void => {
    event.preventDefault();
    this.toggleCollapse();
  };

  /**
   * Handle close button click
   */
  private handleClose = (event: Event): void => {
    event.preventDefault();
    this.expandWindow();
  };

  /**
   * Toggle window collapse state
   */
  private toggleCollapse = (): void => {
    this.state.isCollapsed = !this.state.isCollapsed;
    this.updateCollapseUI();
  };

  /**
   * Update UI for collapse state
   */
  private updateCollapseUI = (): void => {
    const { body, collapseButton } = this.elements;

    if (this.state.isCollapsed) {
      body.classList.add('window--collapse');
      collapseButton.setAttribute('aria-expanded', 'false');
      collapseButton.setAttribute('title', 'Expand window (Space or Enter)');
    } else {
      body.classList.remove('window--collapse');
      collapseButton.setAttribute('aria-expanded', 'true');
      collapseButton.setAttribute('title', 'Collapse window (Space or Enter)');
    }
  };

  /**
   * Expand the window
   */
  private expandWindow = (): void => {
    this.state.isExpanded = !this.state.isExpanded;
    this.updateExpandUI();
    this.focusWindow();
    this.announceToScreenReader(
      this.state.isExpanded ? 'Window expanded' : 'Window collapsed'
    );
  };

  /**
   * Update UI for expand state
   */
  private updateExpandUI = (): void => {
    const { container } = this.elements;
    
    if (this.state.isExpanded) {
      container.classList.add('window--expanded');
      container.setAttribute('aria-hidden', 'false');
    } else {
      container.classList.remove('window--expanded');
      container.setAttribute('aria-hidden', 'false');
    }
  };

  /**
   * Focus the window container for accessibility
   */
  private focusWindow = (): void => {
    const { container } = this.elements;
    container.focus();
  };

  /**
   * Announce message to screen readers
   */
  private announceToScreenReader = (message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  /**
   * Clean up event listeners and resources
   */
  public destroy = (): void => {
    const collapseHandler = this.boundHandlers.get('collapse');
    const closeHandler = this.boundHandlers.get('close');

    if (collapseHandler) {
      this.elements.collapseButton.removeEventListener('click', collapseHandler);
    }
    if (closeHandler) {
      this.elements.closeButton.removeEventListener('click', closeHandler);
    }

    this.boundHandlers.clear();
  };

  /**
   * Public API: Get current state
   */
  public getState = (): Readonly<WindowState> => {
    return { ...this.state };
  };

  /**
   * Public API: Programmatically collapse/expand
   */
  public setCollapsed = (collapsed: boolean): void => {
    if (this.state.isCollapsed !== collapsed) {
      this.toggleCollapse();
    }
  };

  /**
   * Public API: Programmatically expand window
   */
  public expand = (): void => {
    if (!this.state.isExpanded) {
      this.expandWindow();
    }
  };
}

// Export the class for use as a module
export { CollapsibleWindow };