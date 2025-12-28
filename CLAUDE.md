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
pnpm test:auto        # Automated test suite using web-ext (recommended)
pnpm test:xhr-smoke   # XHR/API capture smoke test on real website
```

The automated tests validate:
- **test**: TypeScript compilation, build process, manifest validity, required files presence
- **test:auto**: Automated test suite that:
  1. Builds the Firefox extension
  2. Verifies manifest configuration (MV2, permissions)
  3. Confirms StreamFilter data collection is enabled
  4. Launches Firefox with extension using web-ext
- **test:xhr-smoke**: Real-world smoke test that:
  1. Launches Firefox with extension loaded using Playwright
  2. Navigates to a test site (nseindia.com) with many API calls
  3. Verifies captured network traffic in extension popup
  4. Auto-exits with pass/fail status and closes browser

Note: The XHR smoke test uses Playwright's **Firefox-native** automation (not CDP/Chromium) to verify actual data capture.

#### Test Specification Pattern

**IMPORTANT**: Every automated test MUST have a corresponding markdown specification file:

```
tests/
├── my-test.js               # Test implementation
├── MY-TEST.md               # Test specification (REQUIRED)
├── another-test.mjs         # Another test
└── ANOTHER-TEST.md          # Its specification (REQUIRED)
```

**Naming Convention**:
- Test file: `kebab-case.js` or `.mjs` or `.ts`
- Spec file: `SCREAMING-KEBAB-CASE.md` (uppercase version of test name)
- Example: `nseindia-full-auto.js` → `NSE-INDIA-FULL-AUTO.md`

**Specification Requirements**:
Each test spec file must include:
1. **What This Test Does** - Clear numbered steps
2. **Prerequisites** - What must be true before running
3. **Running the Test** - Exact commands to execute
4. **Expected Results** - What success looks like
5. **Test Success Criteria** - Pass/fail conditions
6. **Troubleshooting** - Common issues and solutions

See `tests/XHR-SMOKE-TEST.md` as the reference example.

**Why This Pattern?**
- Specifications document the **intent** and **requirements**
- Implementations can change, but specs define what must be true
- Specs enable non-developers to verify test behavior
- When implementation differs from spec, spec wins (implementation should be fixed)

### Testing Standards (CRITICAL)

**IMPORTANT:** This project has strict testing standards that MUST be followed:

1. **Extension Launch:** ALWAYS use `web-ext` to launch and install the extension
2. **Firefox Profile:** ALWAYS use the existing persistent profile named **"dev"**
3. **Test Automation:** ALWAYS use Playwright to control and test the Firefox instance
4. **Never deviate from these standards without explicit permission**

### Using web-ext for Testing

The project uses Mozilla's `web-ext` tool for automated testing. This tool is installed as a dev dependency.

**Standard Configuration:**
- Profile: Use persistent profile named "dev"
- Extension loading: via web-ext (not Playwright's native extension loading)
- Test automation: Playwright connects to web-ext-launched Firefox

**Important CLI Arguments:**

```bash
# Standard usage for this project (using "dev" profile)
web-ext run \
  --source-dir ./.output/firefox-mv2 \
  --firefox-profile dev \
  --keep-profile-changes \
  --start-url https://example.com \
  --no-input

# Common options:
--source-dir <path>         # Extension source directory (required)
--firefox-profile <name>    # Profile name or path (use "dev" for this project)
--keep-profile-changes      # Persist profile changes (REQUIRED for persistent profile)
--start-url <url>           # URL to open when Firefox starts
--arg <value>               # Pass argument to Firefox (repeatable)
--no-input                  # Disable stdin (useful for automation)
--firefox <path>            # Path to Firefox binary
--target firefox-desktop    # Target browser (default)
```

**CRITICAL: Always use `--firefox-profile dev --keep-profile-changes` for this project.**

**IMPORTANT - Common Mistakes:**
- ❌ **Do NOT use `-s`** - There is no short option for `--source-dir`
- ❌ **Do NOT use `--args`** - Use `--arg` (singular) and repeat for multiple args
- ❌ **Do NOT pass args as single string** - Each Firefox arg needs separate `--arg` flag

**Correct Examples:**

```javascript
// ✅ Correct: Using spawn with proper arguments
spawn('pnpm', [
  'web-ext', 'run',
  '--source-dir', './extension',
  '--arg', '--remote-debugging-port=9222',
  '--no-input'
]);

// ❌ Wrong: Using invalid short option
spawn('pnpm', [
  'web-ext', 'run',
  '-s', './extension',  // ERROR: -s doesn't exist
  '--args', '--remote-debugging-port=9222'  // ERROR: should be --arg
]);
```

**Node.js API Usage:**

For more control, use the web-ext Node.js API directly:

```javascript
import webExt from 'web-ext';

// Standard configuration for this project
await webExt.cmd.run(
  {
    sourceDir: './.output/firefox-mv2',
    firefoxProfile: 'dev',              // REQUIRED: Use "dev" profile
    keepProfileChanges: true,            // REQUIRED: Persist profile
    startUrl: ['https://example.com'],
    noInput: true,
  },
  {
    shouldExitProgram: false,
  }
);
```

**Valid Options Reference:**
- `sourceDir` (string) - Extension source directory
- `firefox` (string) - Path to Firefox binary
- `firefoxProfile` (string) - Custom profile path
- `startUrl` (array) - URLs to open on start
- `args` (array) - Firefox command-line arguments
- `noInput` (boolean) - Disable stdin
- `keepProfileChanges` (boolean) - Persist profile
- `browserConsole` (boolean) - Open browser console
- `devtools` (boolean) - Open developer tools
- `pref` (object) - Firefox preferences as key-value pairs

See tests/xhr-smoke-test.js for a complete example of using web-ext with Playwright for automated testing.

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

### Module System

This project uses **ES modules exclusively**:
- `package.json` declares `"type": "module"` - all `.js` files are ES modules
- TypeScript is configured with `"module": "ESNext"` and `"moduleResolution": "Bundler"`
- **All code uses `import/export` syntax** - `require()` and `module.exports` are not used
- Test files (`.js` and `.mjs`) use ES module imports
- For Node.js compatibility in ES modules, `__dirname` is emulated using:
  ```javascript
  import { fileURLToPath } from 'url';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  ```

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
