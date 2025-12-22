import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { MenuDropdown } from './MenuDropdown.js';

console.log('MenuDropdown import:', MenuDropdown);

describe('MenuDropdown', () => {
  let container: HTMLElement;
  let menuDropdown: MenuDropdown;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <nav class="nav-item">
        <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
          File
        </button>
        <ul class="dropdown-menu">
          <li><button class="dropdown-item">Calculator</button></li>
          <li><button class="dropdown-item">Stickies</button></li>
          <li><button class="dropdown-item">Window</button></li>
        </ul>
      </nav>
    `;
    container = document.body;
    menuDropdown = new MenuDropdown();
  });

  afterEach(() => {
    menuDropdown?.destroy?.();
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize with dropdown closed', () => {
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should warn if elements not found', () => {
      document.body.innerHTML = '';
      const consoleSpy = vi.spyOn(console, 'warn');
      new MenuDropdown();
      expect(consoleSpy).toHaveBeenCalledWith('Dropdown elements not found');
      consoleSpy.mockRestore();
    });
  });

  describe('Dropdown Toggle', () => {
    it('should open dropdown when toggle is clicked', async () => {
      const user = userEvent.setup();
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      const menu = container.querySelector<HTMLElement>('.dropdown-menu');

      if (!toggle) throw new Error('Toggle not found');

      await user.click(toggle);

      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(menu?.classList.contains('active')).toBe(true);
    });

    it('should close dropdown when toggle is clicked again', async () => {
      const user = userEvent.setup();
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      const menu = container.querySelector<HTMLElement>('.dropdown-menu');

      if (!toggle) throw new Error('Toggle not found');

      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(menu?.classList.contains('active')).toBe(false);
    });
  });

  describe('Outside Click Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      const menu = container.querySelector<HTMLElement>('.dropdown-menu');

      if (!toggle) throw new Error('Toggle not found');

      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      await user.click(document.body);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      expect(menu?.classList.contains('active')).toBe(false);
    });

    it('should keep dropdown open when clicking inside menu', async () => {
      const user = userEvent.setup();
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      const menu = container.querySelector<HTMLElement>('.dropdown-menu');

      if (!toggle || !menu) throw new Error('Elements not found');

      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      await user.click(menu);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Keyboard Interactions', () => {
    it('should close dropdown when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');

      if (!toggle) throw new Error('Toggle not found');

      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      await user.keyboard('{Escape}');
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should not close dropdown on other keys', async () => {
      const user = userEvent.setup();
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      const menu = container.querySelector<HTMLElement>('.dropdown-menu');

      if (!toggle || !menu) throw new Error('Elements not found');

      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      // Focus away from the button before pressing Enter
      menu.focus();
      await user.keyboard('{Enter}');
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      expect(toggle?.hasAttribute('aria-haspopup')).toBe(true);
      expect(toggle?.hasAttribute('aria-expanded')).toBe(true);
    });

    it('should update aria-expanded on state change', async () => {
      const user = userEvent.setup();
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');

      if (!toggle) throw new Error('Toggle not found');

      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      await user.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on destroy', () => {
      const toggle = container.querySelector<HTMLButtonElement>('.dropdown-toggle');
      
      if (!toggle) throw new Error('Toggle not found');
      
      menuDropdown.destroy();

      // After destroy, click should not toggle dropdown
      const initialState = toggle.getAttribute('aria-expanded');
      toggle.click();
      expect(toggle.getAttribute('aria-expanded')).toBe(initialState);
    });
  });
});