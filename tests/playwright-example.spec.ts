/**
 * Example Playwright Test for Network Traffic Capturer Extension
 *
 * This file demonstrates how to use the diagnostic UI elements for automated testing.
 *
 * Setup:
 * 1. Install Playwright: pnpm add -D @playwright/test playwright
 * 2. Install browsers: pnpx playwright install firefox
 * 3. Run tests: pnpx playwright test
 *
 * For Firefox extensions, you'll need to:
 * - Build the extension first: pnpm build
 * - Load the extension from .output/firefox-mv2
 */

import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.join(__dirname, '..', '.output', 'firefox-mv2');

// Helper to wait for element with retry
async function waitForTestId(page: any, testId: string, timeout = 5000) {
  return await page.waitForSelector(`[data-testid="${testId}"]`, { timeout });
}

test.describe('Network Traffic Capturer Extension', () => {
  let context: BrowserContext;

  test.beforeAll(async () => {
    // Note: Loading Firefox extensions in Playwright requires special setup
    // This example shows the structure - actual implementation may vary
    // For now, this is a template showing how to use the test IDs
  });

  test('should display correct capture statistics', async ({ page }) => {
    // Navigate to extension popup
    // In actual implementation, you'd open the popup like:
    // await page.goto('moz-extension://<extension-id>/popup.html');

    // Example: Check initial state
    const capturedCount = await page.getByTestId('total-captured');
    const filteredCount = await page.getByTestId('total-filtered');
    const trafficCount = await page.getByTestId('traffic-count');

    // Verify initial counts are 0
    await expect(capturedCount).toHaveAttribute('data-count', '0');
    await expect(filteredCount).toHaveAttribute('data-count', '0');
    await expect(trafficCount).toHaveAttribute('data-count', '0');
  });

  test('should capture XHR requests from test site', async ({ page }) => {
    // 1. Configure the extension for specific URL pattern
    const patternInput = await page.getByTestId('pattern-input-0');
    await patternInput.fill('*://jsonplaceholder.typicode.com/*');

    const saveButton = await page.getByTestId('save-config-btn');
    await saveButton.click();

    // 2. Navigate to a test page or create one that makes XHR requests
    // For example, navigate to a page that calls the API:
    await page.goto('about:blank');
    await page.evaluate(async () => {
      // Make XHR request
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1');
      xhr.send();
      await new Promise(resolve => {
        xhr.onload = resolve;
      });

      // Make fetch request
      await fetch('https://jsonplaceholder.typicode.com/users/1');
    });

    // 3. Wait a moment for capture to complete
    await page.waitForTimeout(2000);

    // 4. Check the popup to verify captures
    const trafficCount = await page.getByTestId('traffic-count');
    const count = await trafficCount.getAttribute('data-count');

    // Should have captured both the request and response (2+ items)
    expect(parseInt(count || '0')).toBeGreaterThan(0);
  });

  test('should display recent captures in diagnostic section', async ({ page }) => {
    // After making requests (from previous test or setup)
    const recentTrafficList = await page.getByTestId('recent-traffic-list');

    // Should be visible if there are captures
    await expect(recentTrafficList).toBeVisible();

    // Get first traffic item
    const firstItem = await page.getByTestId('traffic-item-0');
    await expect(firstItem).toBeVisible();

    // Verify it has required data attributes
    const itemType = await firstItem.getAttribute('data-type');
    const itemUrl = await firstItem.getAttribute('data-url');

    expect(itemType).toMatch(/^(request|response)$/);
    expect(itemUrl).toBeTruthy();
  });

  test('should show correct config in diagnostic display', async ({ page }) => {
    // Set specific config
    const statusCodesInput = await page.locator('input[placeholder*="200"]');
    await statusCodesInput.fill('200, 201, 204');

    const requireContentType = await page.locator('input[type="checkbox"]').first();
    await requireContentType.uncheck();

    await page.getByTestId('save-config-btn').click();
    await page.waitForTimeout(600);

    // Verify diagnostic display shows correct values
    const configStatusCodes = await page.getByTestId('config-status-codes');
    const configRequireContentType = await page.getByTestId('config-require-content-type');

    await expect(configStatusCodes).toHaveText('200, 201, 204');
    await expect(configRequireContentType).toHaveText('false');
  });

  test('should filter requests by URL pattern', async ({ page }) => {
    // 1. Set specific URL pattern
    const patternInput = await page.getByTestId('pattern-input-0');
    await patternInput.fill('*://api.github.com/*');
    await page.getByTestId('save-config-btn').click();

    // 2. Make requests to matching and non-matching URLs
    await page.evaluate(async () => {
      // Should be captured
      await fetch('https://api.github.com/users/github');

      // Should NOT be captured
      await fetch('https://jsonplaceholder.typicode.com/posts/1');
    });

    await page.waitForTimeout(2000);

    // 3. Verify only matching URL was captured
    const recentList = await page.getByTestId('recent-traffic-list');
    const items = await recentList.locator('[data-testid^="traffic-item-"]').all();

    for (const item of items) {
      const url = await item.getAttribute('data-url');
      expect(url).toContain('api.github.com');
      expect(url).not.toContain('jsonplaceholder');
    }
  });

  test('should handle multiple URL patterns', async ({ page }) => {
    // Add second pattern
    await page.getByTestId('add-pattern-btn').click();

    const pattern0 = await page.getByTestId('pattern-input-0');
    const pattern1 = await page.getByTestId('pattern-input-1');

    await pattern0.fill('*://api.github.com/*');
    await pattern1.fill('*://jsonplaceholder.typicode.com/*');

    await page.getByTestId('save-config-btn').click();

    // Verify config display shows both patterns
    const configPatterns = await page.getByTestId('config-url-patterns');
    const patternsText = await configPatterns.textContent();

    expect(patternsText).toContain('api.github.com');
    expect(patternsText).toContain('jsonplaceholder.typicode.com');
  });

  test('should clear all traffic data', async ({ page }) => {
    // Assume we have some traffic captured
    const clearButton = await page.getByTestId('clear-traffic-btn');

    // Mock the confirm dialog
    page.on('dialog', dialog => dialog.accept());

    await clearButton.click();
    await page.waitForTimeout(500);

    // Verify count is reset
    const trafficCount = await page.getByTestId('traffic-count');
    await expect(trafficCount).toHaveAttribute('data-count', '0');

    // Verify recent list is empty
    const recentList = await page.getByTestId('recent-traffic-list');
    await expect(recentList).not.toBeVisible();
  });

  test('should verify XHR with specific status codes', async ({ page }) => {
    // Configure to capture 201 Created responses
    const statusCodesInput = await page.locator('input[placeholder*="200"]');
    await statusCodesInput.fill('200, 201');
    await page.getByTestId('save-config-btn').click();

    // Make a POST request that returns 201
    await page.evaluate(async () => {
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({ title: 'test', body: 'test', userId: 1 }),
        headers: { 'Content-Type': 'application/json' }
      });
    });

    await page.waitForTimeout(2000);

    // Check recent captures for 201 status
    const items = await page.locator('[data-testid^="traffic-item-"]').all();
    const statusCodes = await Promise.all(
      items.map(item => item.getAttribute('data-status'))
    );

    expect(statusCodes.some(status => status === '201')).toBeTruthy();
  });
});

/**
 * Integration Test Example with Actual Extension
 *
 * To run with actual extension loaded:
 */
test.describe('Extension Integration Tests', () => {
  test.skip('full integration test with loaded extension', async () => {
    // This test requires special setup to load Firefox extension
    // Left as example/template for actual implementation

    // 1. Build extension: pnpm build
    // 2. Use web-ext or Firefox dev tools to load extension
    // 3. Get extension popup URL
    // 4. Run tests against popup
  });
});
