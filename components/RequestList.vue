<script lang="ts" setup>
import { computed } from 'vue';
import type { CapturedEntry } from '@/lib/request-capture';

interface Props {
  requests: CapturedEntry[];
  selectedId?: string;
}

interface Emits {
  (e: 'select', entry: CapturedEntry): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hasRequests = computed(() => props.requests.length > 0);

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function getMethodClass(method: string): string {
  const methodLower = method.toLowerCase();
  switch (methodLower) {
    case 'get':
      return 'method-get';
    case 'post':
      return 'method-post';
    case 'put':
      return 'method-put';
    case 'delete':
      return 'method-delete';
    case 'patch':
      return 'method-patch';
    default:
      return 'method-other';
  }
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) {
    return 'status-success';
  } else if (status >= 300 && status < 400) {
    return 'status-redirect';
  } else if (status >= 400 && status < 500) {
    return 'status-client-error';
  } else if (status >= 500) {
    return 'status-server-error';
  }
  return 'status-other';
}

function handleSelect(entry: CapturedEntry): void {
  emit('select', entry);
}

// Compute duration from request/response timestamps
function getDuration(entry: CapturedEntry): number {
  if (!entry.response) return 0;
  return entry.response.timestamp - entry.request.timestamp;
}

// Get status code safely (return 0 if no response)
function getStatus(entry: CapturedEntry): number {
  return entry.response?.status ?? 0;
}
</script>

<template>
  <div class="request-list">
    <div v-if="!hasRequests" class="empty-state">
      <p>No HTTP requests captured yet.</p>
      <p class="hint">Start browsing to capture requests.</p>
    </div>
    <div v-else class="request-table">
      <div class="request-header">
        <div class="col-method">Method</div>
        <div class="col-url">URL</div>
        <div class="col-status">Status</div>
        <div class="col-time">Time</div>
        <div class="col-duration">Duration</div>
      </div>
      <div
        v-for="entry in requests"
        :key="entry.request.id"
        class="request-row"
        :class="{ selected: entry.request.id === selectedId }"
        @click="handleSelect(entry)"
      >
        <div class="col-method">
          <span :class="['method-badge', getMethodClass(entry.request.method)]">
            {{ entry.request.method }}
          </span>
        </div>
        <div class="col-url" :title="entry.request.url">
          {{ entry.request.url }}
        </div>
        <div class="col-status">
          <span :class="['status-badge', getStatusClass(getStatus(entry))]">
            {{ getStatus(entry) || '-' }}
          </span>
        </div>
        <div class="col-time">
          {{ formatTime(entry.request.timestamp) }}
        </div>
        <div class="col-duration">
          {{ formatDuration(getDuration(entry)) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-list {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #666;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-state .hint {
  font-size: 0.875rem;
  color: #999;
}

.request-table {
  flex: 1;
  overflow-y: auto;
  font-size: 0.875rem;
}

.request-header {
  display: grid;
  grid-template-columns: 80px 1fr 70px 80px 80px;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.request-row {
  display: grid;
  grid-template-columns: 80px 1fr 70px 80px 80px;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.15s;
}

.request-row:hover {
  background-color: rgba(100, 108, 255, 0.1);
}

.request-row.selected {
  background-color: rgba(100, 108, 255, 0.2);
}

.col-method,
.col-status,
.col-time,
.col-duration {
  display: flex;
  align-items: center;
}

.col-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.method-badge,
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.method-get {
  background-color: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.method-post {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.method-put {
  background-color: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.method-delete {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.method-patch {
  background-color: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
}

.method-other {
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.status-success {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-redirect {
  background-color: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.status-client-error {
  background-color: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.status-server-error {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-other {
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}
</style>
