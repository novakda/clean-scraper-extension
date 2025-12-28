/**
 * Firefox StreamFilter API wrapper for capturing HTTP response data
 *
 * Note: This API is Firefox-specific and not available in Chrome
 * See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData
 */

import { uint8ArrayToString, isTextContent, truncateData } from './request-capture';
import { getConfig } from './config';

/**
 * Type definition for Firefox StreamFilter
 * (Not in @types/webextension-polyfill by default)
 */
export interface StreamFilter {
  onstart: ((event: Event) => void) | null;
  ondata: ((event: { data: ArrayBuffer }) => void) | null;
  onstop: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  close: () => void;
  disconnect: () => void;
  write: (data: ArrayBuffer | Uint8Array) => void;
  status: 'uninitialized' | 'transferringdata' | 'finishedtransferringdata' | 'suspended' | 'closed' | 'disconnected' | 'failed';
  error: string;
}

/**
 * Result of capturing a response stream
 */
export interface StreamCaptureResult {
  /** Captured response body as string */
  body: string;
  /** Size of the response in bytes */
  size: number;
  /** Whether the response was truncated */
  truncated: boolean;
  /** Content type of the response */
  contentType?: string;
}

/**
 * Options for capturing a stream
 */
export interface StreamCaptureOptions {
  /** Maximum body size to capture (bytes) */
  maxBodySize?: number;
  /** Content-Type header value */
  contentType?: string;
  /** Request ID for logging */
  requestId: string;
}

/**
 * Attach a StreamFilter to capture response data
 *
 * @param requestId - The webRequest request ID
 * @param options - Capture options
 * @param onComplete - Callback when capture is complete
 * @param onError - Callback when an error occurs
 */
export function attachStreamFilter(
  requestId: string,
  options: StreamCaptureOptions,
  onComplete: (result: StreamCaptureResult) => void,
  onError: (error: string) => void
): void {
  try {
    console.log(`[StreamFilter] Attaching filter for request ${options.requestId}`);

    // Check if browser.webRequest.filterResponseData is available
    if (!(browser.webRequest as any).filterResponseData) {
      throw new Error('StreamFilter API not available (Firefox only)');
    }

    const filter = (browser.webRequest as any).filterResponseData(requestId) as StreamFilter;
    const config = getConfig();
    const maxBodySize = options.maxBodySize ?? config.maxBodySize;
    const contentType = options.contentType;

    // Check if we should capture text content
    const isText = isTextContent(contentType);
    if (!isText) {
      console.log(`[StreamFilter] Skipping binary content: ${contentType}`);
      filter.disconnect();
      onComplete({
        body: '[Binary content not captured]',
        size: 0,
        truncated: false,
        contentType,
      });
      return;
    }

    // Accumulate response data chunks
    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    let truncated = false;

    filter.onstart = (event) => {
      console.log(`[StreamFilter] Stream started for request ${options.requestId}`);
    };

    filter.ondata = (event) => {
      try {
        const chunk = new Uint8Array(event.data);
        totalSize += chunk.byteLength;

        // Check if we've exceeded max size
        if (totalSize > maxBodySize) {
          if (!truncated) {
            console.log(`[StreamFilter] Response exceeds max size (${maxBodySize} bytes), truncating`);
            truncated = true;
          }
        } else {
          chunks.push(chunk);
        }

        // Pass data through to browser
        filter.write(event.data);
      } catch (error) {
        console.error('[StreamFilter] Error processing data chunk:', error);
      }
    };

    filter.onstop = (event) => {
      try {
        console.log(`[StreamFilter] Stream stopped for request ${options.requestId}, total size: ${totalSize} bytes`);

        // Combine all chunks into a single Uint8Array
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;

        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.byteLength;
        }

        // Convert to string
        let body = uint8ArrayToString(combined);

        // Truncate if necessary
        if (body.length > maxBodySize) {
          body = truncateData(body, maxBodySize);
          truncated = true;
        }

        // Complete the capture
        onComplete({
          body,
          size: totalSize,
          truncated,
          contentType,
        });

        filter.close();
      } catch (error) {
        console.error('[StreamFilter] Error in onstop:', error);
        onError(`Error processing stream: ${error}`);
        filter.close();
      }
    };

    filter.onerror = (event) => {
      const errorMsg = filter.error || 'Unknown stream error';
      console.error(`[StreamFilter] Stream error for request ${options.requestId}:`, errorMsg);
      onError(errorMsg);
      filter.close();
    };

  } catch (error) {
    console.error('[StreamFilter] Error attaching filter:', error);
    onError(`Failed to attach filter: ${error}`);
  }
}

/**
 * Check if StreamFilter API is available
 */
export function isStreamFilterAvailable(): boolean {
  return typeof browser !== 'undefined' &&
         typeof browser.webRequest !== 'undefined' &&
         typeof (browser.webRequest as any).filterResponseData === 'function';
}

/**
 * Get StreamFilter status string for debugging
 */
export function getStreamFilterStatus(): string {
  if (!isStreamFilterAvailable()) {
    return 'StreamFilter API not available (Firefox only)';
  }
  return 'StreamFilter API available';
}
