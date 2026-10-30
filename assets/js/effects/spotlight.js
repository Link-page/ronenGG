import { uiState } from '../state.js';

/**
 * Computes the spotlight tint for a pointer position given as fractions of
 * the viewport (0–1). Three "hot zones" — pink top-left, blue at the left and
 * right edges, white near the bottom-centre — blend the colour and raise its
 * opacity as the pointer approaches them.
 * @returns {string} CSS rgba() colour
 */
export function spotlightColor(x, y) {
  const pink = Math.max(0, 1 - Math.hypot(x - 0.18, y - 0.14) * 2.6);
  const blue = Math.max(0, 1 - Math.hypot(x - 0.02, y - 0.50) * 2.15, 1 - Math.hypot(x - 0.98, y - 0.55) * 2.15);
  const white = Math.max(0, 1 - Math.hypot(x - 0.50, y - 0.72) * 1.65);
  const r = Math.round(122 + pink * 54 + white * 60 - blue * 18);
  const g = Math.round(140 + blue * 44 + white * 64);
  const b = Math.round(185 + blue * 58 + white * 54 - pink * 12);
  const a = 0.13 + Math.max(pink, blue, white) * 0.11;
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

/** Makes #spotlight follow the pointer and re-tints it via --spotlight-color. */
export function initSpotlight() {
  const spotlight = document.getElementById('spotlight');

  document.addEventListener('mousemove', (e) => {
    if (!spotlight || uiState.animationsPaused) return;
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
    const x = e.clientX / Math.max(window.innerWidth, 1);
    const y = e.clientY / Math.max(window.innerHeight, 1);
    document.documentElement.style.setProperty('--spotlight-color', spotlightColor(x, y));
  });
}

/** Shows the spotlight (it stays hidden while the splash screen plays). */
export function revealSpotlight() {
  const spotlight = document.getElementById('spotlight');
  if (spotlight) spotlight.style.display = 'block';
}
