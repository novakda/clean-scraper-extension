/**
 * Request capture coordinator managing request lifecycle, correlation, and StreamFilter attachment
 */

import type {
  CapturedRequest,
  CapturedResponse,
  CapturedEntry,
  HttpMethod,
  ResourceType,
} from './types/capture';
import type { ICaptureStorage } from './types/storage';
import type { CaptureConfig } from './config';
import { attachStreamFilter, getStreamFilterStatus } from './stream-filter';

type PendingRequestInfo = {
  entryId: string;
  contentType?: string;
};

export interface CaptureCoordinator {
  /**
   * Initialize request capture
   */
  initialize(): void;

  /**
   * Stop request capture
   */
  stop(): void;

  /**
   * Get pending requests (for debugging)
   */
  getPendingRequests(): Map<string, PendingRequestInfo>;

  /**
   * Register message handler for runtime.onMessage
   */
  onMessage?: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => void;
}

/**
 * Create capture coordinator with storage backend
 */
export function createCaptureCoordinator(storage: ICaptureStorage): CaptureCoordinator {
  const pendingRequests = new Map<string, PendingRequestInfo>();
  let isActive = false;

  const initialize = (): void => {
    console.log('[CaptureCoordinator] Initializing request capture');
    isActive = true;
    console.log('[CaptureCoordinator] StreamFilter status:', getStreamFilterStatus());
  };

  const stop = (): void => {
    console.log('[CaptureCoordinator] Stopping request capture');
    isActive = false;
    pendingRequests.clear();
  };

  const getPendingRequests = (): Map<string, PendingRequestInfo> => {
    return new Map(pendingRequests);
  };

  return {
    initialize,
    stop,
    getPendingRequests,
  };
}
