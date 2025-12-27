# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension starter template built with:
- **WXT** (v0.20+): Next-gen web extension framework
- **Vue 3** (v3.5+): Frontend framework with Composition API
- **TypeScript** (v5.9+): Type-safe development

## Development Commands

### Development
```bash
npm run dev              # Dev server for Chrome (default)
npm run dev:firefox      # Dev server for Firefox
```

The dev server supports hot module reload (HMR). Changes to Vue components and TypeScript files automatically reload the extension.

### Building
```bash
npm run build            # Production build for Chrome
npm run build:firefox    # Production build for Firefox
npm run zip              # Create distributable .zip for Chrome
npm run zip:firefox      # Create distributable .zip for Firefox
```

### Type Checking
```bash
npm run compile          # Run TypeScript compiler without emitting files
```

### Post-Install
```bash
npm run postinstall      # Generates WXT types (runs automatically after npm install)
```

## Architecture

### Entrypoints Pattern

WXT uses a file-based entrypoint system. Files in `entrypoints/` automatically become extension components:

- `entrypoints/background.ts` → Background service worker (manifest v3)
- `entrypoints/content.ts` → Content script injected into matching pages
- `entrypoints/popup/` → Extension popup UI (Vue app)
- Additional entrypoints can be added (options page, sidepanel, etc.)

Each entrypoint exports a `default` that uses WXT's define functions:
- `defineBackground()` for background scripts
- `defineContentScript()` for content scripts
- Standard Vue app setup for UI entrypoints (popup, options, etc.)

### Content Scripts

Content scripts use `defineContentScript()` with configuration:
```typescript
export default defineContentScript({
  matches: ['*://*.example.com/*'],  // URL patterns to inject
  main() {
    // Script logic
  },
});
```

### Vue Integration

The `@wxt-dev/module-vue` module is configured in `wxt.config.ts`, enabling:
- Vue 3 Single File Components (.vue)
- TypeScript support in Vue components
- Auto-imports for Vue APIs (ref, computed, etc.)
- Path alias `@/` for root-level imports (e.g., `@/components/HelloWorld.vue`)

### Directory Structure

- `entrypoints/` - Extension entry points (background, content, popup, etc.)
- `components/` - Reusable Vue components
- `assets/` - Static assets (images, styles, etc.)
- `public/` - Files copied as-is to output (icons, manifest resources)
- `.wxt/` - Generated TypeScript types and config (gitignored)
- `.output/` - Built extension output (gitignored)

### TypeScript Configuration

The project uses a minimal `tsconfig.json` that extends `.wxt/tsconfig.json` (auto-generated). WXT handles all TypeScript configuration including:
- Path aliases (`@/` → project root)
- Web extension API types (`browser.*`)
- Vue type definitions

## Browser API Access

Use the `browser` global (cross-browser WebExtension API):
```typescript
browser.runtime.id
browser.tabs.query()
browser.storage.local.get()
```

WXT provides unified API access across Chrome and Firefox.

## Build Output

- Chrome/Edge: `.output/chrome-mv3/`
- Firefox: `.output/firefox-mv2/` or `.output/firefox-mv3/`
- Production builds are optimized and minified
- Source maps are generated for debugging
