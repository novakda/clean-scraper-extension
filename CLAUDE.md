# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Firefox-only** browser extension that captures network traffic using Firefox's StreamFilter API. Built with:
- **WXT** (v0.20+): Next-gen web extension framework
- **Vue 3** (v3.5+): Frontend framework with Composition API
- **TypeScript** (v5.9+): Type-safe development
- **Firefox StreamFilter API**: For capturing HTTP request/response bodies

**Important**: This extension is exclusively for Firefox and will not work in Chrome/Edge due to its dependency on the Firefox-specific StreamFilter API.

## Development Commands

### Development
```bash
pnpm dev              # Dev server for Firefox (default)
pnpm dev:firefox      # Same as above (explicit)
```

The dev server supports hot module reload (HMR). Changes to Vue components and TypeScript files automatically reload the extension.

### Building
```bash
pnpm build            # Production build for Firefox (default)
pnpm build:firefox    # Same as above (explicit)
pnpm zip              # Create distributable .zip for Firefox
pnpm zip:firefox      # Same as above (explicit)
```

### Type Checking
```bash
pnpm compile          # Run TypeScript compiler without emitting files
```

### Testing
```bash
pnpm test             # Run build validation tests (fast)
pnpm test:runtime     # Launch Firefox and monitor for runtime errors (requires manual steps)
pnpm test:auto        # Automated test suite using web-ext (recommended)
```

The automated tests validate:
- **test**: TypeScript compilation, build process, manifest validity, required files presence
- **test:runtime**: Launches Firefox with extension via `pnpm dev`, monitors for errors, requires manual verification steps
- **test:auto**: Automated test suite that:
  1. Builds the Firefox extension
  2. Verifies manifest configuration (MV2, permissions)
  3. Confirms StreamFilter data collection is enabled
  4. Launches Firefox with extension using web-ext

Note: Full runtime data collection verification requires manual testing due to Firefox extension sandboxing limitations.

### Post-Install
```bash
pnpm postinstall      # Generates WXT types (runs automatically after pnpm install)
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

- Firefox: `.output/firefox-mv2/`
- Production builds are optimized and minified
- Source maps are generated for debugging

## Firefox-Specific Features

### StreamFilter API
This extension uses Firefox's `browser.webRequest.filterResponseData()` API to capture HTTP response bodies. This API is:
- **Firefox-exclusive**: Not available in Chrome/Edge
- **Powerful**: Allows reading/modifying response data before the page sees it
- **Currently enabled**: See `entrypoints/background.ts` for implementation

### Why Firefox-Only?
Chrome/Edge would require the `chrome.debugger` API for similar functionality, which:
- Has significant performance overhead
- Shows a persistent "debugging" banner to users
- Is less suitable for production extensions

For these reasons, this extension is designed exclusively for Firefox.
