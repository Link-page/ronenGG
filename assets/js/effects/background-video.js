import { uiState } from '../state.js';
import { onLoadAndFirstGesture } from '../utils/media.js';

const getVideo = () => document.getElementById('watermark-bg');

/** Plays the looping watermark video, ignoring autoplay rejections. */
export function playBackgroundVideo() {
  const video = getVideo();
  if (video) video.play().catch(() => {});
}

export function pauseBackgroundVideo() {
  const video = getVideo();
  if (video) video.pause();
}

/** Starts the watermark video on load / first gesture unless animations are paused. */
export function initBackgroundVideo() {
  onLoadAndFirstGesture(() => {
    if (!uiState.animationsPaused) playBackgroundVideo();
  });
}
