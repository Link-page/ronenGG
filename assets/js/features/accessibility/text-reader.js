import { toggleOptionButton } from './option-button.js';

/** Elements whose text is read aloud when hovered. */
const READABLE_SELECTOR = 'h1, h2, h3, h4, p, li, span, .pill-btn, .card-title, .bonus-item, th, td';
/** Wait this long on an element before reading it, to skip pass-through hovers. */
const HOVER_DELAY_MS = 250;

let isActive = false;
let pendingRead;

function speakText(text) {
  if (!window.speechSynthesis || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

function clearHighlight() {
  document.querySelectorAll('[data-tts-hovered="true"]').forEach((el) => {
    el.dataset.ttsHovered = 'false';
  });
}

function toggleTextReader() {
  isActive = toggleOptionButton(document.getElementById('btn-tts'));

  if (isActive) {
    speakText('Text reader activated.');
  } else {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearHighlight();
  }
}

/** Highlights the readable element under the pointer and reads it aloud. */
function handlePointerMove(e) {
  if (!isActive) return;
  const target = e.target.closest(READABLE_SELECTOR);
  if (!target || target.dataset.ttsHovered === 'true') return;

  clearHighlight();
  target.dataset.ttsHovered = 'true';

  clearTimeout(pendingRead);
  pendingRead = setTimeout(() => {
    speakText(target.innerText || target.textContent);
  }, HOVER_DELAY_MS);
}

/** Wires the "Text Reader (TTS)" toggle and the hover-to-read behaviour. */
export function initTextReader() {
  document.getElementById('btn-tts').addEventListener('click', toggleTextReader);
  document.addEventListener('mousemove', handlePointerMove);
}
