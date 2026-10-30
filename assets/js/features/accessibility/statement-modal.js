/** Lets the browser paint the un-hidden modal before starting the fade-in. */
const ENTER_DELAY_MS = 10;
/** Matches the modal's Tailwind `duration-300` transitions. */
const EXIT_DURATION_MS = 300;

const getModal = () => document.getElementById('a11y-modal');

function openStatement() {
  const modal = getModal();
  const dialog = modal.querySelector('div');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    dialog.classList.remove('scale-95');
    dialog.classList.add('scale-100');
  }, ENTER_DELAY_MS);
}

function closeStatement() {
  const modal = getModal();
  const dialog = modal.querySelector('div');
  modal.classList.add('opacity-0');
  dialog.classList.remove('scale-100');
  dialog.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, EXIT_DURATION_MS);
}

/**
 * Wires the Accessibility Statement modal: `[data-action="open-a11y-statement"]`
 * opens it; `[data-action="close-a11y-statement"]` or a backdrop click closes it.
 */
export function initStatementModal() {
  document.querySelectorAll('[data-action="open-a11y-statement"]').forEach((btn) => {
    btn.addEventListener('click', openStatement);
  });
  document.querySelectorAll('[data-action="close-a11y-statement"]').forEach((btn) => {
    btn.addEventListener('click', closeStatement);
  });

  const modal = getModal();
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeStatement();
  });
}
