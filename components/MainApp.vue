<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import RequestList from '@/components/RequestList.vue';
import RequestDetail from '@/components/RequestDetail.vue';
import RequestFilter from '@/components/RequestFilter.vue';
import type { CapturedEntry } from '@/lib/request-capture';

// Component props
interface Props {
  mode?: 'popup' | 'tab';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'popup'
});

// Define UI-specific types
interface RequestFilters {
  urlPattern: string;
  method: string;
  statusCode: string;
}

interface BackgroundResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const capturedRequests = ref<CapturedEntry[]>([]);
const selectedRequest = ref<CapturedEntry | null>(null);
const filters = ref<RequestFilters>({
  urlPattern: '',
  method: '',
  statusCode: '',
});
const isLoading = ref(false);
const error = ref<string | null>(null);
const autoRefresh = ref(false);
let refreshInterval: number | null = null;

// Filter requests based on current filters
const filteredRequests = computed(() => {
  let filtered = capturedRequests.value;

  if (filters.value.urlPattern) {
    const pattern = filters.value.urlPattern.toLowerCase();
    filtered = filtered.filter((entry) => entry.request.url.toLowerCase().includes(pattern));
  }

  if (filters.value.method) {
    filtered = filtered.filter((entry) => entry.request.method === filters.value.method);
  }

  if (filters.value.statusCode) {
    const statusCode = parseInt(filters.value.statusCode);
    if (!isNaN(statusCode)) {
      filtered = filtered.filter((entry) => entry.response?.status === statusCode);
    }
  }

  return filtered;
});

// Fetch captured requests from background script
async function fetchRequests(): Promise<void> {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await browser.runtime.sendMessage({
      type: 'GET_CAPTURED_REQUESTS',
    }) as BackgroundResponse<CapturedEntry[]>;

    if (response.success && response.data) {
      capturedRequests.value = response.data;
    } else {
      error.value = response.error || 'Failed to fetch requests';
      // If backend is not ready yet, show empty array instead of error
      if (error.value.includes('Unknown message type')) {
        capturedRequests.value = [];
        error.value = null;
      }
    }
  } catch (err) {
    console.error('Error fetching requests:', err);
    error.value = 'Failed to communicate with background script';
    // Don't show error for initial connection issues
    capturedRequests.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Clear all captured requests
async function clearRequests(): Promise<void> {
  if (!confirm('Are you sure you want to clear all captured requests?')) {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await browser.runtime.sendMessage({
      type: 'CLEAR_CAPTURED_REQUESTS',
    }) as BackgroundResponse<void>;

    if (response.success) {
      capturedRequests.value = [];
      selectedRequest.value = null;
    } else {
      error.value = response.error || 'Failed to clear requests';
    }
  } catch (err) {
    console.error('Error clearing requests:', err);
    error.value = 'Failed to communicate with background script';
  } finally {
    isLoading.value = false;
  }
}

// Handle request selection
function handleSelectRequest(entry: CapturedEntry): void {
  selectedRequest.value = entry;
}

// Handle filter updates
function handleFilterUpdate(newFilters: RequestFilters): void {
  filters.value = newFilters;
}

// Handle close detail view
function handleCloseDetail(): void {
  selectedRequest.value = null;
}

// Toggle auto-refresh
function toggleAutoRefresh(): void {
  autoRefresh.value = !autoRefresh.value;

  if (autoRefresh.value) {
    // Refresh every 2 seconds
    refreshInterval = window.setInterval(() => {
      fetchRequests();
    }, 2000);
  } else {
    if (refreshInterval !== null) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }
}

// Open in new tab (only available in popup mode)
async function openInTab(): Promise<void> {
  await browser.tabs.create({
    url: browser.runtime.getURL('/tab.html')
  });
}

// Lifecycle
onMounted(() => {
  fetchRequests();
});

// Cleanup on unmount
window.addEventListener('beforeunload', () => {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
  }
});
</script>

<template>
  <div id="app" :class="props.mode + '-mode'">
    <div class="app-header">
      <h1>HTTP Request Capture</h1>
      <div class="header-actions">
        <button
          :class="['auto-refresh-btn', { active: autoRefresh }]"
          @click="toggleAutoRefresh"
          :title="autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'"
        >
          {{ autoRefresh ? '⏸' : '▶' }}
        </button>
        <button
          v-if="props.mode === 'popup'"
          class="open-tab-btn"
          @click="openInTab"
          title="Open in new tab"
        >
          ↗
        </button>
        <button class="refresh-btn" @click="fetchRequests" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
        <button
          class="clear-btn"
          @click="clearRequests"
          :disabled="isLoading || capturedRequests.length === 0"
        >
          Clear All
        </button>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      <span>{{ error }}</span>
      <button @click="error = null">×</button>
    </div>

    <RequestFilter @update="handleFilterUpdate" />

    <div class="app-content">
      <div class="list-panel">
        <div class="list-header">
          <h2>Requests ({{ filteredRequests.length }})</h2>
        </div>
        <RequestList
          :requests="filteredRequests"
          :selected-id="selectedRequest?.request.id"
          @select="handleSelectRequest"
        />
      </div>

      <div v-if="selectedRequest" class="detail-panel">
        <RequestDetail :entry="selectedRequest" @close="handleCloseDetail" />
      </div>
    </div>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#app.popup-mode {
  width: 800px;
  height: 600px;
}

#app.tab-mode {
  width: 100vw;
  height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.app-header h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.auto-refresh-btn {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  background-color: rgba(100, 108, 255, 0.2);
  border: 1px solid rgba(100, 108, 255, 0.4);
}

.auto-refresh-btn:hover {
  background-color: rgba(100, 108, 255, 0.3);
  border-color: rgba(100, 108, 255, 0.6);
}

.auto-refresh-btn.active {
  background-color: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.4);
}

.open-tab-btn {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  background-color: rgba(100, 108, 255, 0.2);
  border: 1px solid rgba(100, 108, 255, 0.4);
}

.open-tab-btn:hover {
  background-color: rgba(100, 108, 255, 0.3);
  border-color: rgba(100, 108, 255, 0.6);
}

.refresh-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  background-color: rgba(100, 108, 255, 0.2);
  border: 1px solid rgba(100, 108, 255, 0.4);
}

.refresh-btn:hover:not(:disabled) {
  background-color: rgba(100, 108, 255, 0.3);
  border-color: rgba(100, 108, 255, 0.6);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  background-color: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
}

.clear-btn:hover:not(:disabled) {
  background-color: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.6);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: rgba(244, 67, 54, 0.2);
  border-bottom: 1px solid rgba(244, 67, 54, 0.4);
  color: #f44336;
  font-size: 0.875rem;
}

.error-banner button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.error-banner button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.list-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-header h2 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #999;
}

.detail-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
