# XHR Smoke Test

This test verifies that the Network Traffic Capturer extension correctly captures XHR/Fetch/REST API requests from real-world websites. The test uses nseindia.com as the test site, which is known to make many API calls on page load.

## What This Test Does

1. ✅ Verifies the extension build exists
2. ✅ Launches Firefox with the extension loaded via web-ext
3. ✅ Connects Playwright to Firefox via Chrome DevTools Protocol (CDP)
4. ✅ Navigates to test site (nseindia.com) and waits for API calls
5. ✅ Accesses the extension popup programmatically
6. ✅ Verifies captured network traffic data in the popup UI
7. ✅ Exits automatically with pass/fail status

## Purpose

This is a **smoke test** - a quick validation that the core network capture functionality works in a real-world scenario. It tests:

- **XHR requests** (XMLHttpRequest API)
- **Fetch requests** (Fetch API)
- **REST API calls** (GET, POST, etc.)
- **StreamFilter API** integration
- **Extension UI** displaying captured data

## Prerequisites

1. **Build the extension:**
   ```bash
   pnpm build
   ```

2. **Ensure Firefox is installed** and available in your PATH

3. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

## Running the Test

### Automated Test (Recommended)

Run the fully automated test:

```bash
pnpm test:xhr-smoke
```

**What happens:**
- Firefox opens automatically with the extension loaded
- The test navigates to nseindia.com
- After 15 seconds, the test verifies captured data programmatically
- Browser closes automatically
- Test exits with code 0 (pass) or 1 (fail)

## Expected Results

### Console Output (Success)

```
═══════════════════════════════════════════════════════════
  XHR Smoke Test - Automated Network Capture Verification
═══════════════════════════════════════════════════════════

1️⃣ • Checking extension build...
   • Extension found ✓

═══════════════════════════════════════════════════════════
  Launching Firefox with Extension
═══════════════════════════════════════════════════════════

2️⃣ • Starting web-ext with remote debugging...
   • Firefox started ✓

═══════════════════════════════════════════════════════════
  Connecting Playwright to Firefox
═══════════════════════════════════════════════════════════

3️⃣ • Connecting via Chrome DevTools Protocol...
   • Connected to Firefox ✓

═══════════════════════════════════════════════════════════
  Waiting for XHR/API Requests
═══════════════════════════════════════════════════════════

4️⃣ • Test site makes many API calls on page load...
   • Waiting 15 seconds for requests to complete...
   ✓ Wait complete

═══════════════════════════════════════════════════════════
  Accessing Extension Popup
═══════════════════════════════════════════════════════════

5️⃣ • Finding extension ID...
   • Extension ID: <uuid>
   • Opening extension popup...

═══════════════════════════════════════════════════════════
  Verifying Captured Data
═══════════════════════════════════════════════════════════

6️⃣ • Checking extension popup for captured traffic...

═══════════════════════════════════════════════════════════
  Test Results
═══════════════════════════════════════════════════════════

   • ✅ SUCCESS! Extension captured 42 requests
   • The extension is working correctly!

📊 Summary:
   • Requests captured: 42
   • Test URL: https://www.nseindia.com/
   • Extension: Network Traffic Capturer
   • Test: XHR Smoke Test
```

### What to Look For in the Extension Popup

When the test runs, the extension popup should show:

1. **Traffic Count > 0**
   ```
   Captured Traffic
        15+
   requests captured
   ```

2. **Recent Captures Section**
   Shows captured requests/responses with:
   - Request method (GET, POST, etc.)
   - Request/response URLs
   - Status codes (200, 201, etc.)
   - Data from the test site

3. **Typical URLs Captured from nseindia.com**
   - `www.nseindia.com/api/equity-stockIndices*`
   - `www.nseindia.com/api/market-data-pre-open*`
   - `www.nseindia.com/api/chart-databyindex*`
   - Other API endpoints

## Test Success Criteria

### ✅ Pass

The test passes when ALL of these conditions are met:

1. **Extension builds successfully**
   - `.output/firefox-mv2/` directory exists
   - `manifest.json` is present

2. **Firefox launches with extension**
   - web-ext starts Firefox
   - Extension loads without errors

3. **Playwright connects to Firefox**
   - CDP connection succeeds
   - Can control browser programmatically

4. **Extension popup is accessible**
   - Extension ID can be found
   - Popup HTML loads

5. **Traffic is captured**
   - Traffic count > 0
   - At least one request/response captured

### ❌ Fail

The test fails if ANY of these occur:

- Extension is not built
- Firefox fails to start
- CDP connection fails
- Extension not found in about:debugging
- Extension popup cannot be accessed
- Traffic count is 0
- No captured data visible

## Why nseindia.com?

NSE India (National Stock Exchange of India) is an excellent test site because:

- **High API activity** - Makes 10-30+ API calls on page load
- **Real-world complexity** - Uses modern web technologies
- **Variety of requests** - GET, POST, different content types
- **Public and reliable** - Accessible without authentication
- **REST APIs** - Perfect for testing XHR/Fetch capture

The test is **not** specific to NSE India - it's a generic XHR smoke test that happens to use a good real-world example.

## Troubleshooting

### Issue 1: Extension Not Built

