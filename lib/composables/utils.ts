/**
 * UI utility functions for request display
 */

/**
 * Format timestamp to localized time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

/**
 * Format duration in milliseconds to human-readable string
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
 * Get CSS class for HTTP method badge
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
 */
export function formatHeaders(headers: Record<string, string>): Array<{ key: string; value: string }> {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}
