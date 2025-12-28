# HTTP Request Capture UI Implementation

## Overview
This document describes the Vue 3 frontend implementation for displaying captured HTTP request/response data in the browser extension popup.

## Architecture

### Component Structure
```
entrypoints/popup/
  App.vue                    - Main popup component with state management
  main.ts                    - Vue app bootstrap
  style.css                  - Global styles

components/
  RequestList.vue            - Table view of all captured requests
  RequestDetail.vue          - Detailed view of selected request/response
  RequestFilter.vue          - Filter controls for requests

lib/types/
  request-capture.ts         - TypeScript type definitions (shared with backend)
```

## Type Definitions

### Core Types (`lib/types/request-capture.ts`)

**CapturedRequest**
- `id: string` - Unique identifier for the request
- `url: string` - Full request URL
- `method: string` - HTTP method (GET, POST, etc.)
- `headers: Record<string, string>` - Request headers
- `requestBody?: string | null` - Optional request body
- `timestamp: number` - Request timestamp in milliseconds

**CapturedResponse**
- `status: number` - HTTP status code
- `statusText: string` - Status text description
- `headers: Record<string, string>` - Response headers
- `responseBody?: string | null` - Optional response body
- `timestamp: number` - Response timestamp in milliseconds

**CapturedEntry**
- `request: CapturedRequest` - Request data
- `response: CapturedResponse` - Response data
- `metadata: { duration: number, size: number }` - Computed metadata

**RequestFilters**
- `urlPattern: string` - URL filter text
- `method: string` - HTTP method filter
- `statusCode: string` - Status code filter

## Components

### 1. RequestList.vue

**Purpose**: Display a scrollable table of all captured HTTP requests.

**Props**:
- `requests: CapturedEntry[]` - Array of captured requests to display
- `selectedId?: string` - ID of currently selected request (for highlighting)

**Emits**:
- `select: (entry: CapturedEntry) => void` - Emitted when user clicks a request row

**Features**:
- Color-coded HTTP methods (GET=blue, POST=green, PUT=orange, DELETE=red, etc.)
- Color-coded status codes (2xx=green, 3xx=blue, 4xx=orange, 5xx=red)
- Displays: Method, URL, Status, Time, Duration
- Empty state when no requests captured
- Hoverable and clickable rows
- Selected row highlighting

### 2. RequestDetail.vue

**Purpose**: Show detailed information about a selected request/response pair.

**Props**:
- `entry: CapturedEntry | null` - The selected entry to display details for

**Emits**:
- `close: () => void` - Emitted when user clicks the close button

**Features**:
- Tabbed interface (Request tab / Response tab)
- Request tab shows:
  - URL, method, status, duration, size metadata
  - Request headers (key-value pairs)
  - Request body (formatted JSON if applicable)
  - Copy button to copy request data to clipboard
- Response tab shows:
  - Response headers (key-value pairs)
  - Response body (formatted JSON if applicable)
  - Copy button to copy response data to clipboard
- Auto-formats JSON bodies with indentation
- Monospace font for code/data display
- Close button to hide detail panel

### 3. RequestFilter.vue

**Purpose**: Provide filtering controls for the request list.

**Emits**:
- `update: (filters: RequestFilters) => void` - Emitted whenever any filter changes

