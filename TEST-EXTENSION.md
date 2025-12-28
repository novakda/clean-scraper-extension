# Extension Build Validation Test

Fast build validation test that checks TypeScript compilation, build process, manifest validity, and required files - **without launching Firefox**.

## What This Test Does

1. ✅ Runs TypeScript compilation (`pnpm compile`)
2. ✅ Builds the extension for Firefox
3. ✅ Validates the manifest.json structure and required fields
4. ✅ Verifies all expected build output files are present

## Prerequisites

1. **Node.js and pnpm** must be installed
2. **Project dependencies** must be installed:
   ```bash
   pnpm install
   ```

**Note:** Firefox is NOT required for this test (unlike `test:auto`).

## Running the Test

```bash
pnpm test
```

**What happens:**
- TypeScript compiles (no emit, just validation)
- Extension builds for Firefox
- Manifest is validated
- Build output files are checked
- Results displayed (no browser launch)

## Expected Results

### Console Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Network Traffic Capturer - Automated Test Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/4] Checking TypeScript compilation...
  ✓ TypeScript compilation passed

[2/4] Building extension...
  ✓ Build completed successfully

[3/4] Validating manifest...
  ✓ Manifest valid (v0.0.0)
      Name: Network Traffic Capturer
      Permissions: storage, webRequest, webRequestBlocking, tabs, <all_urls>

[4/4] Checking build output...
  ✓ All expected files present:
      manifest.json: 0.45 KB
      background.js: 45.23 KB
      popup.html: 2.15 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✓  All tests passed (4/4)
    Extension is ready for testing!

    To run in Firefox: pnpm dev:firefox
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Test Success Criteria

### ✅ Pass

All 4 steps must succeed:

1. **TypeScript Compilation**
   - `pnpm compile` exits with code 0
   - No type errors in any `.ts` or `.vue` files

2. **Build Success**
   - `pnpm build:firefox` exits with code 0
   - `.output/firefox-mv2/` directory created

3. **Manifest Valid**
   - `manifest.json` exists and is valid JSON
   - Contains all required fields:
     - `manifest_version`
     - `name`
     - `version`
     - `permissions`

4. **Build Output Complete**
   - All expected files present:
     - `manifest.json`
     - `background.js`
     - `popup.html`
   - Files have non-zero size

### ❌ Fail

Test fails if ANY of these occur:

- TypeScript has compilation errors
- Build fails (non-zero exit code)
- Manifest is missing or invalid
- Any expected file is missing from build output

## Test Validations Breakdown

### Step 1: Check TypeScript Compilation

**Command:** `pnpm compile` (runs `vue-tsc --noEmit`)

**What it checks:**
- All TypeScript files compile without errors
- Vue component types are valid
- No type mismatches or errors

**Common failures:**
- Type errors in `.ts` files
- Vue component prop type issues
- Missing type definitions
- Import errors

### Step 2: Build Extension

**Command:** `pnpm build:firefox`

**What it checks:**
- WXT build process completes
- All source files compile and bundle
- Output directory is created

**Common failures:**
- Build configuration errors
- Vue compilation errors
- Asset loading failures
- Missing dependencies

### Step 3: Validate Manifest

**What it checks:**
- `manifest.json` exists at `.output/firefox-mv2/manifest.json`
- File is valid JSON
- Contains required fields:
  - `manifest_version` (should be 2 for Firefox)
  - `name`
  - `version`
  - `permissions` (array)

**Output includes:**
- Extension name
- Version number
- List of permissions

**Common failures:**
- Manifest not generated
- Invalid JSON syntax
- Missing required fields
- WXT configuration issues

### Step 4: Check Build Output

**What it checks:**
- Expected files exist in `.output/firefox-mv2/`:
  - `manifest.json`
  - `background.js`
  - `popup.html`
- Files have reasonable sizes (> 0 bytes)

**Output includes:**
- File sizes in KB for each expected file

**Common failures:**
- Missing background script
- Missing popup HTML
- Zero-byte files (incomplete build)
- Build partially completed

