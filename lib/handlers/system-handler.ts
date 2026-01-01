/**
 * System message handler (PING, health checks)
 */

import type { BackgroundMessage, BackgroundResponse } from '../messages';

/**
 * Handle PING message for health check
 */
export async function handlePing(): Promise<BackgroundResponse<{message: string; streamFilterAvailable?: boolean}>> {
  const streamFilterAvailable = (browser.webRequest as any).filterResponseData !== undefined;

  console.log('[SystemHandler] PING received, StreamFilter available:', streamFilterAvailable);

  return {
    success: true,
    data: {
      message: 'pong',
      streamFilterAvailable,
    },
  };
}
