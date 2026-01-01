/**
 * Auto-refresh composable for request data
 */

import { ref, computed } from 'vue';

/**
 * Auto-refresh composable with interval management
 */
export function useAutoRefresh() {
  const isEnabled = ref(false);
  const intervalRef = ref<number | null>(null);
  const DEFAULT_INTERVAL_MS = 2000; // 2 seconds

  /**
   * Toggle auto-refresh
   */
  function toggleAutoRefresh(): void {
    isEnabled.value = !isEnabled.value;

    if (isEnabled.value) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  }

  /**
   * Start auto-refresh interval
   */
  function startAutoRefresh(): void {
    if (intervalRef.value) {
      console.warn('[useAutoRefresh] Auto-refresh already running');
      return;
    }

    intervalRef.value = window.setInterval(() => {
      console.log('[useAutoRefresh] Refreshing...');
    }, DEFAULT_INTERVAL_MS);
  }

  /**
   * Stop auto-refresh interval
   */
  function stopAutoRefresh(): void {
    if (!intervalRef.value) {
      console.warn('[useAutoRefresh] Auto-refresh not running');
      return;
    }

    if (intervalRef.value) {
      window.clearInterval(intervalRef.value);
      intervalRef.value = null;
      console.log('[useAutoRefresh] Auto-refresh stopped');
    }
  }

  /**
   * Cleanup on component unmount
   */
  function onUnmount(): void {
    stopAutoRefresh();
  }

  return {
    isEnabled: computed(() => isEnabled.value),
    toggleAutoRefresh,
    onUnmount,
  };
}
