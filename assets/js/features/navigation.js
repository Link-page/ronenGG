/**
 * Pill-menu view switching. Each `.pill-btn[data-view]` shows the matching
 * `#view-<name>` section and hides the others.
 * @param {{ onViewShown: (viewName: string) => void }} options
 */
export function initNavigation({ onViewShown }) {
  document.querySelectorAll('.pill-btn[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      showView(button.dataset.view, button);
      onViewShown(button.dataset.view);
    });
  });
}

function showView(viewName, activeButton) {
  document.querySelectorAll('.pill-btn').forEach((btn) => btn.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach((section) => section.classList.remove('active'));
  activeButton.classList.add('active');
  document.getElementById('view-' + viewName).classList.add('active');
}
