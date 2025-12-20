const NAVMENU = {
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
  constructor(config = {}) {
    this.config = { ...NAVMENU, ...config };
    this.container = document.querySelector(this.config.selectors.navItem);
    this.toggle = document.querySelector(this.config.selectors.toggle);
    this.menu = document.querySelector(this.config.selectors.menu);
    this.isOpen = false;

    if (!this.toggle || !this.menu || !this.container) {
      console.warn('Dropdown elements not found');
      this.isInitialized = false;
      return;
    }

    this.isInitialized = true;
    this.handleContainerClick = this.handleContainerClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener('click', this.handleContainerClick);
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  handleContainerClick(e) {
    const isToggle = e.target.closest(this.config.selectors.toggle);
    if (isToggle) {
      e.stopPropagation();
      this.isOpen ? this.close() : this.open();
    }
  }

  handleOutsideClick(e) {
    const isClickInside = this.container.contains(e.target);
    if (!isClickInside && this.isOpen) {
      this.close();
    }
  }

  handleKeydown(e) {
    if (e.key === this.config.keys.escape && this.isOpen) {
      this.close();
    }
  }

  open() {
    this.isOpen = true;
    this.updateState();
  }

  close() {
    this.isOpen = false;
    this.updateState();
  }

  updateState() {
    this.toggle.setAttribute(
      this.config.ariaAttrs.expanded,
      this.isOpen.toString()
    );
    this.menu.classList.toggle(this.config.classes.active, this.isOpen);
  }

  destroy() {
    if (!this.isInitialized) return;
    
    this.container?.removeEventListener('click', this.handleContainerClick);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }
}

export { MenuDropdown };