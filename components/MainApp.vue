<script setup lang="ts">
import { useRequestCapture } from '@/lib/composables/useRequestCapture';
import { useRequestFilters } from '@/lib/composables/useRequestFilters';
import { useAutoRefresh } from '@/lib/composables/useAutoRefresh';
import RequestList from '@/components/request-viewer/RequestList.vue';
import RequestDetail from '@/components/RequestDetail.vue';
import RequestFilter from '@/components/request-viewer/RequestFilter.vue';

// Use composables for state management
const { capturedRequests, fetchRequests, clearRequests, isLoading, error } = useRequestCapture();
const { filteredRequests, updateFilters } = useRequestFilters(capturedRequests);
const { autoRefresh, toggleAutoRefresh } = useAutoRefresh();

// Handle request selection
function handleSelectRequest(entry: import('@/lib/request-capture').CapturedEntry) {
  selectedRequest.value = entry;
}

// Handle detail view close
function handleCloseDetail() {
  selectedRequest.value = null;
}
</script>

<template>
  <div class="app-container">
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
        <button
          class="refresh-btn"
          @click="fetchRequests"
          :disabled="isLoading"
        >
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
        <RequestDetail
          :entry="selectedRequest"
          @close="handleCloseDetail"
        />
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

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.05);
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
  background-color: rgba(244, 67, 54, 0.1);
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
  background-color: rgba(244, 67, 54, 0.1);
  border-bottom: 1px solid rgba(244, 67, 54, 0.4);
  color: #f44336;
  font-size: 0.875rem;
}

.error-banner span {
  margin-right: 1rem;
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
  color: #999;
  font-weight: 600;
}

.app-content {
  flex: 1;
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
  background: rgba(0, 0, 0, 0.05);
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
