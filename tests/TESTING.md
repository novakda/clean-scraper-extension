# Testing Guide for Network Traffic Capturer Extension

This guide explains the testing conventions, test specifications, and how to use the diagnostic UI elements for automated testing.

## Test Specification Pattern

**REQUIRED**: Every automated test must have a markdown specification file.

### File Organization

```
tests/
├── my-test.js               # Test implementation
├── MY-TEST.md               # Test specification (REQUIRED)
├── another-test.mjs         # Another test
├── ANOTHER-TEST.md          # Its specification (REQUIRED)
├── nseindia-full-auto.js    # Example: NSE India test
└── NSE-INDIA-TEST.md        # Example: NSE India spec
```

### Naming Convention

- **Test file**: `kebab-case.js` or `.mjs` or `.ts`
- **Spec file**: `SCREAMING-KEBAB-CASE.md` (uppercase version of test name)

Examples:
- `xhr-smoke-test.js` → `XHR-SMOKE-TEST.md` ✅
- `test-extension.mjs` → `TEST-EXTENSION.md` ✅
- `my-test.js` → `my-test.md` ❌ (wrong - must be uppercase)

### Required Sections in Test Specs

Every test specification must include these sections:

1. **Title and Description**
   - Clear title (e.g., "# NSE India XHR Capture Test")
   - Brief description of what the test verifies

2. **What This Test Does**
   - Numbered list of steps the test performs
   - Use ✅ checkmarks to show validated steps

3. **Prerequisites**
   - Required dependencies
   - Build requirements
   - Environment setup

4. **Running the Test**
   - Exact command(s) to run the test
   - Alternative methods if applicable

5. **Expected Results**
   - What success looks like
   - Visual indicators
   - Output examples

6. **Test Success Criteria**
   - ✅ Pass conditions (specific, measurable)
   - ❌ Fail conditions (what indicates failure)

7. **Troubleshooting**
   - Common issues
   - Solutions for each issue
   - Debug steps

8. **Expected Test Output** (optional but recommended)
   - Example console output
   - Screenshots if visual verification needed

### Specification vs Implementation

**Important Principle**: When the implementation differs from the spec, the **spec wins**.

- Specifications define **requirements** and **expected behavior**
- Implementations are **how** we achieve those requirements
- If implementation doesn't match spec, fix the implementation
- To change behavior, update the spec first, then implementation

### Creating a New Test Specification

1. **Copy the template:**
   ```bash
   cp tests/TEST-SPEC-TEMPLATE.md tests/YOUR-TEST-NAME.md
   ```

2. **Fill in all sections** - Don't skip any required sections

3. **Use the template as a checklist** - Ensure all sections are complete

4. **Reference existing specs** - See `XHR-SMOKE-TEST.md` for a real example

### Example Reference

See `tests/XHR-SMOKE-TEST.md` for a complete example that follows all conventions.

---

## Diagnostic UI Elements for Testing

This section explains how to use the diagnostic UI elements for automated testing with Playwright or other testing frameworks.

## Diagnostic UI Elements

The extension popup now includes diagnostic elements with `data-testid` attributes that make automated testing easier.

### Available Test IDs

#### Status Elements
- `capture-status-badge` - Shows if capture is active/inactive
  - Attribute: `data-status="active"` or `"inactive"`

- `total-captured` - Total number of captured requests
  - Attribute: `data-count="<number>"`

- `total-filtered` - Total number of filtered requests
  - Attribute: `data-count="<number>"`

- `traffic-count` - Total traffic entries
  - Attribute: `data-count="<number>"`

#### Recent Captures
- `recent-traffic-list` - Container for recent captures (visible when traffic exists)

- `traffic-item-0`, `traffic-item-1`, etc. - Individual traffic items
  - Attributes:
    - `data-type="request"` or `"response"`
    - `data-url="<url>"`
    - `data-method="GET"`, `"POST"`, etc. (for requests)
    - `data-status="200"`, `"201"`, etc. (for responses)

#### Configuration Display
- `config-display` - Diagnostic config section
- `config-enabled` - Shows enabled state (true/false)
- `config-status-codes` - Shows allowed status codes (e.g., "200, 201, 204")
- `config-require-content-type` - Shows requireContentType setting (true/false)
- `config-url-patterns` - Shows configured URL patterns

#### Interactive Elements
- `pattern-input-0`, `pattern-input-1`, etc. - URL pattern input fields
- `remove-pattern-0`, `remove-pattern-1`, etc. - Remove pattern buttons
- `add-pattern-btn` - Add new pattern button
- `save-config-btn` - Save configuration button
  - Attribute: `data-saving="true"` when saving
- `clear-traffic-btn` - Clear all traffic button
- `view-traffic-btn` - Open traffic viewer button

## Test Scenarios

### 1. Verify XHR Capture

```typescript
test('should capture XHR requests', async ({ page }) => {
  // Configure pattern
  await page.getByTestId('pattern-input-0').fill('*://api.example.com/*');
  await page.getByTestId('save-config-btn').click();

  // Make XHR request from test page
  await page.evaluate(() => {
    fetch('https://api.example.com/data');
  });

  // Wait for capture
  await page.waitForTimeout(2000);

  // Verify in recent traffic
  const item = await page.getByTestId('traffic-item-0');
  expect(await item.getAttribute('data-url')).toContain('api.example.com');
});
```

