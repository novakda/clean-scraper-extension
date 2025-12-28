import * as db from './db';
import * as config from './config';
import type { PendingRequest } from './types';
import { Logger } from './logger';

const logger = new Logger('StreamFilter');

function getStatusCodeReason(code: number): string {
  if (code >= 300 && code < 400) return 'Redirect response';
  if (code === 204) return 'No Content response';
  if (code >= 400 && code < 500) return 'Client error';
  if (code >= 500) return 'Server error';
  return 'Non-standard success code';
}

export function initStreamFilterCapture(
  pendingRequests: Map<string, PendingRequest>
): void {
  // Check if filterResponseData is available (Firefox only)
  if (!browser.webRequest.filterResponseData) {
    console.warn('StreamFilter API not available (Firefox only)');
    return;
  }

  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      // Allow background requests (tabId can be -1 for extension/background requests)
      if (details.tabId === undefined || details.tabId === null) return undefined;

      (async () => {
        const shouldCapture = await config.shouldCapture(details.url);
        if (!shouldCapture) return;

        pendingRequests.set(details.requestId, {
          type: 'request',
          url: details.url,
          method: details.method,
          postData: details.requestBody?.raw || null,
          timestamp: Date.now(),
          requestId: details.requestId,
          tabId: details.tabId
        });
      })();

      return undefined;
    },
    {
      urls: ['<all_urls>'],
      types: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'other']
    },
    ['requestBody']
  );

  browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      // Allow background requests (tabId can be -1 for extension/background requests)
      if (details.tabId === undefined || details.tabId === null) return undefined;

      const requestData = pendingRequests.get(details.requestId);
      if (!requestData) return undefined;

      (async () => {
        await db.addTrafficData({
          ...requestData,
          headers: details.requestHeaders
        });
        pendingRequests.delete(details.requestId);
      })();

      return undefined;
    },
    {
      urls: ['<all_urls>'],
      types: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'other']
    },
    ['requestHeaders']
  );

  browser.webRequest.onHeadersReceived.addListener(
    (details) => {
      // CRITICAL: Cannot use async/await before creating filter!
      // Filter MUST be created synchronously before listener returns

      // Synchronous pre-flight checks
      // Allow background requests (tabId can be -1 for extension/background requests)
      if (details.tabId === undefined || details.tabId === null) return undefined;
      if (!details.statusCode) return undefined;

      // Skip extension's own requests
      if (details.url.startsWith('moz-extension://') ||
          details.url.startsWith('chrome-extension://')) {
        return undefined;
      }

      // Skip Firefox's internal requests
      const firefoxInternalDomains = [
        'safebrowsing.googleapis.com',
        'safebrowsing-cache.google.com',
        'shavar.services.mozilla.com',
        'tracking-protection.cdn.mozilla.net',
        'firefox.settings.services.mozilla.com'
      ];

      if (firefoxInternalDomains.some(domain => details.url.includes(domain))) {
        return undefined;
      }

      // CRITICAL: Must create filter SYNCHRONOUSLY
      try {
        const filter = browser.webRequest.filterResponseData!(details.requestId);
        const chunks: ArrayBuffer[] = [];
        let filterClosed = false;
        let shouldCapture: boolean | null = null;
        let cfg: any = null;

        // Async initialization - load config and check filters
        (async () => {
          try {
            cfg = await config.getConfig();
            const debugEnabled = cfg.debug?.logFilteredRequests ?? false;

            // Check status code filter
            const allowedStatusCodes = cfg.advanced?.allowedStatusCodes ?? [200, 206];
            if (!allowedStatusCodes.includes(details.statusCode!)) {
              if (debugEnabled) {
                await logger.debug('FILTERED: Status code not allowed', {
                  url: details.url,
                  status: details.statusCode,
                  allowedCodes: allowedStatusCodes,
                  reason: getStatusCodeReason(details.statusCode!)
                });
              }
              shouldCapture = false;
              return;
            }

            // Check Content-Type requirement
            const requireContentType = cfg.advanced?.requireContentType ?? true;
            const contentType = details.responseHeaders?.find(h =>
              h.name.toLowerCase() === 'content-type'
            );

            if (requireContentType && !contentType) {
              if (debugEnabled) {
                await logger.debug('FILTERED: No Content-Type header', {
                  url: details.url
                });
              }
              shouldCapture = false;
              return;
            }

            // Check URL pattern match
            shouldCapture = await config.shouldCapture(details.url);
            if (!shouldCapture) {
              if (debugEnabled) {
                await logger.debug('FILTERED: URL pattern mismatch', {
                  url: details.url,
                  patterns: cfg.urlPatterns
                });
              }
              return;
            }

            // Passed all checks
            await logger.info('Capturing response for', {
              url: details.url,
              status: details.statusCode,
              contentType: getMimeType(details.responseHeaders)
            });
          } catch (error) {
            await logger.error('Error checking filters', { url: details.url, error });
            shouldCapture = false;
          }
        })();

        filter.ondata = (event) => {
          // Always forward data to prevent page breakage
          chunks.push(event.data);
          filter.write(event.data);
        };

        filter.onstop = async () => {
          try {
            // Wait for config check to complete
            let waitCount = 0;
            while (shouldCapture === null && waitCount < 50) {
              await new Promise(resolve => setTimeout(resolve, 10));
              waitCount++;
            }

            // Only save if we should capture this URL
            if (shouldCapture) {
              const combined = new Uint8Array(
                chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
              );
              let offset = 0;

              for (const chunk of chunks) {
                combined.set(new Uint8Array(chunk), offset);
                offset += chunk.byteLength;
              }

              let body: string | null = null;
              try {
                const decoder = new TextDecoder('utf-8');
                body = decoder.decode(combined);
              } catch (e) {
                body = '[Binary data]';
              }

              await logger.info('Saving response data', {
                url: details.url,
                bodySize: body.length
              });

              await db.addTrafficData({
                type: 'response',
                url: details.url,
                status: details.statusCode,
                statusText: details.statusLine,
                headers: details.responseHeaders,
                mimeType: getMimeType(details.responseHeaders),
                body: body,
                timestamp: Date.now(),
                requestId: details.requestId,
                tabId: details.tabId
              });
            }

            if (!filterClosed) {
              try {
                filter.close();
                filterClosed = true;
              } catch (e) {
                await logger.warn('Could not close filter', { url: details.url, error: e });
              }
            }
          } catch (error) {
            await logger.error('Error processing response', {
              url: details.url,
              error
            });
            if (!filterClosed) {
              try {
                filter.close();
                filterClosed = true;
              } catch (e) {
                // Ignore
              }
            }
          }
        };

        filter.onerror = async (error) => {
          await logger.error('StreamFilter ERROR', {
            url: details.url,
            error,
            status: details.statusCode,
            contentType: getMimeType(details.responseHeaders),
            chunksReceived: chunks.length,
            filterClosed
          });
          filterClosed = true;
        };
      } catch (error) {
        logger.error('Failed to create filter', { url: details.url, error });
      }

      return undefined;
    },
    {
      urls: ['<all_urls>'],
      types: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'other']
    },
    ['responseHeaders']
  );

  // Cleanup on tab close
  browser.tabs.onRemoved.addListener((tabId) => {
    for (const [requestId, data] of pendingRequests.entries()) {
      if (data.tabId === tabId) {
        pendingRequests.delete(requestId);
      }
    }
  });
}

function getMimeType(headers?: chrome.webRequest.HttpHeader[]): string {
  if (!headers) return 'unknown';
  const contentType = headers.find(h => h.name.toLowerCase() === 'content-type');
  return contentType ? contentType.value!.split(';')[0] : 'unknown';
}
