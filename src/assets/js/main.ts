/**
 * Initialize all components when DOM is ready
 * This file handles auto-initialization of components on page load
*/

import { MenuDropdown } from './components/menu/MenuDropdown.js';
import { StickyNotesManager } from './components/stickies/StickyNotesManager.js';

document.addEventListener('DOMContentLoaded', (): void => {
  console.log('🚀 DOM loaded');
  new MenuDropdown();

  if (document.getElementById('sticky-notes-container')) {
    console.log('✅ Container found, initializing...');
    const manager = new StickyNotesManager();
    console.log('✅ Manager created:', manager);
  } else {
    console.log('❌ Container NOT found');
  }
});