/**
 * Utility functions for request/response capture
 */

/**
 * Parse headers from browser.webRequest format to HttpHeaders
 * @param headers - Array of header objects with name and value
 * @returns Headers as key-value pairs with lowercase keys
 */
export function parseHeaders(headers?: { name: string; value?: string }[]): HttpHeaders {
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
 * Convert ArrayBuffer to string using TextDecoder
 * @param buffer - ArrayBuffer to decode
 * @returns Decoded string, or binary data message if decoding fails
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
 * Convert Uint8Array to string using TextDecoder
 * @param array - Uint8Array to decode
 * @returns Decoded string, or binary data message if decoding fails
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
 * @param data - Data string to truncate
 * @param maxSize - Maximum size in characters
 * @returns Truncated string with truncation message
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
 * @param contentType - Content-Type header value
 * @returns true if content is text-based, false otherwise
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
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 KB", "1 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitSizes = [1, 1024, 1048576];

  let size = bytes;
  let unitIndex = 0;

  while (size >= unitSizes[unitIndex + 1]) {
    unitIndex++;
  }

  return `${(size / unitSizes[unitIndex]).toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "250ms", "1.5s", "1m 30s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Format timestamp to localized time string
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

/**
 * Get CSS class for HTTP method badge
 * @param method - HTTP method (uppercase)
 * @returns CSS class name
 */
export function getMethodClass(method: string): string {
  const methodLower = method.toLowerCase();
  switch (methodLower) {
    case 'get':
      return 'method-get';
    case 'post':
      return 'method-post';
    case 'put':
      return 'method-put';
    case 'delete':
      return 'method-delete';
    case 'patch':
      return 'method-patch';
    default:
      return 'method-other';
  }
}

/**
 * Get CSS class for HTTP status code badge
 * @param status - HTTP status code
 * @returns CSS class name
 */
export function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) {
    return 'status-success';
  } else if (status >= 300 && status < 400) {
    return 'status-redirect';
  } else if (status >= 400 && status < 500) {
    return 'status-client-error';
  } else if (status >= 500) {
    return 'status-server-error';
  }
  return 'status-other';
}

/**
 * Format headers object to array of key-value pairs
 * @param headers - Headers object
 * @returns Array of { key, value } pairs
 */
export function formatHeaders(headers: HttpHeaders): Array<{ key: string; value: string }> {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}
