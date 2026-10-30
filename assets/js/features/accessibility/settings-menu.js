import { pauseBackgroundVideo, playBackgroundVideo } from '../../effects/background-video.js';
import { uiState } from '../../state.js';
import { toggleOptionButton } from './option-button.js';

/** Scales all rem-based sizes by changing the root font size (80–150%). */
function updateFontSize(percent) {
  document.getElementById('fontSizeVal').textContent = percent + '%';
  document.documentElement.style.fontSize = percent + '%';
}

/** Adds extra letter spacing to the whole page (0–5px). */
function updateSpacing(px) {
  document.getElementById('spacingVal').textContent = px + 'px';
  document.body.style.letterSpacing = px + 'px';
}

function toggleHighContrast() {
  document.body.classList.toggle('a11y-high-contrast');
  toggleOptionButton(document.getElementById('btn-high-contrast'));
}

/** Freezes CSS animations, the particles, spotlight and background video. */
function toggleAnimations() {
  uiState.animationsPaused = !uiState.animationsPaused;
  document.body.classList.toggle('a11y-no-animations');

  if (uiState.animationsPaused) {
    pauseBackgroundVideo();
  } else {
    playBackgroundVideo();
  }

  toggleOptionButton(document.getElementById('btn-pause-animations'));
}

/**
 * Wires the floating accessibility widget: open/close button, text size
 * and word spacing sliders, high-contrast and pause-animations toggles.
 * (The text reader toggle lives in text-reader.js.)
 */
export function initSettingsMenu() {
  document.getElementById('a11y-toggle').addEventListener('click', () => {
    document.getElementById('a11y-menu').classList.toggle('open');
  });
  document.getElementById('fontSizeSlider').addEventListener('input', (e) => updateFontSize(e.currentTarget.value));
  document.getElementById('wordSpacingSlider').addEventListener('input', (e) => updateSpacing(e.currentTarget.value));
  document.getElementById('btn-high-contrast').addEventListener('click', toggleHighContrast);
  document.getElementById('btn-pause-animations').addEventListener('click', toggleAnimations);
}
