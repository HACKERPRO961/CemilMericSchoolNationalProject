// main.js - Main JavaScript file
import { initializeAOS } from './modules/animations.js';
import { setupMobileMenu } from './modules/menu.js';
import { setupFormValidation } from './modules/forms.js';
import { setupBackToTopButton } from './modules/scroll.js';
import { setupLazyLoading } from './modules/lazy-loading.js';

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
  initializeAOS();
  setupMobileMenu();
  setupFormValidation();
  setupBackToTopButton();
  setupLazyLoading();
});