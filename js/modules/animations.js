// animations.js - AOS animations setup
export function initializeAOS() {
  if (window.AOS) {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      disable: 'mobile'
    });
  }
}