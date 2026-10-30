/**
 * Runs `start` when the DOM is ready and again on the visitor's first
 * touch/click. Mobile browsers often reject autoplay until the user has
 * interacted with the page, so the second attempt unlocks the videos.
 * @param {() => void} start
 */
export function onLoadAndFirstGesture(start) {
  document.addEventListener('DOMContentLoaded', start);
  document.addEventListener('touchstart', start, { once: true });
  document.addEventListener('click', start, { once: true });
}
