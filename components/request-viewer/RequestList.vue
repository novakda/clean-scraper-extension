<script lang="ts" setup>
import { computed } from 'vue';
import type { CapturedEntry } from '@/lib/types/capture';
import MethodBadge from './MethodBadge.vue';
import StatusCodeBadge from './StatusCodeBadge.vue';

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

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
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
          <MethodBadge :method="entry.request.method" />
        </div>
        <div class="col-url">{{ entry.request.url }}</div>
        <div class="col-status">
          <StatusCodeBadge :status="getStatus(entry)" />
        </div>
        <div class="col-time">{{ formatTime(entry.request.timestamp) }}</div>
        <div class="col-duration">{{ formatDuration(getDuration(entry)) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.875rem;
}

.hint {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.request-table {
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex: 1;
}

.request-header {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.request-header div {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #999;
}

.request-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.15s;
}

.request-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.request-row.selected {
  background-color: rgba(100, 108, 255, 0.08);
}

.col-method {
  min-width: 80px;
}

.col-url {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-status {
  min-width: 80px;
}

.col-time {
  min-width: 80px;
}

.col-duration {
  min-width: 80px;
}
</style>
