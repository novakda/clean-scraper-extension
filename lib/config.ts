/**
 * Configuration system for StreamFilter request/response capture
 */

type ResourceType = 'main_frame' | 'sub_frame' | 'stylesheet' | 'script' | 'image' | 'font' | 'object' | 'xmlhttprequest' | 'ping' | 'csp_report' | 'media' | 'websocket' | 'other';

interface RequestFilter {
  urls: string[];
  types?: ResourceType[];
}

/**
 * URL pattern configuration for request capture
 */
export interface CaptureConfig {
  /** URL patterns to capture (match patterns) */
  urlPatterns: string[];
  /** Maximum number of entries to store in memory */
  maxEntries: number;
  /** Maximum size of response body to capture (in bytes) */
  maxBodySize: number;
  /** Whether to capture request bodies */
  captureRequestBody: boolean;
  /** Whether to capture response bodies */
  captureResponseBody: boolean;
  /** Resource types to capture (e.g., 'xmlhttprequest', 'main_frame') */
  resourceTypes: ResourceType[];
}

/**
 * Default configuration for request capture
 */
export const DEFAULT_CONFIG: CaptureConfig = {
  // Capture all URLs by default (can be customized by user later)
  urlPatterns: ['<all_urls>'],

  // Store up to 100 requests in memory
  maxEntries: 100,

  // Limit response body to 1MB to prevent memory issues
  maxBodySize: 1024 * 1024, // 1MB

  // Capture both request and response bodies
  captureRequestBody: true,
  captureResponseBody: true,

  // Capture common resource types
  resourceTypes: [
    'xmlhttprequest',
    'main_frame',
    'sub_frame',
    'script',
    'stylesheet',
    'image',
    'font',
    'object',
    'other',
  ] as ResourceType[],
};

/**
 * Active configuration (can be modified at runtime)
 */
let currentConfig: CaptureConfig = { ...DEFAULT_CONFIG };

/**
 * Get the current configuration
 */
export function getConfig(): CaptureConfig {
  return { ...currentConfig };
}

/**
 * Update the configuration
 */
export function updateConfig(updates: Partial<CaptureConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...updates,
  };
  console.log('Capture configuration updated:', currentConfig);
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
  console.log('Capture configuration reset to defaults');
}

/**
 * Check if a URL matches any of the configured patterns
 */
export function matchesUrlPattern(url: string, patterns: string[]): boolean {
  // Handle <all_urls> special pattern
  if (patterns.includes('<all_urls>')) {
    return true;
  }

  for (const pattern of patterns) {
    if (matchPattern(url, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Match a single URL against a match pattern
 * Simplified implementation - for production, use browser.webRequest filtering
 */
function matchPattern(url: string, pattern: string): boolean {
  try {
    // Convert match pattern to regex
    // Pattern format: <scheme>://<host>/<path>
    // * in scheme matches any scheme
    // * in host matches any subdomain
    // * in path matches any characters

    let regexPattern = pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*/g, '.*') // Convert * to .*
      .replace(/\?/g, '\\?'); // Escape question marks

    // Add anchors
    if (!regexPattern.startsWith('^')) {
      regexPattern = '^' + regexPattern;
    }
    if (!regexPattern.endsWith('$')) {
      regexPattern = regexPattern + '$';
    }

    const regex = new RegExp(regexPattern);
    return regex.test(url);
  } catch (error) {
    console.error('Error matching pattern:', pattern, error);
    return false;
  }
}

/**
 * Validate a URL pattern
 */
export function isValidUrlPattern(pattern: string): boolean {
  try {
    // Basic validation for match patterns
    if (pattern === '<all_urls>') {
      return true;
    }

    // Should contain ://
    if (!pattern.includes('://')) {
      return false;
    }

    // Should have scheme, host, and path
    const parts = pattern.split('://');
    if (parts.length !== 2) {
      return false;
    }

    const [scheme, rest] = parts;
    const validSchemes = ['*', 'http', 'https', 'ftp', 'file'];

    if (!validSchemes.includes(scheme)) {
      return false;
    }

    // Rest should contain at least a slash for path
    if (!rest.includes('/')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a resource type should be captured
 */
export function shouldCaptureResourceType(
  type: ResourceType | undefined
): boolean {
  if (!type) return false;
  return currentConfig.resourceTypes.includes(type);
}

/**
 * Get webRequest filter based on current config
 */
export function getWebRequestFilter(): RequestFilter {
  return {
    urls: currentConfig.urlPatterns,
    types: currentConfig.resourceTypes,
  };
}
