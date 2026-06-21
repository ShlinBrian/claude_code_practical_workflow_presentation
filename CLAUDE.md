# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is reveal.js

reveal.js is an open source HTML presentation framework (v6.0.1). It outputs both ES module and UMD bundles. The core is written as a mix of JavaScript and TypeScript, built with Vite, and tested with QUnit + Puppeteer.

## Common Commands

- **Dev server:** `npm start` (Vite, default port 8000)
- **Full build:** `npm run build` (runs tsc, builds core + all plugins + styles)
- **Build core only:** `npm run build:core`
- **Build styles only:** `npm run build:styles`
- **Run all tests:** `npm test` (spins up Vite on port 8009, runs all `test/*.html` files via QUnit/Puppeteer)
- **TypeScript check:** `npx tsc --noEmit`

Tests are HTML-based QUnit files in `test/`. There is no way to run a single test file via CLI — the test runner (`scripts/test.js`) globs all `test/*.html` files and runs them in parallel via Puppeteer.

## Architecture

### Core (`js/reveal.js`)

The main `Reveal` function (not a class) is a factory that creates a deck instance. It composes ~19 controller modules and returns a public API object. Each deck instance is independent, supporting multiple presentations per page.

`js/index.ts` wraps this with a singleton API for backward compatibility (`Reveal.initialize()`).

### Controllers (`js/controllers/`)

Each controller manages one concern and is instantiated by the Reveal factory. Key controllers:
- `slidecontent` — manages media, iframes, code highlighting within slides
- `scrollview` / `printview` — alternative view modes
- `autoanimate` — transition animations between slides
- `fragments` — incremental reveal of slide elements
- `overview` — zoomed-out slide overview
- `touch` — touch/swipe navigation
- `keyboard` — keyboard bindings
- `location` — URL hash state
- `controls` / `progress` / `slidenumber` — UI chrome
- `overlay` — link preview overlay

### Plugins (`plugin/`)

Built-in plugins, each with their own Vite config and built separately: highlight, markdown, math, notes, search, zoom. Plugins follow the reveal.js plugin API (object with `id` and `init` method).

### Styles (`css/`)

- `css/reveal.scss` — core layout and slide styling
- `css/layout.scss` — responsive layout calculations
- `css/theme/` — SCSS themes, each compiled independently via `vite.config.styles.ts`
- Themes extend `css/theme/template/` (mixins, settings, theme base)

### Build Output (`dist/`)

- `reveal.js` (UMD) + `reveal.mjs` (ESM) + `reveal.css` + `reset.css`
- `reveal.d.ts` — TypeScript definitions (source at `js/reveal.d.ts`)
- `theme/*.css` — compiled themes
- `plugin/*` — compiled plugins (each has .js, .mjs, .d.ts)

### Config (`js/config.ts`)

`defaultConfig` defines all configuration options with defaults. The `RevealConfig` type is defined here.

### Utilities (`js/utils/`)

- `util.ts` — DOM helpers, transforms, event utilities
- `device.ts` — browser/device detection
- `constants.ts` — CSS selectors for slide queries
- `color.ts` — color parsing
- `loader.ts` — script/resource loading

## Key Patterns

- The codebase is incrementally migrating from JS to TS — controllers are still `.js`, utilities and config are `.ts`
- Node >= 20.19.0 required
- Vite aliases: `reveal.js` -> `/js`, `reveal.js/plugin` -> `/plugin`, `reveal.css` -> `/css/reveal.scss`