## Troubleshooting

### Issue 1: TypeScript Compilation Fails

**Symptoms:**
```
[1/4] Checking TypeScript compilation...
  ✗ TypeScript compilation failed:
```

**Solutions:**

1. Check the error messages for specific type errors

2. Run TypeScript compiler directly to see details:
   ```bash
   pnpm compile
   ```

3. Common fixes:
   - Add missing type definitions
   - Fix type mismatches
   - Update Vue component props
   - Check import paths

4. For Vue component errors, check:
   - Prop types are correct
   - Computed properties have correct types
   - Event handlers match expected signatures

### Issue 2: Build Fails

**Symptoms:**
```
[2/4] Building extension...
  ✗ Build failed:
```

**Solutions:**

1. Clean and rebuild:
   ```bash
   rm -rf .output .wxt
   pnpm build
   ```

2. Check WXT configuration:
   - Verify `wxt.config.ts` is valid
   - Check `manifestVersion: 2`

3. Reinstall dependencies if needed:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

4. Check for asset loading errors:
   - Verify all imported files exist
   - Check icon paths in `public/`

### Issue 3: Invalid Manifest

**Symptoms:**
```
[3/4] Validating manifest...
  ✗ Missing required fields: ...
```

**Solutions:**

1. Check `wxt.config.ts` manifest configuration

2. Verify required permissions:
   ```typescript
   export default defineConfig({
     manifest: {
       permissions: [
         'storage',
         'webRequest',
         'webRequestBlocking',
         'tabs',
         '<all_urls>'
       ]
     }
   });
   ```

3. Rebuild:
   ```bash
   pnpm build
   ```

### Issue 4: Missing Build Output Files

**Symptoms:**
```
[4/4] Checking build output...
  ✗ Missing files: background.js, popup.html
```

**Solutions:**

1. Verify entrypoints exist:
   - `entrypoints/background.ts`
   - `entrypoints/popup/index.html` or `entrypoints/popup/App.vue`

2. Check WXT entrypoint auto-discovery:
   - Files in `entrypoints/` should be auto-detected
   - Check file naming matches WXT conventions

3. Rebuild from scratch:
   ```bash
   rm -rf .output .wxt
   pnpm build
   ```

4. Check for build errors in previous steps

## Differences from test:auto

### This Test (test:extension)
- ✅ Faster (5-10 seconds)
- ✅ No Firefox required
- ✅ Runs in CI/CD easily
- ❌ Doesn't verify runtime behavior
- ❌ Doesn't test in actual browser

### test:auto
- ✅ Tests runtime behavior
- ✅ Verifies extension loads in Firefox
- ✅ Checks StreamFilter initialization
- ❌ Slower (15-25 seconds)
- ❌ Requires Firefox installed

**Recommendation:** Run `test:extension` (this test) frequently during development. Run `test:auto` before commits and in CI/CD.

## Use Cases

### During Development
```bash
# Quick check after making changes
pnpm test
```

### Before Commit
```bash
# Full validation
pnpm test && pnpm test:auto
```

### In CI/CD Pipeline
```yaml
# Fast feedback first
- run: pnpm test

# Then full integration test
- run: pnpm test:auto
```

## Exit Codes

- **0** - All tests passed
- **1** - One or more tests failed

## Test Duration

**Expected runtime:** 5-10 seconds

- TypeScript check: 2-3 seconds
- Build: 3-5 seconds
- Validation: < 1 second
- File check: < 1 second

## Related Files

- `test-extension.mjs` - Test implementation
- `test-automated.mjs` - Full test with Firefox integration
- `test-runtime.mjs` - Manual runtime verification
- `tests/TESTING.md` - General testing guide

## Notes

- This test is designed for speed - use it frequently during development
- Does not replace browser testing - still need `test:auto` and manual testing
- Perfect for pre-commit hooks and CI/CD pipelines
- File sizes shown are approximate and will vary based on build content
