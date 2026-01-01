import type { CapturedRequest } from './types/capture';
import type { CapturedResponse } from './types/capture';
import type { CaptureEntry } from './types/capture';
import type { CaptureEntryStatus } from './types/capture';

/**
 * Generate a unique ID for a request
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a CapturedRequest from webRequest details
 */
export function createCapturedRequest(
  details: import('./types/capture').OnBeforeRequestDetails
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
  headers: import('./types/capture').HttpHeaders,
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
export function createCapturedEntry(request: CapturedRequest): CaptureEntry {
  const now = Date.now();

  return {
    id: request.id,
    request,
    response: undefined, // Will be added when response is captured
    status: 'pending' as CaptureEntryStatus,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update entry with response data
 */
export function createCapturedEntryWithResponse(
  entry: CaptureEntry,
  response: CapturedResponse
): CaptureEntry {
  const duration = response.timestamp - entry.request.timestamp;

  return {
    ...entry,
    response,
    status: 'completed' as CaptureEntryStatus,
    updatedAt: response.timestamp,
  };
}

/**
 * Create error entry
 */
export function createErrorEntry(
  entry: CaptureEntry,
  error: string
): CaptureEntry {
  return {
    ...entry,
    status: 'error' as CaptureEntryStatus,
    error,
    updatedAt: Date.now(),
  };
}
