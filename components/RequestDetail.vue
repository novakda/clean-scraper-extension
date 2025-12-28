<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CapturedEntry } from '@/lib/request-capture';

interface Props {
  entry: CapturedEntry | null;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeTab = ref<'request' | 'response'>('request');

const hasRequestBody = computed(() => {
  return props.entry?.request.requestBody && props.entry.request.requestBody.trim().length > 0;
});

const hasResponseBody = computed(() => {
  return props.entry?.response?.responseBody && props.entry.response.responseBody.trim().length > 0;
});

const formattedRequestBody = computed(() => {
  if (!hasRequestBody.value || !props.entry) return '';
  try {
    const parsed = JSON.parse(props.entry.request.requestBody!);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return props.entry.request.requestBody!;
  }
});

const formattedResponseBody = computed(() => {
  if (!hasResponseBody.value || !props.entry?.response?.responseBody) return '';
  try {
    const parsed = JSON.parse(props.entry.response.responseBody);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return props.entry.response.responseBody;
  }
});

// Compute duration from timestamps
const duration = computed(() => {
  if (!props.entry?.response) return 0;
  return props.entry.response.timestamp - props.entry.request.timestamp;
});

// Compute size from response body
const responseSize = computed(() => {
  if (!props.entry?.response?.responseBody) return 0;
  return new Blob([props.entry.response.responseBody]).size;
});

function formatHeaders(headers: Record<string, string>): Array<{ key: string; value: string }> {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}

async function copyRequestData(): Promise<void> {
  if (!props.entry) return;
  const data = {
    url: props.entry.request.url,
    method: props.entry.request.method,
    headers: props.entry.request.headers,
    body: props.entry.request.requestBody,
  };
  await copyToClipboard(JSON.stringify(data, null, 2));
}

async function copyResponseData(): Promise<void> {
  if (!props.entry?.response) return;
  const data = {
    status: props.entry.response.status,
    statusText: props.entry.response.statusText,
    headers: props.entry.response.headers,
    body: props.entry.response.responseBody,
  };
  await copyToClipboard(JSON.stringify(data, null, 2));
}

function handleClose(): void {
  emit('close');
}
</script>

<template>
  <div v-if="entry" class="request-detail">
    <div class="detail-header">
      <h3>Request Details</h3>
      <button class="close-btn" @click="handleClose">×</button>
    </div>

    <div class="detail-metadata">
      <div class="metadata-item">
        <span class="label">URL:</span>
        <span class="value" :title="entry.request.url">{{ entry.request.url }}</span>
      </div>
      <div class="metadata-item">
        <span class="label">Method:</span>
        <span class="value">{{ entry.request.method }}</span>
      </div>
      <div class="metadata-item">
        <span class="label">Status:</span>
        <span class="value">{{ entry.response?.status ?? 'Pending' }} {{ entry.response?.statusText ?? '' }}</span>
      </div>
      <div class="metadata-item">
        <span class="label">Duration:</span>
        <span class="value">{{ formatDuration(duration) }}</span>
      </div>
      <div class="metadata-item">
        <span class="label">Size:</span>
        <span class="value">{{ formatBytes(responseSize) }}</span>
      </div>
    </div>

    <div class="detail-tabs">
      <button
        :class="['tab', { active: activeTab === 'request' }]"
        @click="activeTab = 'request'"
      >
        Request
      </button>
      <button
        :class="['tab', { active: activeTab === 'response' }]"
        @click="activeTab = 'response'"
      >
        Response
      </button>
    </div>

    <div class="detail-content">
      <div v-if="activeTab === 'request'" class="tab-content">
        <div class="section">
          <div class="section-header">
            <h4>Headers</h4>
            <button class="copy-btn" @click="copyRequestData">Copy Request</button>
          </div>
          <div class="headers-list">
            <div
              v-for="header in formatHeaders(entry.request.headers)"
              :key="header.key"
              class="header-item"
            >
              <span class="header-key">{{ header.key }}:</span>
              <span class="header-value">{{ header.value }}</span>
            </div>
          </div>
        </div>

        <div v-if="hasRequestBody" class="section">
          <h4>Body</h4>
          <pre class="code-block">{{ formattedRequestBody }}</pre>
        </div>
        <div v-else class="section">
          <p class="no-data">No request body</p>
        </div>
      </div>

      <div v-if="activeTab === 'response'" class="tab-content">
        <div v-if="entry.response" class="section">
          <div class="section-header">
            <h4>Headers</h4>
            <button class="copy-btn" @click="copyResponseData">Copy Response</button>
          </div>
          <div class="headers-list">
            <div
              v-for="header in formatHeaders(entry.response.headers)"
              :key="header.key"
              class="header-item"
            >
              <span class="header-key">{{ header.key }}:</span>
              <span class="header-value">{{ header.value }}</span>
            </div>
          </div>
        </div>
        <div v-else class="section">
          <p class="no-data">Response pending...</p>
        </div>

        <div v-if="entry.response && hasResponseBody" class="section">
          <h4>Body</h4>
          <pre class="code-block">{{ formattedResponseBody }}</pre>
        </div>
        <div v-else-if="entry.response" class="section">
          <p class="no-data">No response body</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.detail-metadata {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
}

.metadata-item {
  display: flex;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.metadata-item:last-child {
  margin-bottom: 0;
}

.metadata-item .label {
  font-weight: 600;
  min-width: 70px;
  color: #999;
}

.metadata-item .value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.tab.active {
  border-bottom-color: #646cff;
  background-color: rgba(100, 108, 255, 0.1);
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
}

.copy-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  background-color: rgba(100, 108, 255, 0.2);
  border: 1px solid rgba(100, 108, 255, 0.4);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover {
  background-color: rgba(100, 108, 255, 0.3);
  border-color: rgba(100, 108, 255, 0.6);
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.header-item {
  display: flex;
  gap: 0.5rem;
}

.header-key {
  font-weight: 600;
  color: #2196f3;
  min-width: 150px;
}

.header-value {
  flex: 1;
  word-break: break-all;
  color: #ccc;
}

.code-block {
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-data {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 2rem;
  margin: 0;
}
</style>
