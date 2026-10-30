/**
 * Flips an accessibility option button between ON and OFF: toggles its
 * highlighted `.active-state` style and its `.status-indicator` label.
 * @param {HTMLElement} button
 * @returns {boolean} the new state (true = ON)
 */
export function toggleOptionButton(button) {
  const isOn = button.classList.toggle('active-state');
  button.querySelector('.status-indicator').textContent = isOn ? 'ON' : 'OFF';
  return isOn;
}
