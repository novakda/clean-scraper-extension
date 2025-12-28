# Feature-004: Ready for Testing 🚀

## Quick Start

```bash
# Start Firefox with extension loaded
pnpm dev:firefox
```

The extension will automatically:
1. Build the extension
2. Launch Firefox with the extension installed
3. Open the extension popup

## What to Test

### 1. Basic Request Capture (2 minutes)
1. With Firefox open, navigate to any website (e.g., https://example.com)
2. Click the extension icon to open the popup
3. Click "Refresh" button
4. **Expected:** See captured HTTP requests in the list

### 2. Request Details (1 minute)
1. Click on any request in the list
2. **Expected:** Detail panel opens on the right showing:
   - URL, method, status code
   - Duration in milliseconds
   - Response size in bytes
   - Request and response headers
   - Request and response bodies (if present)

### 3. Filtering (1 minute)
1. Type a URL pattern in the filter box
2. **Expected:** Only matching requests shown
3. Select a method from the dropdown
4. **Expected:** Only requests with that method shown
5. Click "Clear Filters"
6. **Expected:** All requests shown again

### 4. Auto-Refresh (30 seconds)
1. Click the play button (▶)
2. Navigate to a new website
3. **Expected:** Requests automatically appear every 2 seconds

### 5. Clear All (30 seconds)
1. Click "Clear All" button
2. Confirm the dialog
3. **Expected:** All requests removed, empty state shown

## Known Issues to Watch For

### May Need Fixing
- [ ] StreamFilter might not capture all request types
- [ ] Large response bodies might cause performance issues
- [ ] Some requests might show "Pending" status indefinitely

### By Design (Not Bugs)
- Only works in Firefox (StreamFilter API is Firefox-only)
- Requests cleared when extension reloads
- Maximum 100 requests stored (older ones auto-deleted)
- Binary content not captured (images, videos, etc.)

## Success Criteria

The feature is considered working if:
- [x] ✅ Extension loads in Firefox without errors
- [ ] Requests appear in the list after browsing
- [ ] Details panel shows request/response information
- [ ] Filters work correctly
- [ ] No console errors in background script or popup
- [ ] UI is responsive and doesn't lag

## Troubleshooting

### No requests appearing
**Check:**
1. Open Firefox DevTools (F12)
2. Go to "Console" tab
3. Look for errors
4. Check background script console: `about:debugging#/runtime/this-firefox`

### UI not loading
**Check:**
1. Run `pnpm compile` to verify TypeScript
2. Run `pnpm build:firefox` to rebuild
3. Check browser console for errors

### Permission errors
**Check:**
1. Manifest has correct permissions (webRequest, webRequestBlocking, host_permissions)
2. Extension has been granted permissions by Firefox

## Files Changed Summary

### Backend (lib/)
- `request-capture.ts` - Data models
- `config.ts` - Configuration
- `stream-filter.ts` - StreamFilter wrapper
- `storage.ts` - In-memory storage

### Frontend (components/, entrypoints/popup/)
- `RequestList.vue` - Request table
- `RequestDetail.vue` - Detail panel
- `RequestFilter.vue` - Filters
- `App.vue` - Main popup

### Configuration
- `wxt.config.ts` - Added Firefox permissions
- `entrypoints/background.ts` - StreamFilter integration

## Next Steps After Testing

### If Tests Pass ✅
1. Run `/harness-checkpoint` to commit and create PR
2. Merge to main
3. Consider additional features:
   - Export to HAR format
   - Request replay
   - Better JSON formatting

### If Tests Fail ❌
1. Document the issue
2. Check console for errors
3. Review relevant code files
4. Fix and rebuild
5. Test again

## Support Files

- `INTEGRATION_COMPLETE.md` - Detailed integration status
- `INTEGRATION_FIXES_NEEDED.md` - Original issues (all resolved)
- `docs/UI_IMPLEMENTATION.md` - Complete UI documentation
- `docs/FRONTEND_SUMMARY.md` - Implementation details

---

**Status:** All code complete, TypeScript passing, build successful
**Next:** Manual testing in Firefox
**Time:** ~5 minutes to verify basic functionality
