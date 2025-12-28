# Automated Build & Integration Test

This test validates that the extension builds correctly for Firefox and verifies critical functionality is properly configured.

## What This Test Does

1. ✅ Builds the extension for Firefox
2. ✅ Verifies manifest configuration (Manifest V2, permissions)
3. ✅ Confirms StreamFilter data collection is enabled in the build
4. ✅ Launches Firefox with the extension using web-ext
5. ✅ Monitors for critical errors during extension load

## Prerequisites

1. **Node.js and pnpm** must be installed
2. **Firefox** must be installed and available
3. **Project dependencies** must be installed:
   ```bash
   pnpm install
   ```

## Running the Test

```bash
pnpm test:auto
```

**What happens:**
- Extension builds automatically
- Configuration is validated
- Firefox launches with the extension
- Test monitors for 10 seconds
- Browser closes automatically
- Test reports pass/fail

## Expected Results

### Console Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Firefox Extension - Automated Test Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/4] Building Firefox extension...
  ✓ Build completed successfully

[2/4] Verifying build configuration...
  ✓ Using Manifest V2 (Firefox)
  ✓ Required webRequest permissions present

[3/4] Verifying data collection is enabled...
  ✓ StreamFilter data collection is ENABLED
      Extension will capture network traffic when loaded in Firefox
  ✓ StreamFilter capture function found in build

[4/4] Running Firefox integration test...
      Starting Firefox with extension using web-ext...
      StreamFilter initialized successfully
  ✓ Extension loaded successfully in Firefox
  ✓ No critical errors detected
      Note: Full runtime data collection testing requires manual verification
      Run "pnpm dev" and manually test the extension for complete validation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✓  All automated tests passed (4/4)
    Extension is properly configured for Firefox!

    To manually verify data collection:
    1. Run: pnpm dev
    2. Browse to any website
    3. Click the extension icon
    4. Verify captured network traffic is displayed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Test Success Criteria

### ✅ Pass

All 4 steps must succeed:

1. **Build Success**
   - Exit code 0 from `pnpm build:firefox`
   - `.output/firefox-mv2/` directory created
   - `manifest.json` exists

2. **Configuration Valid**
   - `manifest_version: 2` (Manifest V2)
   - Permissions include `webRequest` and `webRequestBlocking`
   - No manifest parsing errors

3. **StreamFilter Enabled**
   - Build output contains StreamFilter initialization code
   - Contains `filterResponseData` function calls
   - Does NOT contain "StreamFilter disabled" message

4. **Firefox Integration**
   - Extension loads in Firefox (via web-ext)
   - No critical JavaScript errors
   - Process completes without crashes

### ❌ Fail

Test fails if ANY of these occur:

- Build fails (non-zero exit code)
- Manifest is not V2 or missing required permissions
- StreamFilter is disabled in build
- Extension fails to load in Firefox
- Critical errors detected during load

## Test Validations Breakdown

### Step 1: Build Extension

**What it checks:**
- Runs `pnpm build:firefox`
- Verifies exit code is 0
- Confirms build completed without errors

**Common failures:**
- TypeScript compilation errors
- Vue component errors
- Missing dependencies

### Step 2: Verify Build Configuration

**What it checks:**
- Reads `.output/firefox-mv2/manifest.json`
- Verifies `manifest_version === 2`
- Confirms `webRequest` permission present
- Confirms `webRequestBlocking` permission present

**Common failures:**
- Manifest not found (build incomplete)
- Wrong manifest version (should be V2 for Firefox)
- Missing permissions

### Step 3: Verify Data Collection Enabled

**What it checks:**
- Reads `.output/firefox-mv2/background.js`
- Searches for StreamFilter initialization message
- Confirms `filterResponseData` API usage
- Ensures StreamFilter is not disabled

**Common failures:**
- StreamFilter disabled in config
- Build optimization removed necessary code
- StreamFilter code not included in bundle

### Step 4: Run Firefox Integration Test

**What it checks:**
- Launches Firefox via web-ext
- Monitors console output for extension load
- Watches for error messages
- Verifies StreamFilter initializes
- Runs for 10 seconds then closes

