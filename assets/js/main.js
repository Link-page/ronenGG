/**
 * Entry point: wires the page's features together.
 * Loaded as a module from index.html, so it runs once the HTML is parsed
 * (before DOMContentLoaded).
 */
import { DEFAULT_AFFILIATE_SITE } from './config.js';
import { initBackgroundVideo } from './effects/background-video.js';
import { animateItems } from './effects/item-animations.js';
import { initParticles } from './effects/particles.js';
import { initSpotlight, revealSpotlight } from './effects/spotlight.js';
import { initSettingsMenu } from './features/accessibility/settings-menu.js';
import { initStatementModal } from './features/accessibility/statement-modal.js';
import { initTextReader } from './features/accessibility/text-reader.js';
import { initAffiliateTabs, loadAffiliateLeaderboard } from './features/affiliate-leaderboard.js';
import { loadDonatorLeaderboards } from './features/donators-leaderboard.js';
import { initFlipCards } from './features/flip-cards.js';
import { startLiveStatusPolling } from './features/live-status.js';
import { initNavigation } from './features/navigation.js';
import { initPromoCodes } from './features/promo-codes.js';
import { initSplash } from './features/splash.js';

// Background effects
initParticles();
initBackgroundVideo();
initSpotlight();

// Intro video → reveal the page
initSplash({
  onActivate() {
    revealSpotlight();
    animateItems();
    loadDonatorLeaderboards();
  },
});

// Home view
startLiveStatusPolling();

// View switching
initNavigation({
  onViewShown(viewName) {
    if (viewName === 'home' || viewName === 'bonuses') {
      animateItems();
    }
    if (viewName === 'bonuses') {
      loadAffiliateLeaderboard(DEFAULT_AFFILIATE_SITE);
    }
  },
});

// Codes & leaderboards view
initPromoCodes();
initAffiliateTabs();
document.addEventListener('DOMContentLoaded', () => {
  loadAffiliateLeaderboard(DEFAULT_AFFILIATE_SITE);
});

// Donators view
initFlipCards();

// Accessibility
initStatementModal();
initTextReader();
initSettingsMenu();
