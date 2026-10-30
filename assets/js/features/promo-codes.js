const FEEDBACK_MS = 2000;
const COPIED_COLOR = '#53fc18';
const COPIED_HTML = `<span style="color:${COPIED_COLOR};">COPIED! ✓</span>`;

/**
 * Copies a promo code to the clipboard and briefly shows a "COPIED!"
 * confirmation inside the clicked box.
 */
function copyPromo(code, element) {
  navigator.clipboard.writeText(code).then(() => {
    const originalHtml = element.innerHTML;
    element.innerHTML = COPIED_HTML;
    element.style.borderColor = COPIED_COLOR;
    setTimeout(() => {
      element.innerHTML = originalHtml;
      element.style.borderColor = '';
    }, FEEDBACK_MS);
  });
}

/** Wires every `[data-promo-code]` box to copy its code on click. */
export function initPromoCodes() {
  document.querySelectorAll('[data-promo-code]').forEach((box) => {
    box.addEventListener('click', () => copyPromo(box.dataset.promoCode, box));
  });
}
