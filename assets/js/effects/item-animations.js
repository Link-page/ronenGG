import { uiState } from '../state.js';

const STAGGER_MS = 90;

/**
 * Replays the staggered drop-in animation on every `.animated-item` in the
 * currently visible view.
 */
export function animateItems() {
  if (uiState.animationsPaused) return;
  document.querySelectorAll('.view-section.active .animated-item').forEach((item, index) => {
    item.classList.remove('item-animate');
    item.style.animationDelay = `${index * STAGGER_MS}ms`;
    void item.offsetWidth; // Force a reflow so re-adding the class restarts the animation.
    item.classList.add('item-animate');
  });
}
