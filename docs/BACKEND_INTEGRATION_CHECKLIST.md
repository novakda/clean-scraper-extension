# Backend Integration Checklist

## For the TypeScript/Backend Agent

The Frontend/UI implementation is complete. To integrate with the UI, the backend agent needs to implement the following:

## 1. Import Shared Types

```typescript
// In your background.ts or request-capture.ts
import type {
  CapturedRequest,
  CapturedResponse,
  CapturedEntry,
  BackgroundMessage,
  BackgroundResponse
} from '@/lib/types/request-capture';
```

These types are already defined in `C:\main\my-clean-extension\lib\types\request-capture.ts`

## 2. Create In-Memory Storage

```typescript
// Store captured requests in memory
const capturedRequests: CapturedEntry[] = [];
```

## 3. Implement Message Handlers

### Required Handler 1: GET_CAPTURED_REQUESTS

```typescript
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CAPTURED_REQUESTS') {
    sendResponse({
      success: true,
      data: capturedRequests
    } as BackgroundResponse<CapturedEntry[]>);
    return true; // Keep channel open for async response
  }
});
```

### Required Handler 2: CLEAR_CAPTURED_REQUESTS

```typescript
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLEAR_CAPTURED_REQUESTS') {
    capturedRequests.length = 0; // Clear the array
    sendResponse({
      success: true
    } as BackgroundResponse<void>);
    return true;
  }
});
```

### Error Handling Template

```typescript
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.type === 'GET_CAPTURED_REQUESTS') {
      // ... handle request
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as BackgroundResponse);
  }
  return true;
});
```

## 4. Implement StreamFilter Request Capture

### Basic Structure

```typescript
// Listen for HTTP requests
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const requestData: Partial<CapturedRequest> = {
      id: crypto.randomUUID(),
      url: details.url,
      method: details.method,
      timestamp: Date.now(),
      requestBody: details.requestBody ? JSON.stringify(details.requestBody) : null
    };

    // Store for later matching with response
    pendingRequests.set(details.requestId, requestData);
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

// Listen for HTTP responses
browser.webRequest.onCompleted.addListener(
  (details) => {
    const request = pendingRequests.get(details.requestId);
    if (!request) return;

    const entry: CapturedEntry = {
      request: {
        ...request as CapturedRequest,
        headers: parseHeaders(details.requestHeaders)
      },
      response: {
        status: details.statusCode,
        statusText: details.statusLine,
        headers: parseHeaders(details.responseHeaders),
        responseBody: null, // Need StreamFilter for body
        timestamp: Date.now()
      },
      metadata: {
        duration: Date.now() - request.timestamp!,
        size: 0 // Calculate from response
      }
    };

    capturedRequests.push(entry);
    pendingRequests.delete(details.requestId);
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);
```

## 5. Data Format Requirements

### CapturedRequest Format
```typescript
{
  id: string,              // Use crypto.randomUUID()
  url: string,             // Full URL
  method: string,          // "GET", "POST", etc.
  headers: {               // Object, not array
    "content-type": "application/json",
    "authorization": "Bearer ..."
  },
  requestBody: string | null,  // JSON string or null
  timestamp: number        // Date.now() in milliseconds
}
```

### CapturedResponse Format
```typescript
{
  status: number,          // 200, 404, etc.
  statusText: string,      // "OK", "Not Found", etc.
  headers: {               // Object, not array
    "content-type": "application/json",
    "content-length": "1234"
  },
  responseBody: string | null,  // JSON string or null
  timestamp: number        // Date.now() in milliseconds
}
```

### CapturedEntry Format
```typescript
{
  request: CapturedRequest,
  response: CapturedResponse,
  metadata: {
    duration: number,      // Response time in milliseconds
    size: number          // Response size in bytes
  }
}
```

## 6. Testing Integration

### Step 1: Test Message Handlers
1. Run `pnpm dev`
2. Open extension popup
3. Click "Refresh" button
4. Should receive empty array if no requests captured
5. Should not show errors