**Symptoms:**
```
❌ Extension not built! Run: pnpm build
```

**Solution:**
```bash
pnpm build
```

### Issue 2: Firefox Failed to Start

**Symptoms:**
```
❌ Firefox failed to start within 30 seconds
```

**Solutions:**

1. Verify Firefox is installed:
   ```bash
   firefox --version
   ```

2. Check if Firefox is already running:
   ```bash
   # Windows
   tasklist | findstr firefox

   # Mac/Linux
   ps aux | grep firefox
   ```

3. Kill existing Firefox processes and try again

### Issue 3: CDP Connection Failed

**Symptoms:**
```
❌ Failed to connect to Firefox: connect ECONNREFUSED
```

**Solutions:**

1. Ensure port 9222 is not blocked by firewall
2. Check if another process is using port 9222
3. Wait a few seconds longer for Firefox to initialize
4. Try restarting the test

### Issue 4: Extension Not Found

**Symptoms:**
```
❌ Extension not found in about:debugging
```

**Solutions:**

1. Rebuild the extension:
   ```bash
   pnpm build
   ```

2. Verify manifest.json exists:
   ```bash
   cat .output/firefox-mv2/manifest.json
   ```

3. Check extension name in manifest matches "Network Traffic Capturer"

### Issue 5: No Traffic Captured

**Symptoms:**
```
❌ FAILED! No requests were captured
```

**Check:**

1. **StreamFilter enabled?**
   - Open Firefox DevTools console during test
   - Look for "StreamFilter initialized" message
   - If not present, check `utils/stream-filter.ts`

2. **URL patterns configured?**
   - Default should be `*://*/*` (capture all URLs)
   - Check extension config in popup

3. **Status codes configured?**
   - Should include at least: 200, 201, 204
   - NSE India uses 200 and 304 status codes

4. **Manual test:**
   ```bash
   pnpm dev
   ```
   Then manually navigate to nseindia.com and check popup

### Issue 6: Test Timeout or Hang

**Symptoms:**
- Test runs but never completes
- Firefox stays open indefinitely

**Solutions:**

1. Manually kill Firefox:
   ```bash
   # Windows
   taskkill /F /IM firefox.exe

   # Mac/Linux
   pkill firefox
   ```

2. Run test again

3. If issue persists, check for JavaScript errors in Firefox console

## Reliability Notes

### Known Limitations

1. **CDP Connection Stability**
   - ⚠️ `chromium.connectOverCDP()` may fail intermittently
   - **Mitigation:** Test includes retry logic (3 attempts with 2s delay)

2. **Timing Dependencies**
   - ⚠️ Fixed 15-second wait may not be enough for slow networks
   - **Mitigation:** Wait time can be adjusted in test file

3. **Extension ID Discovery**
   - ⚠️ about:debugging UI may change between Firefox versions
   - **Mitigation:** Uses DOM query that works across recent versions

4. **Network Variability**
   - ⚠️ Test site (nseindia.com) may be slow or unavailable
   - **Mitigation:** Test can be adapted to use different test sites

### Recommended Practices

1. **Run test in clean environment** - Close other Firefox instances
2. **Use stable internet connection** - Test site needs to load
3. **Don't interrupt test** - Let it complete fully
4. **Check logs if test fails** - Error messages are detailed

## Test Duration

**Expected runtime:** 25-35 seconds

- Build verification: < 1 second
- Firefox launch: 3-5 seconds
- CDP connection: 2-5 seconds
- Page load + wait: 15-20 seconds
- Verification: 2-3 seconds
- Cleanup: 1-2 seconds

## Exit Codes

- **0** - Test passed (traffic captured successfully)
- **1** - Test failed (no traffic or error occurred)

Use in CI/CD:
```bash
pnpm test:xhr-smoke && echo "✅ Smoke test passed" || echo "❌ Smoke test failed"
```

## Adapting to Other Test Sites

To test with a different website:

1. Edit `tests/xhr-smoke-test.js`
2. Change `TEST_URL` constant:
   ```javascript
   const TEST_URL = 'https://your-test-site.com/';
   ```
3. Adjust `WAIT_FOR_REQUESTS_MS` if needed
4. Run test as normal

**Good test sites:**
- GitHub.com (API calls)
- Twitter/X.com (XHR heavy)
- Reddit.com (REST APIs)
- Any SPA that makes API calls

## Related Files

- `tests/xhr-smoke-test.js` - Test implementation
- `tests/XHR-SMOKE-TEST.md` - This specification
- `tests/NSE-INDIA-IMPLEMENTATION-PLAN.md` - Implementation approach reference
- `tests/TESTING.md` - General testing guide
- `entrypoints/popup/App.vue` - Extension popup with diagnostic UI
- `utils/stream-filter.ts` - StreamFilter implementation

## Next Steps

After this test passes:

1. ✅ Core network capture is working
2. ✅ StreamFilter API is functional
3. ✅ Extension UI displays data correctly
4. ✅ Ready for manual testing with real use cases
5. ✅ Can build more specific tests for edge cases

## Version History

- **v1.0** - Initial NSE India specific test
- **v2.0** - Renamed to XHR Smoke Test, made generic for any XHR/API testing
