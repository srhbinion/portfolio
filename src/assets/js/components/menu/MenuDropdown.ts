interface NavMenuConfig {
  selectors: {
    toggle: string;
    menu: string;
    navItem: string;
    dropdownItem: string;
    stickyNote: string;
    window: string;
  };
  ariaAttrs: {
    expanded: string;
    haspopup: string;
  };
  classes: {
    active: string;
    open: string;
  };
  keys: {
    escape: string;
  };
}

const NAVMENU: NavMenuConfig = {
  selectors: {
    toggle: '.dropdown-toggle',
    menu: '.dropdown-menu',
    navItem: '.nav-item',
    dropdownItem: '.dropdown-item',
    stickyNote: '.sticky-note',
    window: '.window',
  },
  ariaAttrs: {
    expanded: 'aria-expanded',
    haspopup: 'aria-haspopup',
  },
  classes: {
    active: 'active',
    open: 'open',
  },
  keys: {
    escape: 'Escape',
  },
};

class MenuDropdown {
  private config: NavMenuConfig;
  private container: HTMLElement | null;
  private toggle: HTMLElement | null;
  private menu: HTMLElement | null;
  private isOpen: boolean;
  private isInitialized: boolean;
  private stickiesState: boolean;
  private windowsState: boolean;

  constructor(config: Partial<NavMenuConfig> = {}) {
    this.config = { ...NAVMENU, ...config };
    this.container = document.querySelector<HTMLElement>(this.config.selectors.navItem);
    this.toggle = document.querySelector<HTMLElement>(this.config.selectors.toggle);
    this.menu = document.querySelector<HTMLElement>(this.config.selectors.menu);
    this.isOpen = false;
    // Default states: both ON (true means visible/open)
    this.stickiesState = true;
    this.windowsState = true;

    if (!this.toggle || !this.menu || !this.container) {
      console.warn('Dropdown elements not found');
      this.isInitialized = false;
      return;
    }

    this.isInitialized = true;
    this.handleContainerClick = this.handleContainerClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
    this.init();
  }

  private init(): void {
    this.bindEvents();
  }

  private bindEvents(): void {
    this.container?.addEventListener('click', this.handleContainerClick);
    this.menu?.addEventListener('click', this.handleMenuItemClick);
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('click', this.handleOutsideClick);
  }

  private handleContainerClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const isToggle = target.closest(this.config.selectors.toggle);
    if (isToggle) {
      e.stopPropagation();
      this.isOpen ? this.close() : this.open();
    }
  }

  private handleMenuItemClick(e: MouseEvent): void {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const menuItem = target.closest(this.config.selectors.dropdownItem) as HTMLElement;
    
    if (!menuItem) return;

    const itemText = menuItem.textContent?.trim().toLowerCase();

    switch (itemText) {
      case 'stickies':
        this.toggleStickies();
        break;
      case 'window':
        this.toggleWindows();
        break;
    }
  }

  private toggleStickies(): void {
    const stickies = document.querySelectorAll<HTMLElement>(this.config.selectors.stickyNote);
    this.stickiesState = !this.stickiesState;
    
    stickies.forEach(sticky => {
      if (this.stickiesState) {
        sticky.classList.add(this.config.classes.open);
        sticky.setAttribute('aria-hidden', 'false');
        sticky.removeAttribute('inert');
      } else {
        sticky.classList.remove(this.config.classes.open);
        sticky.setAttribute('aria-hidden', 'true');
        sticky.setAttribute('inert', '');
      }
    });

    this.updateMenuItemState('stickies', this.stickiesState);
    this.announceStateChange('Stickies', this.stickiesState);
  }

  private toggleWindows(): void {
    const windows = document.querySelectorAll<HTMLElement>(this.config.selectors.window);
    this.windowsState = !this.windowsState;
    
    windows.forEach(window => {
      if (this.windowsState) {
        window.classList.add(this.config.classes.open);
        window.setAttribute('aria-hidden', 'false');
        window.removeAttribute('inert');
      } else {
        window.classList.remove(this.config.classes.open);
        window.setAttribute('aria-hidden', 'true');
        window.setAttribute('inert', '');
      }
    });

    this.updateMenuItemState('window', this.windowsState);
    this.announceStateChange('Windows', this.windowsState);
  }

  private updateMenuItemState(itemText: string, isOpen: boolean): void {
    const menuItems = this.menu?.querySelectorAll<HTMLElement>(this.config.selectors.dropdownItem);
    menuItems?.forEach(item => {
      if (item.textContent?.trim().toLowerCase() === itemText) {
        item.setAttribute('aria-pressed', isOpen.toString());
      }
    });
  }

  private announceStateChange(itemName: string, isOpen: boolean): void {
    const announcement = `${itemName} ${isOpen ? 'opened' : 'closed'}`;
    const liveRegion = document.getElementById('menu-announcements');
    
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  }

  private handleOutsideClick(e: MouseEvent): void {
    const target = e.target as Node;
    const isClickInside = this.container?.contains(target);
    if (!isClickInside && this.isOpen) {
      this.close();
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === this.config.keys.escape && this.isOpen) {
      this.close();
    }
  }

  public open(): void {
    this.isOpen = true;
    this.updateState();
  }

  public close(): void {
    this.isOpen = false;
    this.updateState();
  }

  private updateState(): void {
    this.toggle?.setAttribute(
      this.config.ariaAttrs.expanded,
      this.isOpen.toString()
    );
    this.menu?.classList.toggle(this.config.classes.active, this.isOpen);
  }

  public destroy(): void {
    if (!this.isInitialized) return;
    
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.menu?.removeEventListener('click', this.handleMenuItemClick);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleOutsideClick);
  }
}

export { MenuDropdown, type NavMenuConfig };