import { MenuDropdown } from './components/menu/MenuDropdown.js';
import { initDragList } from './modules/DragNDrop/drag-drop.js';
import { StickyNotesManager} from './components/stickies/StickyNotesManager.js';

document.addEventListener('DOMContentLoaded', (): void => {
  console.log('🚀 Initializing app...');
  console.log('📄 Document ready state:', document.readyState);
  console.log('🔍 Checking for #list:', document.getElementById('list'));
  
  try {
    new MenuDropdown();
    new StickyNotesManager();
    initDragList();
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }
});