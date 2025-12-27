<script setup lang="ts">
import type { TrafficData } from '@/utils/types';

defineProps<{
  traffic: TrafficData;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('modal')) {
    emit('close');
  }
}
</script>

<template>
  <div class="modal" @click="handleBackdropClick">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Traffic Details</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="json-viewer">
          {{ JSON.stringify(traffic, null, 2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  flex: 1;
  margin: 50px;
  background: white;
  border-radius: 8px;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.json-viewer {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
