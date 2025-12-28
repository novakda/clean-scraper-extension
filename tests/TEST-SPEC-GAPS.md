# Test Specification Gaps Analysis

This document tracks which automated tests are missing specifications and what needs to be done.

## Test Coverage Status

### ✅ Tests WITH Specifications

| Test File | Spec File | Status | Notes |
|-----------|-----------|--------|-------|
| `tests/xhr-smoke-test.js` | `tests/XHR-SMOKE-TEST.md` | ✅ Complete | Consolidated XHR/API smoke test with full spec |

### ❌ Tests MISSING Specifications

| Test File | Missing Spec | Priority | Notes |
|-----------|--------------|----------|-------|
| `tests/playwright-example.spec.ts` | `tests/PLAYWRIGHT-EXAMPLE.md` | LOW | Example file, may not need spec |

## Naming Convention

### Successfully Consolidated

The NSE India tests have been consolidated into a single XHR smoke test:

```
Previous tests (removed):
- tests/nseindia-full-auto.js
- tests/nseindia-automated.js
- tests/nseindia.spec.ts
- tests/NSE-INDIA-TEST.md

New consolidated test:
Test: tests/xhr-smoke-test.js
Spec: tests/XHR-SMOKE-TEST.md
```

This consolidation:
- Eliminates duplicate tests
- Provides clearer naming (XHR smoke test vs NSE India specific)
- Maintains the same functionality
- Follows the kebab-case → SCREAMING-KEBAB-CASE convention

## Priority Actions

### Immediate (Before Next Development)

1. ✅ **COMPLETED: Consolidated NSE India tests**
   - Combined three separate test files into one
   - Created `tests/xhr-smoke-test.js` with full spec
   - Renamed to reflect generic XHR testing purpose
   - Removed obsolete test files

### Short Term (This Week)

2. **Evaluate `playwright-example.spec.ts`**
   - Determine if this is just example code
   - If keeping, create minimal spec
   - If not needed, remove file

### Long Term (Future)

5. **Evaluate `playwright-example.spec.ts`**
   - Determine if this is just example code
   - If keeping, create minimal spec
   - If not needed, remove file

## Spec Template Usage

For each missing spec, use the template:

```bash
# For test-automated.mjs
cp tests/TEST-SPEC-TEMPLATE.md TEST-AUTOMATED.md

# For test-extension.mjs
cp tests/TEST-SPEC-TEMPLATE.md TEST-EXTENSION.md

# etc.
```

Then fill in all sections based on the actual test implementation.

## Implementation Notes

### For `test-automated.mjs` Spec

Should document:
- What it validates (build, manifest, files, StreamFilter)
- How to run it (`pnpm test:auto`)
- Expected output format
- Pass/fail criteria
- Common failures and fixes

### For `test-extension.mjs` Spec

Should document:
- What it validates (TypeScript, build process, manifest)
- How to run it (`pnpm test`)
- What files it checks
- Build errors and resolutions

## Consolidation Opportunities

### ✅ Completed Consolidations

1. **XHR Smoke Test (formerly NSE India Tests)**
   - ✅ Combined three separate test files into one
   - ✅ `tests/xhr-smoke-test.js` - Single consolidated implementation
   - ✅ `tests/XHR-SMOKE-TEST.md` - Comprehensive specification
   - ✅ Removed duplicate files
   - ✅ Updated all documentation references

### Validated Separate Tests

2. **Build Validation**
   - `test-automated.mjs` - Automated build test with Firefox launch
   - `test-extension.mjs` - Build-only validation (no browser)

   **Status:** Confirmed as separate tests with different purposes, no overlap

## Naming Convention Guidelines

### Standard Convention

All tests follow the standard pattern:
- Test file: `kebab-case.js` or `.mjs` or `.ts`
- Spec file: `SCREAMING-KEBAB-CASE.md` (uppercase version)

Examples:
- `test-automated.mjs` → `TEST-AUTOMATED.md`
- `xhr-smoke-test.js` → `XHR-SMOKE-TEST.md`

### Handling Acronyms

For acronyms and compound names:
- Keep acronyms together: `XHR-SMOKE` not `X-H-R-SMOKE`
- Maintain readability while following convention
- Use hyphens to separate logical parts: `xhr-smoke-test` not `xhrsmoketest`

## Action Items Summary

### ✅ Completed
- [x] Consolidated NSE India tests into XHR smoke test
- [x] Created `XHR-SMOKE-TEST.md` comprehensive spec
- [x] Updated all documentation references
- [x] Removed duplicate test files
- [x] Updated package.json test scripts

### Low Priority
- [ ] Decide on `playwright-example.spec.ts` fate
- [ ] Create `PLAYWRIGHT-EXAMPLE.md` (if keeping example)
- [ ] Add more test examples with proper specs
- [ ] Consider spec versioning if tests evolve significantly

## Completion Tracking

Update this section as specs are created:

- [x] `TEST-AUTOMATED.md` created
- [x] `TEST-EXTENSION.md` created
- [x] `XHR-SMOKE-TEST.md` created (replaces NSE-INDIA-TEST.md)
- [x] NSE India tests consolidated into `xhr-smoke-test.js`
- [x] Obsolete test files removed
- [ ] `PLAYWRIGHT-EXAMPLE.md` created or file removed
- [x] `TEST-SPEC-TEMPLATE.md` created
- [x] `TESTING.md` updated with pattern documentation

## Next Review Date

**Last review:** 2025-12-27 - XHR smoke test consolidation completed

**Next review:** After next test implementation or when adding new tests

At that point:
1. Apply learnings to other tests
2. Create remaining specs
3. Update this document with current status
