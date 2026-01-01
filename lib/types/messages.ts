/**
 * Message types for background ↔ popup communication
 */

import type { CapturedEntry, CaptureStats, ICaptureStorage } from '../storage';

/**
 * Union type of all possible message types from UI to background
 */
export type BackgroundMessage =
  | { type: 'GET_CAPTURED_REQUESTS' }
  | { type: 'CLEAR_CAPTURED_REQUESTS' }
  | { type: 'GET_STATS' }
  | { type: 'GET_REQUEST_BY_ID', id: string }
  | { type: 'FILTER_REQUESTS', urlPattern?: string, method?: string, status?: string, statusCode?: number }
  | { type: 'GET_CONFIG' }
  | { type: 'PING' };

/**
 * Generic response wrapper for all messages
 */
export interface BackgroundResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Message handler function type
 */
export type MessageHandler<TRequest = unknown, TResponse = unknown> = (
  message: TRequest,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: TResponse) => void
) => void | boolean | Promise<void | boolean>;

/**
 * Storage handler dependencies
 */
export interface StorageHandlerDependencies {
  storage: ICaptureStorage;
}

/**
 * Capture handler dependencies
 */
export interface CaptureHandlerDependencies {
  config: CaptureConfig;
}

/**
 * Message type constants
 */
export const MESSAGE_TYPES = {
  GET_CAPTURED_REQUESTS: 'GET_CAPTURED_REQUESTS',
  CLEAR_CAPTURED_REQUESTS: 'CLEAR_CAPTURED_REQUESTS',
  GET_STATS: 'GET_STATS',
  GET_REQUEST_BY_ID: 'GET_REQUEST_BY_ID',
  FILTER_REQUESTS: 'FILTER_REQUESTS',
  GET_CONFIG: 'GET_CONFIG',
  PING: 'PING',
} as const;
