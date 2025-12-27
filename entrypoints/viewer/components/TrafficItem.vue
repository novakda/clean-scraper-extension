<script setup lang="ts">
import type { TrafficData } from '@/utils/types';

const props = defineProps<{
  traffic: TrafficData;
}>();

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function getDetailsText(item: TrafficData): string {
  if (item.type === 'request') {
    return `REQUEST - ${item.method}`;
  } else {
    return `RESPONSE - ${item.status} - ${item.mimeType}`;
  }
}
</script>

<template>
  <div :class="['traffic-item', traffic.type]">
    <div class="traffic-header">
      <div class="url">{{ traffic.url }}</div>
      <div class="timestamp">{{ formatTimestamp(traffic.timestamp) }}</div>
    </div>
    <div class="details">{{ getDetailsText(traffic) }}</div>
  </div>
</template>

<style scoped>
.traffic-item {
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.traffic-item:hover {
  background: #f9f9f9;
}

.traffic-item.request {
  border-left: 3px solid #2196F3;
}

.traffic-item.response {
  border-left: 3px solid #4CAF50;
}

.traffic-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.url {
  font-weight: 500;
  color: #333;
  word-break: break-all;
  flex: 1;
  margin-right: 16px;
}

.timestamp {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.details {
  font-size: 12px;
  color: #666;
}
</style>
