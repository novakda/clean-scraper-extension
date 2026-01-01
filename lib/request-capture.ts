/**
 * Data models for capturing HTTP requests and responses
 *
 * DEPRECATED: This file has been refactored.
 * All types are now exported from @/lib/types/capture.ts
 * All utility functions are now exported from @/lib/utils.ts
 *
 * MIGRATION: Update imports to use:
 *   import type { CapturedRequest, CapturedResponse, CapturedEntry, CaptureStats } from './types/capture';
 *   import { parseHeaders, arrayBufferToString, uint8ArrayToString, truncateData, isTextContent } from './utils';
 */

export type * from './types/capture';

export * from './utils';

/**
 * HTTP headers represented as key-value pairs
 */
export interface HttpHeaders {
  [key: string]: string;
}

/**
 * Captured HTTP request metadata
 */
export interface CapturedRequest {
  /** Unique identifier for this request */
  id: string;
  /** Request URL */
  url: string;
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Request headers */
  headers: HttpHeaders;
  /** Request body (if available) */
  requestBody?: string;
  /** Timestamp when request was initiated */
  timestamp: number;
  /** Request type (e.g., 'xmlhttprequest', 'script', 'main_frame') */
  type?: string;
}

/**
 * Captured HTTP response metadata
 */
export interface CapturedResponse {
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: HttpHeaders;
  /** Response body content */
  responseBody: string;
  /** Timestamp when response was received */
  timestamp: number;
  /** Size of response body in bytes */
  bodySize: number;
}

/**
 * Complete captured HTTP exchange (request + response)
 */
export interface CapturedEntry {
  /** Unique identifier (same as request.id) */
  id: string;
  /** Request metadata */
  request: CapturedRequest;
  /** Response metadata (may be undefined if still pending) */
  response?: CapturedResponse;
  /** Overall status of the capture */
  status: 'pending' | 'completed' | 'error';
  /** Error message if capture failed */
  error?: string;
  /** Timestamp when entry was created */
  createdAt: number;
  /** Timestamp when entry was last updated */
  updatedAt: number;
}

/**
 * Statistics about captured requests
 */
export interface CaptureStats {
  /** Total number of captured entries */
  totalEntries: number;
  /** Number of completed captures */
  completedEntries: number;
  /** Number of pending captures */
  pendingEntries: number;
  /** Number of failed captures */
  errorEntries: number;
  /** Total size of all captured data in bytes */
  totalDataSize: number;
  /** Timestamp of last capture */
  lastCaptureTime?: number;
}

/**
 * Generate a unique ID for a request
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse headers from browser.webRequest format to HttpHeaders
 */
export function parseHeaders(headers?: HttpHeaders_): HttpHeaders {
  const result: HttpHeaders = {};
  if (!headers) return result;

  for (const header of headers) {
    if (header.name && header.value) {
      // Convert header name to lowercase for consistency
      result[header.name.toLowerCase()] = header.value;
    }
  }

  return result;
}

/**
 * Convert ArrayBuffer to string (for response body)
 */
export function arrayBufferToString(buffer: ArrayBuffer): string {
  try {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  } catch (error) {
    console.error('Failed to decode ArrayBuffer:', error);
    return '[Binary data - unable to decode]';
  }
}

/**
 * Convert Uint8Array to string (for response body)
 */
export function uint8ArrayToString(array: Uint8Array): string {
  try {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(array);
  } catch (error) {
    console.error('Failed to decode Uint8Array:', error);
    return '[Binary data - unable to decode]';
  }
}

/**
 * Truncate data if it exceeds max size
 */
export function truncateData(data: string, maxSize: number): string {
  if (data.length <= maxSize) {
    return data;
  }

  const truncated = data.substring(0, maxSize);
  return `${truncated}\n\n[... truncated ${data.length - maxSize} characters]`;
}

/**
 * Check if content type is text-based
 */
export function isTextContent(contentType?: string): boolean {
  if (!contentType) return true; // Default to true if unknown

  const textTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/x-www-form-urlencoded',
  ];

  return textTypes.some(type => contentType.toLowerCase().includes(type));
}

/**
 * Create a CapturedRequest from webRequest details
 */
export function createCapturedRequest(
  details: OnBeforeRequestDetails
): CapturedRequest {
  return {
    id: generateRequestId(),
    url: details.url,
    method: details.method,
    headers: {}, // Headers will be added from onSendHeaders
    requestBody: details.requestBody ? JSON.stringify(details.requestBody) : undefined,
    timestamp: details.timeStamp,
    type: details.type,
  };
}

/**
 * Create a CapturedResponse from response details and body
 */
export function createCapturedResponse(
  statusCode: number,
  statusLine: string,
  headers: HttpHeaders,
  body: string
): CapturedResponse {
  return {
    status: statusCode,
    statusText: statusLine,
    headers,
    responseBody: body,
    timestamp: Date.now(),
    bodySize: new Blob([body]).size,
  };
}

/**
 * Create an initial CapturedEntry
 */
export function createCapturedEntry(request: CapturedRequest): CapturedEntry {
  const now = Date.now();
  return {
    id: request.id,
    request,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}
