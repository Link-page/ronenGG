const FEEDBACK_MS = 2000;
const COPIED_COLOR = '#53fc18';
const COPIED_HTML = `<span style="color:${COPIED_COLOR};">COPIED! ✓</span>`;

/** Boxes currently showing "COPIED!": element → { originalHtml, timer }. */
const activeFeedback = new WeakMap();

/**
 * Copies a promo code to the clipboard and briefly shows a "COPIED!"
 * confirmation inside the clicked box. Clicking again while the
 * confirmation is showing restarts its timer; the box's original content
 * is captured only once, so it always comes back.
 */
function copyPromo(code, element) {
  navigator.clipboard.writeText(code).then(() => {
    const feedback = activeFeedback.get(element) ?? { originalHtml: element.innerHTML };
    clearTimeout(feedback.timer);

    element.innerHTML = COPIED_HTML;
    element.style.borderColor = COPIED_COLOR;

    feedback.timer = setTimeout(() => {
      element.innerHTML = feedback.originalHtml;
      element.style.borderColor = '';
      activeFeedback.delete(element);
    }, FEEDBACK_MS);
    activeFeedback.set(element, feedback);
  });
}

/** Wires every `[data-promo-code]` box to copy its code on click. */
export function initPromoCodes() {
  document.querySelectorAll('[data-promo-code]').forEach((box) => {
    box.addEventListener('click', () => copyPromo(box.dataset.promoCode, box));
  });
}
