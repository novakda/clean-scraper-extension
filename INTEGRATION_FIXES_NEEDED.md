# Integration Fixes Needed - Feature-004

## Overview
The backend and frontend implementations are complete but use slightly different data structures. This document outlines the remaining compatibility fixes needed.

## Type Structure Differences

### Backend (`lib/request-capture.ts`)
```typescript
interface CapturedEntry {
  id: string;
  request: CapturedRequest;
  response?: CapturedResponse;  // Optional!
  status: 'pending' | 'completed' | 'error';
  error?: string;
  createdAt: number;
  updatedAt: number;
}
```

### UI Expected (from frontend agent)
```typescript
interface CapturedEntry {
  request: CapturedRequest;
  response: CapturedResponse;  // Required!
  metadata: {
    duration: number;
    size: number;
  }
}
```

## Fixes Applied

### ✅ RequestList.vue
- Fixed import path from `@/lib/types/request-capture` to `@/lib/request-capture`
- Added helper functions `getDuration()` and `getStatus()` to compute from backend data
- Updated template to handle optional response

### ⚠️ RequestDetail.vue
**Status**: Partially fixed by backend agent (changed import), needs additional null checks

**Required fixes**:
1. Add null checks for `entry.response` before accessing properties
2. Compute duration: `entry.response.timestamp - entry.request.timestamp`
3. Compute size: `entry.response.responseBody?.length ?? 0`
4. Wrap response access in `v-if="entry.response"` or use optional chaining

**Example fix needed**:
```vue
<!-- Before -->
<span>{{ entry.response.status }}</span>

<!-- After -->
<span v-if="entry.response">{{ entry.response.status }}</span>
<!-- OR -->
<span>{{ entry.response?.status ?? '-' }}</span>
```

### ✅ RequestFilter.vue
- Fixed: Moved RequestFilters interface inline (UI-specific, not in backend types)

### ✅ App.vue
- Fixed import path
- Added inline definitions for RequestFilters and BackgroundResponse interfaces

## Recommended Approach

### Option 1: Update UI to Match Backend (Recommended)
**Pros**: Backend types are more robust (handle pending states, errors)
**Cons**: More UI changes needed

**Tasks**:
1. Update RequestDetail.vue to compute metadata dynamically
2. Add null checks throughout UI for optional response
3. Handle different entry statuses (pending, completed, error)

### Option 2: Update Backend to Match UI
**Pros**: Minimal UI changes
**Cons**: Lose error handling and pending states

**Tasks**:
1. Change backend CapturedEntry to always have response (or use placeholder)
2. Add metadata property to CapturedEntry
3. Remove status/error fields

## Testing After Fixes

1. Run TypeScript compilation:
   ```bash
   pnpm compile
   ```

2. Build the extension:
   ```bash
   pnpm build:firefox
   ```

3. Load in Firefox and test:
   - Open popup
   - Navigate to websites
   - Verify requests appear
   - Click request to see details
   - Test filters

## Files That Need Attention

1. `components/RequestDetail.vue` - Add null checks for response
2. `entrypoints/background.ts` - Ensure message handlers return correct format
3. Integration testing between UI and background script

## Type Compatibility Checklist

- [x] Import paths corrected
- [x] RequestList handles optional response
- [ ] RequestDetail handles optional response
- [x] UI-specific types defined inline
- [ ] Background message handlers tested with UI
- [ ] End-to-end integration tested

## Next Steps

1. Complete RequestDetail.vue null safety updates
2. Run TypeScript compilation to verify
3. Test end-to-end integration
4. Consider adding loading/error states in UI for pending captures
