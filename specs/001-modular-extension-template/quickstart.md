# Quick Start Guide

**Feature**: Modular Extension Template (001-modular-extension-template)
**Last Updated**: 2025-12-31

## Overview

This guide helps you quickly get started with the Firefox Scraper Extension Template. In under 10 minutes, you'll have a working Firefox extension that captures HTTP requests and responses.

## Prerequisites

### Required

- **Firefox** Developer Edition or Nightly (version 57+ for StreamFilter support)
- **Node.js** 18+ or 20+ (LTS versions supported)
- **pnpm** 10.26.2 or later

### Development Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd clean-scraper-extension

# Install dependencies
pnpm install

# Start development server
pnpm dev:firefox
```

Firefox will open automatically with the extension loaded. You should see the extension icon in the toolbar.

## Quick Start (5 Minutes)

### 1. Understand the Template Structure

```text
lib/                      # Core library modules (types, capture, storage, messaging)
components/request-viewer/   # Reusable UI components
entrypoints/               # Extension entry points (background, popup, tab)
tests/                     # Test suites (unit, integration, component)
```

### 2. Test the Default Extension

The template comes with a fully functional extension out of the box.

**To test**:

1. **Click the extension icon** in Firefox toolbar
2. **Popup opens** showing "HTTP Request Capture" interface
3. **Browse any website** (e.g., example.com, api.github.com)
4. **See requests appear** in the list as they're made
5. **Click any request** to view details (URL, method, headers, body, etc.)
6. **Use filters** - Filter by URL, method, or status code
7. **Try auto-refresh** - Toggle auto-refresh to see updates in real-time

**That's it!** You now have a working HTTP request capture extension.

---

## Creating Your Own Extension

### Step 1: Modify Capture Logic (5 minutes)

The extension captures all HTTP requests by default. Customize what to capture in `lib/capture-coordinator.ts`.

**Example: Capture only API requests**

```typescript
// lib/capture-coordinator.ts
// Modify the shouldCapture function

function shouldCapture(url: string, type: string): boolean {
  // Only capture xmlhttprequest (AJAX/Fetch)
  if (type !== 'xmlhttprequest') {
    return false;
  }

  // Only capture specific domains
  if (!url.includes('api.example.com')) {
    return false;
  }

  return true;
}
```

**Example: Capture specific resource types**

```typescript
function shouldCapture(url: string, type: string): boolean {
  const allowedTypes = ['xmlhttprequest', 'script', 'main_frame'];
  return allowedTypes.includes(type);
}
```

---

### Step 2: Customize the UI (10 minutes)

You can use the default UI components, build a custom interface, or mix and match.

#### Option A: Use Default UI (Quickest)

The default `components/MainApp.vue` provides a complete request viewer. Just customize colors, layout, or add features.

**To modify**:

```vue
<!-- components/MainApp.vue -->
<template>
  <div class="app-container">
    <!-- Add your custom header -->
    <div class="custom-header">
      <h1>My Custom Scraper</h1>
      <button @click="exportData">Export Data</button>
    </div>

    <!-- Use existing request viewer -->
    <div class="request-viewer">
      <RequestFilter @update="handleFilterUpdate" />
      <RequestList :requests="filteredRequests" @select="handleSelect" />
      <RequestDetail v-if="selectedRequest" :entry="selectedRequest" @close="closeDetail" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRequestCapture } from '@/lib/composables/useRequestCapture';
import { useRequestFilters } from '@/lib/composables/useRequestFilters';
import RequestFilter from '@/components/request-viewer/RequestFilter.vue';
import RequestList from '@/components/request-viewer/RequestList.vue';
import RequestDetail from '@/components/request-viewer/RequestDetail.vue';

// Use provided composables for logic
const { capturedRequests, fetchRequests, clearRequests } = useRequestCapture();
const { filteredRequests, updateFilters } = useRequestFilters(capturedRequests);

// Add your custom functionality
function exportData() {
  console.log('Exporting:', filteredRequests.value);
  // Implement export logic
}
</script>
```

#### Option B: Build Custom UI (Most Flexible)

Import individual components and composables to create your own interface.

**Example: Minimal request viewer**

```vue
<script setup lang="ts">
import { useRequestCapture } from '@/lib/composables/useRequestCapture';
import RequestList from '@/components/request-viewer/RequestList.vue';

// Use composable for state management
const { capturedRequests, fetchRequests } = useRequestCapture();
</script>

<template>
  <div class="my-custom-ui">
    <h1>My Custom Request Viewer</h1>
    <RequestList :requests="capturedRequests" />
    <button @click="fetchRequests">Refresh</button>
  </div>
</template>
```

---

### Step 3: Add Content Scripts (Optional)

If you need to interact with web pages (scrape DOM elements, inject scripts), use the content script framework.

**Example: Send DOM data to background**

```typescript
// entrypoints/content.ts
import { sendMessageToBackground } from '@/lib/content-script/messaging';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scrapeData);
    } else {
      scrapeData();
    }
  },
});

