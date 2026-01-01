/**
 * Composable for fetching and managing captured requests
 */

import { ref, computed } from 'vue';
import type { CapturedEntry } from '@/lib/types/capture';

/**
 * Request capture composable state and functions
 */
export function useRequestCapture() {
  const capturedRequests = ref<CapturedEntry[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all captured requests from background
   */
  async function fetchRequests(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await browser.runtime.sendMessage({
        type: 'GET_CAPTURED_REQUESTS',
      }) as { success: boolean; data?: CapturedEntry[]; error?: string };

      if (response.success && response.data) {
        capturedRequests.value = response.data;
      } else {
        error.value = response.error || 'Failed to fetch requests';
        console.error('[useRequestCapture] Fetch error:', response.error);
      }
    } catch (err) {
      error.value = 'Failed to communicate with background script';
      console.error('[useRequestCapture] Communication error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear all captured requests
   */
  async function clearRequests(): Promise<void> {
    const response = await browser.runtime.sendMessage({
      type: 'CLEAR_CAPTURED_REQUESTS',
    }) as { success: boolean; message?: string; error?: string };

    if (response.success) {
      capturedRequests.value = [];
      console.log('[useRequestCapture] Cleared all requests');
    } else {
      error.value = response.error || 'Failed to clear requests';
      console.error('[useRequestCapture] Clear error:', response.error);
    }
  }

  return {
    capturedRequests,
    isLoading,
    error,
    fetchRequests,
    clearRequests,
  };
}
