/**
 * Storage-related message handlers for background ↔ popup communication
 */

import type { BackgroundMessage, BackgroundResponse } from '../messages';
import type { CapturedEntry, CaptureStats, ICaptureStorage } from '../storage';
import type { StorageHandlerDependencies } from '../messages';

/**
 * Handle GET_CAPTURED_REQUESTS message
 */
export async function handleGetCapturedRequests(
  deps: StorageHandlerDependencies
): Promise<BackgroundResponse<CapturedEntry[]>> {
  const entries = deps.storage.getAll();
  const count = entries.length;

  console.log(`[StorageHandler] Returning ${count} captured requests`);

  return {
    success: true,
    data: entries,
    count,
  };
}

/**
 * Handle CLEAR_CAPTURED_REQUESTS message
 */
export async function handleClearCapturedRequests(
  deps: StorageHandlerDependencies
): Promise<BackgroundResponse<void>> {
  deps.storage.clear();

  console.log('[StorageHandler] Cleared all captured requests');

  return {
    success: true,
    message: 'Captured requests cleared',
  };
}

/**
 * Handle GET_STATS message
 */
export async function handleGetStats(
  deps: StorageHandlerDependencies
): Promise<BackgroundResponse<CaptureStats>> {
  const stats = deps.storage.getStats();

  console.log('[StorageHandler] Returning statistics:', stats);

  return {
    success: true,
    data: stats,
  };
}

/**
 * Handle GET_REQUEST_BY_ID message
 */
export async function handleGetRequestById(
  deps: StorageHandlerDependencies
): Promise<BackgroundResponse<CapturedEntry>> {
  const { id } = deps.message as { id: string };

  if (!id) {
    return {
      success: false,
      error: 'Request ID is required',
    };
  }

  const entry = deps.storage.getById(id);

  if (!entry) {
    return {
      success: false,
      error: `Request ${id} not found`,
    };
  }

  console.log(`[StorageHandler] Returning request ${id}`);

  return {
    success: true,
    data: entry,
  };
}

/**
 * Handle FILTER_REQUESTS message
 */
export async function handleFilterRequests(
  deps: StorageHandlerDependencies
): Promise<BackgroundResponse<CapturedEntry[]>> {
  const { urlPattern, method, status, statusCode } = deps.message;

  let results = deps.storage.getAll();

  if (urlPattern) {
    const regex = new RegExp(urlPattern, 'i');
    results = results.filter(entry => regex.test(entry.request.url));
  }

  if (method) {
    results = results.filter(entry => entry.request.method === method.toUpperCase());
  }

  if (status) {
    results = results.filter(entry => entry.status === status);
  }

  if (statusCode !== undefined) {
    results = results.filter(entry => entry.response?.status === statusCode);
  }

  const count = results.length;

  console.log(`[StorageHandler] Filtered ${count} requests`);

  return {
    success: true,
    data: results,
    count,
  };
}
