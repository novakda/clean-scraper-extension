import type { CaptureConfig } from './types';
import { LogLevel } from './logger';

export const DEFAULT_CONFIG: CaptureConfig = {
  urlPatterns: ['*://*/*'],
  enabled: true,
  advanced: {
    // Include common successful status codes for API/XHR requests
    allowedStatusCodes: [200, 201, 202, 203, 204, 205, 206],
    requireContentType: false, // Allow responses without Content-Type (common for APIs)
    captureRedirects: false,
    captureErrors: false,
    minBodySize: 0,
    maxBodySize: 10 * 1024 * 1024 // 10MB
  },
  debug: {
    logLevel: LogLevel.WARN,
    logFilteredRequests: false
  }
};

export async function getConfig(): Promise<CaptureConfig> {
  const result = await browser.storage.local.get('config');
  return (result.config as CaptureConfig) || DEFAULT_CONFIG;
}

export async function saveConfig(config: CaptureConfig): Promise<void> {
  await browser.storage.local.set({ config });
}

export async function shouldCapture(url: string): Promise<boolean> {
  const config = await getConfig();
  if (!config.enabled) return false;

  return config.urlPatterns.some(pattern => {
    const regex = patternToRegex(pattern);
    return regex.test(url);
  });
}

function patternToRegex(pattern: string): RegExp {
  const regex = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  try {
    return new RegExp(`^${regex}$`);
  } catch {
    return new RegExp('.*');
  }
}
