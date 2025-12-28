# [Test Name] Test

Brief description of what this test verifies (1-2 sentences).

## What This Test Does

1. ✅ First step the test performs
2. ✅ Second step
3. ✅ Third step
4. ✅ Fourth step (if applicable)
5. ✅ Final step

## Prerequisites

1. **Build the extension:**
   ```bash
   pnpm build
   ```

2. **[Add any other prerequisites]:**
   - List specific requirements
   - Dependencies that must be installed
   - Environment setup needed

## Running the Test

### Automated Test (Recommended)

```bash
pnpm test:[test-name]
```

**What happens:**
- Describe what the user will see
- What actions are automated
- What (if any) manual steps are required

### Alternative Method (if applicable)

```bash
pnpm test:[test-name]:alternative
```

Brief description of when to use this alternative.

## Expected Results

You should see [describe what success looks like]:

- ✅ **First success indicator** (e.g., "Traffic Count > 0")
- ✅ **Second success indicator** (e.g., "Extension icon visible")
- ✅ **Third success indicator**
- ✅ **Fourth success indicator**

### Visual Indicators

Describe what the user should see in the UI:

```
[Example of output or UI state]
```

## Test Success Criteria

### ✅ Pass

- First specific, measurable condition
- Second specific, measurable condition
- Third specific, measurable condition
- Must see X in location Y
- Count/value must be > N

### ❌ Fail

- First failure condition
- Second failure condition
- Third failure condition
- Error messages appear
- Count/value is 0 or missing

## Troubleshooting

### Issue 1: [Common Problem Name]

**Issue:** Brief description of the problem

**Solutions:**
1. First solution to try
   ```bash
   command to run
   ```

2. Second solution
   - Step 1
   - Step 2

3. Third solution (if needed)

### Issue 2: [Another Common Problem]

**Issue:** Description

**Solutions:**
1. Solution steps
2. Alternative approach

### Issue 3: [Third Common Problem]

**Check:**
1. Verification step 1
2. Verification step 2
3. What to look for in logs/console

## Expected Test Output

When you run `pnpm test:[test-name]`, you should see output like:

```
═══════════════════════════════════════════════════════════
  [Test Name] - Automated Test
═══════════════════════════════════════════════════════════

1️⃣ • First step description...
   • Detail message
   • Success indicator ✓

═══════════════════════════════════════════════════════════
  Second Major Step
═══════════════════════════════════════════════════════════

2️⃣ • Second step description...
   • Progress indicator
   • Completion ✓

[Continue with expected output format]
```

## Manual Test Steps (Optional)

If the automated test doesn't work, manual testing steps:

1. **First manual step:**
   ```bash
   command
   ```

2. **Second manual step:**
   - Navigate to X
   - Click on Y
   - Verify Z

3. **Verification:**
   - Check A
   - Confirm B
   - Validate C

## Related Files

- `tests/[test-file].js` - Test implementation
- `tests/[related-test].spec.ts` - Alternative test approach (if applicable)
- `tests/TESTING.md` - General testing guide
- `[other-related-files]` - Brief description

## Notes

- Any additional important information
- Known limitations
- Future improvements planned
- Special considerations
