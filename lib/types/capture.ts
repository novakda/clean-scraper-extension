/**
 * Core data models for HTTP request/response capture
 */

/**
 * HTTP headers represented as key-value pairs
 */
export type HttpHeaders = {
  [key: string]: string
};

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

  /** Request headers as key-value pairs */
  headers: HttpHeaders;

  /** Request body (if available) as string (JSON or raw text) */
  requestBody?: string;

  /** Timestamp when request was initiated (milliseconds since epoch) */
  timestamp: number;

  /** Resource type (e.g., 'xmlhttprequest', 'main_frame', 'script') */
  type?: string;
}

/**
 * Captured HTTP response metadata
 */
export interface CapturedResponse {
  /** HTTP status code (e.g., 200, 404, 500) */
  status: number;

  /** HTTP status text (e.g., 'OK', 'Not Found', 'Internal Server Error') */
  statusText: string;

  /** Response headers as key-value pairs */
  headers: HttpHeaders;

  /** Response body content as string (JSON or text) */
  responseBody: string;

  /** Timestamp when response was received (milliseconds since epoch) */
  timestamp: number;

  /** Size of response body in bytes */
  bodySize: number;
}

/**
 * Complete captured HTTP exchange (request + response) with overall capture status
 */
export interface CapturedEntry {
  /** Unique identifier (same as request.id) */
  id: string;

  /** The request metadata */
  request: CapturedRequest;

  /** The response metadata (undefined if still pending or failed) */
  response?: CapturedResponse;

  /** Overall capture status */
  status: 'pending' | 'completed' | 'error';

  /** Error message if capture failed */
  error?: string;

  /** Timestamp when entry was created */
  createdAt: number;

  /** Timestamp when entry was last updated */
  updatedAt: number;
}

/**
 * Statistics about captured requests for monitoring and diagnostics
 */
export interface CaptureStats {
  /** Total number of captured entries */
  totalEntries: number;

  /** Number of entries with 'completed' status */
  completedEntries: number;

  /** Number of entries with 'pending' status */
  pendingEntries: number;

  /** Number of entries with 'error' status */
  errorEntries: number;

  /** Total size of all captured response data in bytes */
  totalDataSize: number;

  /** Timestamp of most recent capture */
  lastCaptureTime?: number;
}

/**
 * CapturedEntry status types
 */
export type CaptureEntryStatus = 'pending' | 'completed' | 'error';

/**
 * HTTP methods enumeration
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD'
  | 'TRACE';

/**
 * HTTP resource types (Firefox webRequest)
 */
export type ResourceType =
  | 'main_frame'
  | 'sub_frame'
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'object'
  | 'xmlhttprequest'
  | 'ping'
  | 'csp_report'
  | 'media'
  | 'websocket'
  | 'other';
