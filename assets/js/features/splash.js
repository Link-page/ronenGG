import { onLoadAndFirstGesture } from '../utils/media.js';

/** Reveal the site this many seconds before the intro video ends. */
const EXIT_LEAD_SECONDS = 0.35;
/** Remove the splash after its 0.55s CSS fade-out has finished. */
const REMOVE_DELAY_MS = 600;
/** Fallback reveal delay if the page has no intro video element. */
const NO_VIDEO_REVEAL_MS = 1850;

/**
 * Plays the full-screen intro video, then fades it out and reveals the page.
 * The reveal happens (once) when the video nears its end, ends, errors, or
 * cannot be autoplayed.
 * @param {{ onActivate: () => void }} options  called once, as the page is revealed
 */
export function initSplash({ onActivate }) {
  const splash = document.getElementById('splash-screen');
  const video = document.getElementById('splash-video');
  const mainContent = document.getElementById('main-page-content');
  let activated = false;

  function activateSite() {
    if (activated) return;
    activated = true;
    if (splash) splash.style.opacity = '0';
    if (mainContent) mainContent.classList.add('visible');
    onActivate();
    setTimeout(() => {
      if (splash) splash.style.display = 'none';
    }, REMOVE_DELAY_MS);
  }

  onLoadAndFirstGesture(() => {
    if (!video || activated) return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => activateSite());
    }
  });

  if (video) {
    video.addEventListener('timeupdate', () => {
      if (!activated && video.currentTime >= video.duration - EXIT_LEAD_SECONDS) {
        activateSite();
      }
    });
    video.addEventListener('ended', activateSite);
    video.addEventListener('error', activateSite);
    // Module scripts run after parsing, so the video may already have
    // failed or finished before the listeners above were attached.
    if (video.error || video.ended) activateSite();
  } else {
    setTimeout(activateSite, NO_VIDEO_REVEAL_MS);
  }
}