### Step 2: Test with Mock Data
Add some mock data to test UI:
```typescript
// Temporary test data
capturedRequests.push({
  request: {
    id: crypto.randomUUID(),
    url: 'https://api.example.com/test',
    method: 'GET',
    headers: { 'accept': 'application/json' },
    requestBody: null,
    timestamp: Date.now() - 5000
  },
  response: {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    responseBody: '{"message": "Hello World"}',
    timestamp: Date.now() - 4800
  },
  metadata: {
    duration: 200,
    size: 27
  }
});
```

### Step 3: Test Real Capture
1. Implement StreamFilter or webRequest capture
2. Navigate to a website
3. Click "Refresh" in popup
4. Should see captured requests appear
5. Click on a request to see details

### Step 4: Test Clear
1. Click "Clear All" button
2. Confirm dialog
3. All requests should disappear
4. Empty state should appear

## 7. Common Issues and Solutions

### Issue: "Unknown message type" error
**Solution**: Make sure message handler checks for `message.type` correctly

### Issue: No requests showing up
**Solution**: Check that capturedRequests array is being populated and message handler is returning it

### Issue: Type errors
**Solution**: Import types from `@/lib/types/request-capture.ts`, don't redefine them

### Issue: Requests showing but no response data
**Solution**: Make sure response capture is working and matching with requests by requestId

### Issue: JSON parsing errors in UI
**Solution**: Ensure request/response bodies are stored as strings, not objects

## 8. Optional Enhancements

### Enhancement 1: Request Limit
```typescript
// Prevent memory issues with too many requests
const MAX_REQUESTS = 1000;
if (capturedRequests.length > MAX_REQUESTS) {
  capturedRequests.shift(); // Remove oldest
}
```

### Enhancement 2: Stats Handler
```typescript
if (message.type === 'GET_STATS') {
  const stats = {
    totalRequests: capturedRequests.length,
    totalSize: capturedRequests.reduce((sum, r) => sum + r.metadata.size, 0),
    averageDuration: capturedRequests.reduce((sum, r) => sum + r.metadata.duration, 0) / capturedRequests.length
  };
  sendResponse({
    success: true,
    data: stats
  });
  return true;
}
```

## 9. File Locations Reference

### Frontend Files (Already Complete)
- `C:\main\my-clean-extension\lib\types\request-capture.ts` - Types
- `C:\main\my-clean-extension\components\RequestList.vue` - List component
- `C:\main\my-clean-extension\components\RequestDetail.vue` - Detail component
- `C:\main\my-clean-extension\components\RequestFilter.vue` - Filter component
- `C:\main\my-clean-extension\entrypoints\popup\App.vue` - Main popup

### Backend Files (To Be Implemented)
- `C:\main\my-clean-extension\entrypoints\background.ts` - Message handlers
- `C:\main\my-clean-extension\lib\request-capture.ts` - Capture logic (optional)

## 10. Verification Checklist

- [ ] Import types from `@/lib/types/request-capture.ts`
- [ ] Create `capturedRequests: CapturedEntry[]` array
- [ ] Implement GET_CAPTURED_REQUESTS handler
- [ ] Implement CLEAR_CAPTURED_REQUESTS handler
- [ ] Implement request capture logic
- [ ] Match requests with responses
- [ ] Populate metadata (duration, size)
- [ ] Test with popup UI
- [ ] Verify filtering works
- [ ] Verify detail view displays correctly
- [ ] Verify clear functionality works
- [ ] Handle errors gracefully

## Need Help?

Refer to these documentation files:
- `docs/UI_IMPLEMENTATION.md` - Complete UI documentation
- `docs/FRONTEND_SUMMARY.md` - Implementation summary
- `docs/UI_LAYOUT.txt` - Visual layout reference

The frontend is fully functional and waiting for backend integration. All types are defined and ready to use. Good luck!
