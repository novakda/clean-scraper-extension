import { attachStreamFilter, isStreamFilterAvailable, getStreamFilterStatus } from '../lib/stream-filter';
import { getWebRequestFilter, getConfig } from '../lib/config';
import {
  createCapturedRequest,
  createCapturedEntry,
  createCapturedResponse,
  parseHeaders,
  type CapturedEntry,
} from '../lib/request-capture';
import * as storage from '../lib/storage';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Track request details by requestId for correlation
  const pendingRequests = new Map<string, { entryId: string; contentType?: string }>();

  // Listen for extension installation
  browser.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details.reason);
    if (details.reason === 'install') {
      console.log('First time installation!');
      console.log('StreamFilter status:', getStreamFilterStatus());
    }
  });

  // Check if StreamFilter is available
  if (!isStreamFilterAvailable()) {
    console.error('StreamFilter API not available - this feature requires Firefox!');
  } else {
    console.log('StreamFilter API available - initializing request capture');

    // Listen for requests (captures request metadata)
    browser.webRequest.onBeforeRequest.addListener(
      (details): undefined => {
        try {
          console.log(`[onBeforeRequest] ${details.method} ${details.url}`);

          // Create captured request
          const capturedRequest = createCapturedRequest(details);
          const entry = createCapturedEntry(capturedRequest);

          // Store entry
          storage.addEntry(entry);

          // Track for correlation with response
          pendingRequests.set(details.requestId, {
            entryId: entry.id,
          });

          console.log(`[Capture] Created entry ${entry.id} for request ${details.requestId}`);
        } catch (error) {
          console.error('[onBeforeRequest] Error:', error);
        }

        return undefined; // Return undefined for non-blocking
      },
      getWebRequestFilter(),
      ['requestBody']
    );

    // Capture request headers
    browser.webRequest.onSendHeaders.addListener(
      (details) => {
        try {
          const pending = pendingRequests.get(details.requestId);
          if (!pending) return;

          const headers = parseHeaders(details.requestHeaders);

          // Update entry with request headers
          const entry = storage.getById(pending.entryId);
          if (entry) {
            storage.updateEntry(pending.entryId, {
              request: {
                ...entry.request,
                headers,
              },
            });
          }

          console.log(`[onSendHeaders] Updated headers for entry ${pending.entryId}`);
        } catch (error) {
          console.error('[onSendHeaders] Error:', error);
        }
      },
      getWebRequestFilter(),
      ['requestHeaders']
    );

    // Capture response headers and attach StreamFilter
    browser.webRequest.onHeadersReceived.addListener(
      (details): undefined => {
        try {
          const pending = pendingRequests.get(details.requestId);
          if (!pending) return undefined;

          const responseHeaders = parseHeaders(details.responseHeaders);
          const contentType = responseHeaders['content-type'];

          // Store content type for StreamFilter
          pending.contentType = contentType;

          console.log(`[onHeadersReceived] ${details.statusCode} ${details.url} (${contentType})`);

          // Attach StreamFilter to capture response body
          attachStreamFilter(
            details.requestId,
            {
              requestId: pending.entryId,
              contentType,
            },
            (result) => {
              // Success - create response and update entry
              const response = createCapturedResponse(
                details.statusCode,
                details.statusLine,
                responseHeaders,
                result.body
              );

              storage.addResponse(pending.entryId, response);
              console.log(`[Capture] Completed entry ${pending.entryId}: ${result.size} bytes${result.truncated ? ' (truncated)' : ''}`);

              // Cleanup
              pendingRequests.delete(details.requestId);
            },
            (error) => {
              // Error - mark entry as failed
              storage.markAsError(pending.entryId, error);
              console.error(`[Capture] Failed entry ${pending.entryId}:`, error);

              // Cleanup
              pendingRequests.delete(details.requestId);
            }
          );
        } catch (error) {
          console.error('[onHeadersReceived] Error:', error);

          // Mark as error if we have the entry
          const pending = pendingRequests.get(details.requestId);
          if (pending) {
            storage.markAsError(pending.entryId, `Error attaching filter: ${error}`);
            pendingRequests.delete(details.requestId);
          }
        }

        return undefined; // Return undefined for non-blocking
      },
      getWebRequestFilter(),
      ['responseHeaders']
    );

    // Cleanup on request completion
    browser.webRequest.onCompleted.addListener(
      (details) => {
        // Remove from pending (if not already removed by StreamFilter)
        pendingRequests.delete(details.requestId);
      },
      getWebRequestFilter()
    );

    // Cleanup on request error
    browser.webRequest.onErrorOccurred.addListener(
      (details) => {
        const pending = pendingRequests.get(details.requestId);
        if (pending) {
          storage.markAsError(pending.entryId, `Request error: ${details.error}`);
          pendingRequests.delete(details.requestId);
        }
      },
      getWebRequestFilter()
    );

    console.log('Request capture initialized successfully');
  }

  // Listen for messages from popup or content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);

    // Handle different message types
    switch (message.type) {
      case 'GET_CAPTURED_REQUESTS': {
        const entries = storage.getAll();
        sendResponse({
          success: true,
          data: entries,
          count: entries.length,
        });
        break;
      }

      case 'CLEAR_CAPTURED_REQUESTS': {
        storage.clear();
        sendResponse({
          success: true,
          message: 'Captured requests cleared',
        });
        break;
      }

      case 'GET_STATS': {
        const stats = storage.getStats();
        const sizeInfo = storage.getSizeInfo();
        const memoryUsage = storage.getMemoryUsage();

        sendResponse({
          success: true,
          data: {
            ...stats,
            storage: sizeInfo,
            memoryUsage,
          },
        });
        break;
      }

      case 'GET_REQUEST_BY_ID': {
        const { id } = message;
        const entry = storage.getById(id);

        if (entry) {
          sendResponse({
            success: true,
            data: entry,
          });
        } else {
          sendResponse({
            success: false,
            error: `Request ${id} not found`,
          });
        }
        break;
      }

      case 'FILTER_REQUESTS': {
        const { urlPattern, method, status, statusCode } = message;
        let results = storage.getAll();

        if (urlPattern) {
          results = results.filter(e => e.request.url.includes(urlPattern));
        }
        if (method) {
          results = results.filter(e => e.request.method === method);
        }
        if (status) {
          results = results.filter(e => e.status === status);
        }
        if (statusCode !== undefined) {
          results = results.filter(e => e.response?.status === statusCode);
        }

        sendResponse({
          success: true,
          data: results,
          count: results.length,
        });
        break;
      }

      case 'GET_CONFIG': {
        const config = getConfig();
        sendResponse({
          success: true,
          data: config,
        });
        break;
      }

      case 'PING': {
        sendResponse({
          success: true,
          message: 'pong',
          streamFilterAvailable: isStreamFilterAvailable(),
        });
        break;
      }

      default: {
        sendResponse({
          success: false,
          error: `Unknown message type: ${message.type}`,
        });
      }
    }

    return true; // Keep the message channel open for async response
  });

  console.log('Background service worker initialized successfully!');
});
