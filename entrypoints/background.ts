import * as db from '@/utils/db';
import * as config from '@/utils/config';
import { initStreamFilterCapture } from '@/utils/stream-filter';
import type { PendingRequest, RuntimeMessage, MessageResponse, CaptureStats } from '@/utils/types';

export default defineBackground(() => {
  const pendingRequests = new Map<string, PendingRequest>();

  // Track capture statistics
  const stats: CaptureStats = {
    totalCaptured: 0,
    totalFiltered: 0,
    lastCapturedUrl: null,
    lastFilteredUrl: null,
    lastFilterReason: null,
    isCapturing: true
  };

  // Initialize on install
  browser.runtime.onInstalled.addListener(async () => {
    console.log('Network Traffic Capturer installed');
    await config.saveConfig(config.DEFAULT_CONFIG);
  });

  // Browser detection for StreamFilter support
  const isFirefox = typeof browser?.webRequest?.filterResponseData === 'function';

  // TEMPORARILY DISABLED: StreamFilter causing issues on code.claude.com
  // Will re-enable with better error handling
  if (false && isFirefox) {
    console.log('Firefox detected - using StreamFilter API for response body capture');
    initStreamFilterCapture(pendingRequests);
  } else {
    console.log('StreamFilter disabled - response bodies will not be captured');
    console.log('Request metadata and headers will still be captured');
    // TODO: Fix StreamFilter implementation or use chrome.debugger API
  }

  // Runtime message handlers
  browser.runtime.onMessage.addListener(
    (
      message: RuntimeMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: MessageResponse) => void
    ) => {
      (async () => {
        try {
          switch (message.action) {
            case 'getConfig': {
              const cfg = await config.getConfig();
              sendResponse(cfg);
              break;
            }
            case 'saveConfig': {
              await config.saveConfig(message.config);
              sendResponse({ success: true });
              break;
            }
            case 'getAllTraffic': {
              const traffic = await db.getAllTraffic();
              sendResponse(traffic);
              break;
            }
            case 'clearTraffic': {
              await db.clearTraffic();
              sendResponse({ success: true });
              break;
            }
            case 'toggleCapture': {
              // Placeholder for future implementation
              sendResponse({ success: true });
              break;
            }
            case 'getCaptureStats': {
              sendResponse(stats);
              break;
            }
            default: {
              console.warn('Unknown message action:', (message as any).action);
              sendResponse({ success: true });
            }
          }
        } catch (error) {
          console.error('Message handler error:', error);
          sendResponse({ success: true });
        }
      })();

      return true; // Keep channel open for async response
    }
  );

  console.log('Network Traffic Capturer background script initialized');
});
