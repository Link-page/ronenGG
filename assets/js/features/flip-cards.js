const HALF_TURN_DEG = 180;

let rotationDeg = 0;

/** Rotates every donator flip card half a turn (Subs ↔ Kicks). */
function spinCards(direction) {
  rotationDeg += direction === 'right' ? HALF_TURN_DEG : -HALF_TURN_DEG;
  document.querySelectorAll('.flip-inner').forEach((card) => {
    card.style.transform = `rotateY(${rotationDeg}deg)`;
  });
}

/** Wires the `[data-spin="left|right"]` arrows. */
export function initFlipCards() {
  document.querySelectorAll('[data-spin]').forEach((arrow) => {
    arrow.addEventListener('click', () => spinCards(arrow.dataset.spin));
  });
}
