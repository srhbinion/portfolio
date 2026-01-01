interface NavMenuConfig {
  selectors: {
    toggle: string;
    menu: string;
    navItem: string;
  };
  ariaAttrs: {
    expanded: string;
    haspopup: string;
  };
  classes: {
    active: string;
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
  },
  ariaAttrs: {
    expanded: 'aria-expanded',
    haspopup: 'aria-haspopup',
  },
  classes: {
    active: 'active',
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

  constructor(config: Partial<NavMenuConfig> = {}) {
    this.config = { ...NAVMENU, ...config };
    this.container = document.querySelector<HTMLElement>(this.config.selectors.navItem);
    this.toggle = document.querySelector<HTMLElement>(this.config.selectors.toggle);
    this.menu = document.querySelector<HTMLElement>(this.config.selectors.menu);
    this.isOpen = false;

    if (!this.toggle || !this.menu || !this.container) {
      console.warn('Dropdown elements not found');
      this.isInitialized = false;
      return;
    }

    this.isInitialized = true;
    this.handleContainerClick = this.handleContainerClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.init();
  }

  private init(): void {
    this.bindEvents();
  }

  private bindEvents(): void {
    this.container?.addEventListener('click', this.handleContainerClick);
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
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleOutsideClick);
  }
}

export { MenuDropdown, type NavMenuConfig };