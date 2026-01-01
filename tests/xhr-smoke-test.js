/**
 * XHR Smoke Test - Automated Network Capture Verification (Firefox-Only)
 *
 * This script verifies that the Firefox extension can capture XHR/fetch/REST API calls
 * from a real-world website. Uses nseindia.com as the test site (known to make
 * many API calls).
 *
 * Implementation approach (WXT + Playwright best practices):
 * 1. Use playwright-webextext to load Firefox extension
 * 2. Navigate to test site and wait for API calls
 * 3. Verify captured data in extension popup UI
 * 4. Exit with pass/fail status and close browser
 *
 * Prerequisites:
 * - Extension must be built: pnpm build
 * - Firefox will be auto-downloaded by Playwright if missing
 *
 * Run with: pnpm test:xhr-smoke
 *
 * IMPORTANT:
 * - Uses playwright-webextext for clean Firefox extension loading
 * - No web-ext or WebSocket complexity needed
 * - Follows WXT framework testing best practices
 * - This is a Firefox-only extension
 */

import { firefox } from 'playwright';
import { withExtension } from 'playwright-webextext';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', '.output', 'firefox-mv2');
const TEST_URL = 'https://www.nseindia.com/';
const WAIT_FOR_REQUESTS_MS = 15000;
const EXTENSION_ID = 'network-traffic-capturer@clean-scraper.test'; // Static ID from manifest

function log(message, symbol = '•') {
  console.log(`${symbol} ${message}`);
}

function heading(message) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${message}`);
  console.log('═'.repeat(60) + '\n');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  let browser = null;
  let page = null;

  // Ensure cleanup always happens
  const cleanup = async () => {
    log('\n🧹 Cleaning up...', '  ');
    try {
      if (page) {
        await page.close().catch(() => {});
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    try {
      if (browser) {
        await browser.close().catch(() => {});
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    await sleep(1000);
  };

  // Register cleanup handlers
  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(130);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(143);
  });

  try {
    heading('XHR Smoke Test - Automated Network Capture Verification');

    // Step 1: Verify extension build
    log('Checking extension build...', '1️⃣');
    if (!fs.existsSync(EXTENSION_PATH)) {
      console.error('❌ Extension not built! Run: pnpm build');
      await cleanup();
      process.exit(1);
    }

    const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.error('❌ Extension manifest not found!');
      await cleanup();
      process.exit(1);
    }
    log('Extension found ✓', '  ');

    heading('Launching Firefox with Extension');
    log('Loading extension using playwright-webextext...', '2️⃣');

    // Use playwright-webextext to load the extension
    const browserWithExtension = withExtension(firefox, EXTENSION_PATH);

    browser = await browserWithExtension.launch({
      headless: false, // Must be visible to test UI
    });

    log('Firefox started with extension loaded ✓', '  ');

    // Create a new page
    page = await browser.newPage();

    heading('Navigating to Test Site');
    log('Loading test site...', '3️⃣');
    await page.goto(TEST_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    log('Test site loaded ✓', '  ');

    heading('Waiting for XHR/API Requests');
    log('Test site makes many API calls on page load...', '4️⃣');
    log(`Waiting ${WAIT_FOR_REQUESTS_MS / 1000} seconds for requests to complete...`, '  ');

    // Wait for requests to complete
    for (let i = WAIT_FOR_REQUESTS_MS / 1000; i > 0; i--) {
      process.stdout.write(`\r  ⏱️  ${i} seconds remaining...`);
      await sleep(1000);
    }
    console.log('\r  ✓ Wait complete                    ');

    // Give extension time to process and store data
    await sleep(2000);

    heading('Accessing Extension Popup');
    log('Using static extension ID...', '5️⃣');
    log(`Extension ID: ${EXTENSION_ID}`, '  ');

    // Open extension popup using static ID
    const popupUrl = `moz-extension://${EXTENSION_ID}/popup.html`;
    log('Opening extension popup...', '  ');
    await page.goto(popupUrl, { timeout: 10000 });
    await sleep(2000);

    heading('Verifying Captured Data');
    log('Checking extension popup for captured traffic...', '6️⃣');

    // Try to get traffic count from the popup UI
    const trafficCount = await page.evaluate(() => {
      // Try multiple selectors for robustness
      const countElement =
        document.querySelector('[data-testid="traffic-count"]') ||
        document.querySelector('[data-testid="total-captured"]');

      if (countElement) {
        const count = countElement.getAttribute('data-count');
        if (count) return parseInt(count);
      }

      // Fallback: count visible traffic items
      const listItems = document.querySelectorAll('[data-testid^="traffic-item-"]');
      return listItems.length;
    });

    heading('Test Results');

    if (trafficCount > 0) {
      log(`✅ SUCCESS! Extension captured ${trafficCount} requests`, '  ');
      log('The extension is working correctly!', '  ');

      console.log('\n📊 Summary:');
      console.log(`   • Requests captured: ${trafficCount}`);
      console.log(`   • Test URL: ${TEST_URL}`);
      console.log(`   • Extension: Network Traffic Capturer`);
      console.log(`   • Test: XHR Smoke Test\n`);

      // Clean up
      await cleanup();
      process.exit(0);
    } else {
      console.error('❌ FAILED! No requests were captured');
      console.error('\nPossible issues:');
      console.error('   • StreamFilter API may not be enabled');
      console.error('   • Extension permissions may be incorrect');
      console.error('   • Network requests may be blocked');
      console.error('   • URL patterns may not match test site\n');

      // Clean up
      await cleanup();
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error.stack);

    // Clean up
    await cleanup();
    process.exit(1);
  }
}

// Run test with error handling
runTest().catch(error => {
  console.error('\n❌ Test error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