**Common failures:**
- Firefox not installed or not in PATH
- Extension permissions rejected
- JavaScript runtime errors
- web-ext not found

## Troubleshooting

### Issue 1: Build Fails

**Symptoms:**
```
[1/4] Building Firefox extension...
  ✗ Build failed:
```

**Solutions:**

1. Check TypeScript errors:
   ```bash
   pnpm compile
   ```

2. Clean and rebuild:
   ```bash
   rm -rf .output .wxt
   pnpm build
   ```

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

### Issue 2: Wrong Manifest Version

**Symptoms:**
```
  ⚠ Manifest version: 3
```

**Solutions:**

This extension requires Manifest V2 for Firefox. Check `wxt.config.ts`:
```typescript
export default defineConfig({
  manifestVersion: 2,  // Must be 2
  // ...
});
```

### Issue 3: Missing Permissions

**Symptoms:**
```
  ✗ Missing webRequest permissions
```

**Solutions:**

Check that the manifest includes these permissions:
```json
{
  "permissions": [
    "webRequest",
    "webRequestBlocking",
    "storage",
    "tabs",
    "<all_urls>"
  ]
}
```

Verify in `wxt.config.ts` or `manifest.json` (for WXT, check the config).

### Issue 4: StreamFilter Disabled

**Symptoms:**
```
  ✗ StreamFilter data collection is DISABLED
```

**Solutions:**

1. Check `utils/config.ts` for StreamFilter config
2. Verify `entrypoints/background.ts` initializes StreamFilter
3. Ensure build includes the StreamFilter code

Check the background script:
```typescript
const isFirefox = typeof browser?.webRequest?.filterResponseData === 'function';

if (isFirefox) {
  console.log('Firefox detected - using StreamFilter API for response body capture');
  initStreamFilterCapture(pendingRequests);
}
```

### Issue 5: Firefox Integration Fails

**Symptoms:**
```
  ⚠ Could not confirm extension load
```

**Solutions:**

1. Verify Firefox is installed:
   ```bash
   firefox --version
   ```

2. Check web-ext is available:
   ```bash
   pnpx web-ext --version
   ```

3. Try manual load:
   ```bash
   pnpm dev
   ```
   Then check if extension appears in toolbar.

4. Check Firefox console for errors:
   - Manual load: `about:debugging` → Inspect extension

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

2. Clean test profile:
   ```bash
   rm -rf test-profile-auto/
   ```

3. Run test again

## Limitations

### What This Test Does NOT Verify

- ❌ Actual data capture from real websites (use `pnpm test:nseindia` for this)
- ❌ Extension popup UI functionality
- ❌ Storage persistence across sessions
- ❌ All edge cases and error scenarios

### Manual Verification Still Required

After this test passes, manually verify:

1. **Data Capture Works:**
   ```bash
   pnpm dev
   ```
   - Navigate to a website
   - Click extension icon
   - Verify traffic appears

2. **UI Functions Correctly:**
   - Test configuration changes
   - Test clear traffic button
   - Verify filters work

3. **Storage Persists:**
   - Capture some traffic
   - Close and reopen Firefox
   - Verify data is still there

## Exit Codes

- **0** - All tests passed
- **1** - One or more tests failed

Use in CI/CD:
```bash
pnpm test:auto && echo "Tests passed" || echo "Tests failed"
```

## Test Duration

**Expected runtime:** 15-25 seconds

- Build: 5-10 seconds
- Verification: < 1 second
- Firefox integration: 10-12 seconds
- Cleanup: 1-2 seconds

## Related Files

- `test-automated.mjs` - Test implementation
- `test-extension.mjs` - Build-only validation (no Firefox)
- `tests/xhr-smoke-test.js` - Real-world XHR/API capture smoke test
- `tests/XHR-SMOKE-TEST.md` - XHR smoke test specification
- `tests/TESTING.md` - General testing guide

## Notes

- This test creates a temporary profile (`test-profile-auto/`) that can be safely deleted
- The 10-second wait during Firefox integration is intentional to allow extension initialization
- Exit code 0 only if all 4 steps pass
- Web-ext may show warnings - only errors cause test failure
