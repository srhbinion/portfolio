import { MenuDropdown } from './components/menu/MenuDropdown.js';
import { DragDropManager} from './components/stickies/DragDropManager.js';
import { TimeDisplay } from './components/time-display/time-display.js';

document.addEventListener('DOMContentLoaded', (): void => {
  console.log('🚀 Initializing app...');
  console.log('📄 Document ready state:', document.readyState);
  console.log('🔍 Checking for #list:', document.getElementById('list'));
  
  try {
    new MenuDropdown();
    new DragDropManager();
    TimeDisplay();
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }
});