### 2. Verify Status Code Filtering

```typescript
test('should capture specific status codes', async ({ page }) => {
  // Set allowed status codes
  const statusInput = await page.locator('input[placeholder*="200"]');
  await statusInput.fill('200, 201, 204');
  await page.getByTestId('save-config-btn').click();

  // Verify config display
  const display = await page.getByTestId('config-status-codes');
  expect(await display.textContent()).toBe('200, 201, 204');

  // Make requests and verify only allowed codes are captured
  // ... test implementation
});
```

### 3. Verify URL Pattern Matching

```typescript
test('should filter by URL pattern', async ({ page }) => {
  // Set specific pattern
  await page.getByTestId('pattern-input-0').fill('*://api.github.com/*');
  await page.getByTestId('save-config-btn').click();

  // Make requests to matching and non-matching URLs
  await page.evaluate(() => {
    fetch('https://api.github.com/users/test'); // Should capture
    fetch('https://example.com/api'); // Should NOT capture
  });

  await page.waitForTimeout(2000);

  // Verify only matching URLs in recent traffic
  const items = await page.locator('[data-testid^="traffic-item-"]').all();
  for (const item of items) {
    const url = await item.getAttribute('data-url');
    expect(url).toContain('api.github.com');
  }
});
```

### 4. Verify Multiple Patterns

```typescript
test('should handle multiple patterns', async ({ page }) => {
  // Add second pattern
  await page.getByTestId('add-pattern-btn').click();

  await page.getByTestId('pattern-input-0').fill('*://api.github.com/*');
  await page.getByTestId('pattern-input-1').fill('*://api.example.com/*');

  await page.getByTestId('save-config-btn').click();

  // Verify both patterns in config display
  const patterns = await page.getByTestId('config-url-patterns');
  const text = await patterns.textContent();
  expect(text).toContain('api.github.com');
  expect(text).toContain('api.example.com');
});
```

### 5. Test Specific Request Types

```typescript
test('should capture different request types', async ({ page }) => {
  // Configure extension
  await page.getByTestId('pattern-input-0').fill('*://*/*');
  await page.getByTestId('save-config-btn').click();

  // Make different types of requests
  await page.evaluate(async () => {
    // XHR
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.example.com/xhr');
    xhr.send();

    // Fetch
    await fetch('https://api.example.com/fetch');

    // Fetch with POST
    await fetch('https://api.example.com/post', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
    });
  });

  await page.waitForTimeout(3000);

  // Verify all were captured
  const items = await page.locator('[data-testid^="traffic-item-"]').all();
  expect(items.length).toBeGreaterThan(0);

  // Check for both requests and responses
  const types = await Promise.all(
    items.map(item => item.getAttribute('data-type'))
  );
  expect(types).toContain('request');
  expect(types).toContain('response');
});
```

## Running Tests

### Setup

1. Install Playwright:
```bash
pnpm add -D @playwright/test playwright
```

2. Install Firefox browser:
```bash
pnpx playwright install firefox
```

3. Build the extension:
```bash
pnpm build
```

### Running Tests

For extension testing, you'll need to use `web-ext` or manually load the extension:

```bash
# Using web-ext for automated testing
pnpm test:auto

# Or use Playwright with extension pre-loaded
pnpx playwright test tests/playwright-example.spec.ts
```

## Tips for Testing

1. **Wait for captures**: Always add a delay after making requests to allow the extension to capture and process them:
   ```typescript
   await page.waitForTimeout(2000);
   ```

2. **Check data attributes**: Use `data-*` attributes instead of text content for more reliable assertions:
   ```typescript
   const count = await page.getByTestId('traffic-count').getAttribute('data-count');
   expect(parseInt(count)).toBeGreaterThan(0);
   ```

3. **Verify config before tests**: Always verify the config is correct before running capture tests:
   ```typescript
   const statusCodes = await page.getByTestId('config-status-codes').textContent();
   expect(statusCodes).toBe('200, 201, 204');
   ```

4. **Clear traffic between tests**: Start with a clean slate:
   ```typescript
   await page.getByTestId('clear-traffic-btn').click();
   await page.waitForTimeout(500);
   ```

5. **Use recent traffic list**: The recent traffic list shows the last 10 captures with all the details you need for verification.

## Example Test Page

Create a test HTML page that makes various types of requests:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Extension Test Page</title>
</head>
<body>
  <h1>Network Traffic Test Page</h1>
  <button id="makeRequests">Make Test Requests</button>

  <script>
    document.getElementById('makeRequests').addEventListener('click', async () => {
      // XHR GET
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1');
      xhr.send();

      // Fetch GET
      await fetch('https://jsonplaceholder.typicode.com/users/1');

      // Fetch POST (creates 201 response)
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', body: 'Test body', userId: 1 })
      });

      // Fetch DELETE (creates 200 or 204 response)
      await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'DELETE'
      });
    });
  </script>
</body>
</html>
```

Load this page in Firefox with the extension, click the button, and check the extension popup to see the captures.
