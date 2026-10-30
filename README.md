# RonenGG — Official Links

Link-in-bio page for [RonenGG](https://kick.com/ronengg), served by **GitHub Pages**
straight from the repository root (no build step). A scheduled GitHub Action keeps
the page's leaderboards and Kick live badge up to date.

## How it works

```
GitHub Action (every 15 min)                     index.html (browser)
──────────────────────────────                   ─────────────────────────────
scripts/fetch-kicks-leaderboard.js  ──► leaderboard.json ──► DONATORS · Top Kicks
scripts/fetch-subs-leaderboard.js   ──► subs.json        ──► DONATORS · Top Subs
scripts/fetch_wager_leaderboards.py ──► data/empiredrop.json, data/csdrop.json
                                                         ──► CODES & LEADERBOARDS widget
scripts/check_kick_live.py          ──► data/kick_live.json ──► "Live Now / Offline" badge
```

The workflow commits the JSON files back to `main`; the page fetches them with a
cache-busting query string. **Their paths and formats are a contract** between the
scripts and the page — see `assets/js/config.js` and
`.github/workflows/update-leaderboard.yml` (guarded by `tests/unit/site-structure.test.js`).

## Project structure

```
index.html                     Page markup (GitHub Pages entry point)
leaderboard.json, subs.json    ┐ Bot-managed data — do not edit by hand
data/*.json                    ┘
assets/
  css/
    base.css                   Design tokens, reset, document defaults
    background.css             Particles canvas, vignette, watermark video, spotlight
    layout.css                 Main shell, page reveal, view switching, drop-in animation
    splash.css                 Intro video overlay
    components/                One stylesheet per UI component
  js/
    main.js                    Entry point — wires the features together
    config.js                  Data file paths and shared constants
    state.js                   Shared UI state (animations paused)
    services/data-files.js     Cache-busted JSON loader
    utils/                     Pure helpers (formatting, countdown, media autoplay)
    effects/                   Particles, spotlight, background video, item animations
    features/                  Splash, navigation, live badge, leaderboards, promo codes,
                               flip cards, accessibility/*
  images/, video/              Static media
scripts/                       Data scrapers run by the workflow
  lib/                         Shared helpers (Puppeteer launch, repo-relative output)
tests/
  unit/                        node:test — pure modules + site wiring checks
  python/                      unittest — data scripts (network mocked)
  e2e/                         Playwright smoke test of the whole page
.github/workflows/
  update-leaderboard.yml       Scheduled data refresh (every 15 min)
  ci.yml                       Tests on pull requests
```

### Conventions

- **CSS order matters.** Stylesheets are linked from `index.html` in cascade order;
  responsive overrides live at the bottom of the same file as the rule they override.
  Tailwind (Play CDN) utilities are generated at runtime and always come last.
- **No inline handlers.** Markup exposes hooks (`id`s and `data-*` attributes such as
  `data-view`, `data-promo-code`, `data-site`, `data-spin`, `data-action`); each
  feature module finds its elements and attaches listeners in an `init…()` function.
- **Pure logic is DOM-free** (`utils/`, row/HTML builders) so it can be unit-tested in Node.
- Paths used by the JavaScript are relative to `index.html`, not to the module file.

## Local development

ES modules don't load from `file://`, so serve the folder over HTTP:

```bash
npm run serve        # → http://localhost:8000
```

## Running the data scripts locally

```bash
npm install
pip install -r requirements.txt
```

```bash
npm run fetch:kicks
```

```bash
npm run fetch:subs
```

```bash
python scripts/fetch_wager_leaderboards.py
```

```bash
KICK_CLIENT_ID=… KICK_CLIENT_SECRET=… python scripts/check_kick_live.py
```

Scripts write relative to the repository root regardless of the working directory.

## Tests

```bash
npm test               # JavaScript unit tests
```

```bash
npm run test:python    # Python unit tests
```

```bash
npx playwright install chromium
npm run test:e2e       # Browser smoke test
```

Set `CHROMIUM_PATH` to run the smoke test with an existing Chromium/Chrome binary.

## Workflow secrets

`update-leaderboard.yml` needs the repository secrets `KICK_CLIENT_ID` and
`KICK_CLIENT_SECRET` (a Kick developer app) for the live badge.
