/**
 * Initialize all components when DOM is ready
 * This file handles auto-initialization of components on page load
 */
import { MenuDropdown } from './components/menu/MenuDropdown.js';

document.addEventListener('DOMContentLoaded', () => {
  new MenuDropdown();
});