function scrapeData() {
  const title = document.querySelector('h1')?.textContent;
  const paragraphs = document.querySelectorAll('p').length;

  // Send to background for storage
  sendMessageToBackground({
    type: 'SAVE_PAGE_DATA',
    data: {
      url: window.location.href,
      title,
      paragraphCount: paragraphs
    }
  });
}
```

---

### Step 4: Test Your Changes

1. **Rebuild**: Run `pnpm dev:firefox` to reload extension
2. **Browse**: Navigate to websites and test your custom logic
3. **Debug**: Check browser console (F12) for errors
4. **Verify**: Confirm your customizations work as expected

---

## Development Workflow

### Making Changes

```bash
# 1. Edit files
# Open the files you want to modify in your editor

# 2. Hot reload
# Save changes - extension reloads automatically in dev mode

# 3. Check console
# Open browser console (F12) to see any errors

# 4. Test functionality
# Verify your changes work as expected
```

### Type Checking

```bash
# Run TypeScript type checker
pnpm compile
```

Fix any type errors before committing changes.

### Testing

```bash
# Run all tests
pnpm test:all

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:components
```

Ensure all tests pass before committing.

---

## Building for Production

### Development Build

```bash
# Build for Firefox
pnpm build:firefox
```

Extension is built to `.output/firefox-mv3/` directory.

### Loading in Firefox

1. **Navigate** to `about:debugging`
2. **Load temporary extension**: Click "Load Temporary Add-on"
3. **Select** `.output/firefox-mv3/` directory
4. **Enable** the extension

### Production Build (ZIP)

```bash
# Build and create ZIP package
pnpm zip:firefox
```

Generates `.output/firefox-mv3.zip` ready for Firefox Add-ons distribution.

---

## Common Tasks

### Capture All Requests

By default, the template captures all HTTP requests. This is usually what you want.

**To customize**: Modify the `shouldCapture` logic in `lib/capture-coordinator.ts`

### Filter Requests

Use built-in filters or create custom ones:

```typescript
import { useRequestFilters } from '@/lib/composables/useRequestFilters';

const { filteredRequests, updateFilters } = useRequestFilters(capturedRequests);

// Filter by URL
updateFilters({ urlPattern: 'api.github.com' });

// Filter by method
updateFilters({ method: 'POST' });

// Filter by status code
updateFilters({ statusCode: '200' });
```

### Export Captured Data

Add export functionality to your UI:

```typescript
async function exportData(format: 'json' | 'csv') {
  const data = capturedRequests.value;

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    await browser.downloads.download({ url, filename: 'requests.json' });
  }

  if (format === 'csv') {
    // Convert to CSV and download
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    await browser.downloads.download({ url, filename: 'requests.csv' });
  }
}
```

### Custom Storage Backend

If you need persistent storage beyond the in-memory default, implement a custom backend:

```typescript
// lib/storage/custom-storage.ts
import { ICaptureStorage } from './types';
import type { CapturedEntry } from '@/lib/types/capture';

export class CustomStorage implements ICaptureStorage {
  addEntry(entry: CapturedEntry): void {
    // Use browser.storage.local
    browser.storage.local.set({ [entry.id]: entry });
  }

  getAll(): CapturedEntry[] {
    // Load from browser.storage.local
    const result = await browser.storage.local.get(null);
    return Object.values(result);
  }

  // Implement all other ICaptureStorage methods...
}
```

---

## Debugging

### Check Extension Logs

```bash
# Firefox browser console (F12)
# Shows console.log statements from background and content scripts

# Terminal
# pnpm dev:firefox
# Shows build output and extension loading status
```

### Common Issues

**Extension doesn't load**:
- Check Firefox version (needs 57+ for StreamFilter)
- Check if extension is enabled in `about:addons`
- Check browser console for errors

**Requests not appearing**:
- Verify StreamFilter API is available (check PING message response)
- Check if you're browsing http:// URLs (extension captures http and https)
- Verify URL patterns in configuration

**TypeScript errors**:
- Run `pnpm compile` to see all type errors
- Check tsconfig.json for correct paths

---

## Next Steps

After quick start, explore:

- **Library API Documentation**: [api.md](docs/library/api.md)
- **Architecture Guide**: [architecture.md](docs/library/architecture.md)
- **Testing Guide**: [testing.md](docs/library/testing.md)
- **Migration Guide**: If upgrading from previous versions, see [migration.md](docs/migration.md)
- **Examples**: See [examples/](../examples/) for complete working implementations

---

## Support

**Constitutional Principles**:
- ✅ Firefox-First Architecture
- ✅ Modular Background Architecture
- ✅ StreamFilter-Centric Design
- ✅ Module Independence
- ✅ Typed Extensibility
- ✅ WXT Build System Constraint

**Your extension now follows all constitutional principles.**

Happy scraping! 🚀