**Features**:
- URL pattern text input (case-insensitive substring match)
- HTTP method dropdown (All, GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
- Status code text input (exact match)
- Clear filters button
- Auto-emits filter updates on change (reactive)

### 4. App.vue (Main Popup)

**Purpose**: Main entry point that orchestrates all components and manages state.

**State**:
- `capturedRequests: Ref<CapturedEntry[]>` - All captured requests from backend
- `selectedRequest: Ref<CapturedEntry | null>` - Currently selected request for detail view
- `filters: Ref<RequestFilters>` - Active filter criteria
- `isLoading: Ref<boolean>` - Loading state for async operations
- `error: Ref<string | null>` - Error message display
- `autoRefresh: Ref<boolean>` - Auto-refresh toggle state

**Computed**:
- `filteredRequests` - Applies filters to `capturedRequests` array

**Methods**:
- `fetchRequests()` - Fetches captured requests from background script
- `clearRequests()` - Sends clear command to background script
- `toggleAutoRefresh()` - Toggles auto-refresh (2-second interval)

**Message Passing**:
Uses `browser.runtime.sendMessage()` to communicate with background script:

```typescript
// Fetch requests
await browser.runtime.sendMessage({
  type: 'GET_CAPTURED_REQUESTS'
}) as BackgroundResponse<CapturedEntry[]>;

// Clear requests
await browser.runtime.sendMessage({
  type: 'CLEAR_CAPTURED_REQUESTS'
}) as BackgroundResponse<void>;
```

**Layout**:
- Fixed size: 800px × 600px
- Header: Title + Action buttons (Auto-refresh, Refresh, Clear All)
- Filter bar: RequestFilter component
- Content area (split):
  - Left panel: Request list (flexible width)
  - Right panel: Request detail (400px, shown when request selected)

## Styling

### Design System

**Colors**:
- HTTP Methods:
  - GET: Blue (#2196f3)
  - POST: Green (#4caf50)
  - PUT: Orange (#ff9800)
  - DELETE: Red (#f44336)
  - PATCH: Purple (#9c27b0)
  - Other: Gray (#9e9e9e)

- Status Codes:
  - 2xx Success: Green (#4caf50)
  - 3xx Redirect: Blue (#2196f3)
  - 4xx Client Error: Orange (#ff9800)
  - 5xx Server Error: Red (#f44336)

**Typography**:
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto...`
- Monospace for code: `'Courier New', Courier, monospace`
- Base size: 0.875rem for UI, 0.75rem for data

**Theme**:
- Dark mode primary (default)
- Light mode support via `prefers-color-scheme: light`
- Custom scrollbar styling (webkit)

### Responsive Considerations
- Fixed popup size (800×600px) for consistent extension experience
- Flexible grid layout for request list
- Scrollable areas for long request lists and detail content

## Testing Instructions

### Prerequisites
1. Backend agent must complete their implementation:
   - `lib/request-capture.ts` with data models
   - `entrypoints/background.ts` with message handlers
   - StreamFilter integration for actual request capture

### Manual Testing Steps

#### 1. Build and Load Extension
```bash
pnpm dev              # For Chrome
pnpm dev:firefox      # For Firefox
```

#### 2. Test Empty State
- Open extension popup
- Should see: "No HTTP requests captured yet" message
- Should see: "Start browsing to capture requests" hint
- All buttons should be properly styled

#### 3. Test Request List
- Navigate to any website with HTTP requests
- Click "Refresh" button in popup
- Should see requests populate in the list
- Verify columns display correctly:
  - Method badges with correct colors
  - Full URLs (truncated with ellipsis)
  - Status codes with correct colors
  - Timestamps in local time format
  - Duration in ms or seconds

#### 4. Test Filtering
- Enter URL pattern (e.g., "google")
  - Should filter requests containing "google" in URL
- Select HTTP method (e.g., "POST")
  - Should show only POST requests
- Enter status code (e.g., "200")
  - Should show only 200 status requests
- Click "Clear Filters"
  - Should reset all filters and show all requests

#### 5. Test Request Selection
- Click on a request row
  - Row should highlight
  - Detail panel should appear on the right
  - Should show request metadata

#### 6. Test Request Details
- In detail view, verify "Request" tab:
  - Headers list displayed correctly
  - Request body formatted (if present)
  - "Copy Request" button works
- Switch to "Response" tab:
  - Headers list displayed correctly
  - Response body formatted (if present)
  - "Copy Response" button works
- Click close button (×)
  - Detail panel should hide

#### 7. Test Auto-Refresh
- Click play button (▶)
  - Should change to pause (⏸)
  - Button color should change to green
  - Requests should auto-refresh every 2 seconds
- Click pause button (⏸)
  - Should stop auto-refresh
  - Button should return to blue

#### 8. Test Clear All
- Click "Clear All" button
  - Should show confirmation dialog
- Confirm clear
  - All requests should be removed
  - Empty state should appear
  - Selected request should be cleared

#### 9. Test Error Handling
- With backend not implemented:
  - Should gracefully show empty state (no error)
- If backend returns error:
  - Error banner should appear at top
  - Error message should be displayed
  - Can dismiss error by clicking ×

#### 10. Test Loading States
- During fetch operations:
  - "Refresh" button should show "Loading..."
  - Button should be disabled
- After completion:
  - Button should return to "Refresh"
  - Button should be re-enabled

### TypeScript Validation
```bash
pnpm compile          # Run type checking
```

Should compile without errors. All components use proper TypeScript typing.

### Browser Compatibility
- **Chrome**: Full support (Manifest V3)
- **Firefox**: Full support (Manifest V2/V3)
  - Note: StreamFilter API is Firefox-only
  - Chrome version will need alternative capture method

## Known Limitations

1. **JSON Formatting**: Only formats valid JSON bodies. Non-JSON content displays as-is.

2. **Large Payloads**: Very large request/response bodies may cause performance issues in the popup.

3. **Popup Size**: Fixed at 800×600px. Not responsive to window resizing (by design for extension popups).

4. **Copy Functionality**: Requires clipboard permissions (already included in manifest).

5. **Persistence**: Popup state resets when closed. Data persists in background script only.

## Future Improvements

1. **Export Functionality**: Add button to export requests as HAR file or JSON.

2. **Search**: Add full-text search across all request/response data.

3. **Syntax Highlighting**: Better syntax highlighting for JSON/XML/HTML bodies.

4. **Request Replay**: Add ability to replay/edit and resend requests.

5. **Performance**: Virtual scrolling for very large request lists.

6. **Tabs Integration**: Filter requests by browser tab.

7. **Persistence Options**: Save/load request collections.

8. **Theming**: User-selectable color themes.

## Integration with Backend

The UI expects the background script to respond to these messages:

### GET_CAPTURED_REQUESTS
```typescript
// Request
{ type: 'GET_CAPTURED_REQUESTS' }

// Expected Response
{
  success: true,
  data: CapturedEntry[]
}
```

### CLEAR_CAPTURED_REQUESTS
```typescript
// Request
{ type: 'CLEAR_CAPTURED_REQUESTS' }

// Expected Response
{
  success: true
}
```

### Error Response Format
```typescript
{
  success: false,
  error: string
}
```

## File Sizes
- `App.vue`: ~350 lines
- `RequestList.vue`: ~252 lines
- `RequestDetail.vue`: ~344 lines
- `RequestFilter.vue`: ~117 lines
- `request-capture.ts`: ~43 lines
- Total: ~1,106 lines of Vue/TS code

## Dependencies
All dependencies are already in the project:
- Vue 3.5.26
- TypeScript 5.9.3
- WXT 0.20.13
- No additional npm packages required
