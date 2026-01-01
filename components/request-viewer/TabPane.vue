<template>
  <button
    :class="{ active: activeTab === 'request', 'tab-btn': activeTab === 'response' }"
    @click="activeTab = 'request'"
    :disabled="activeTab === 'request'"
  >
    Request
  </button>
  <button
    :class="{ active: activeTab === 'request', 'tab-btn': activeTab === 'response' }"
    @click="activeTab = 'response'"
    :disabled="activeTab === 'response'"
  >
    Response
  </button>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

interface Props {
  initialTab?: 'request' | 'response';
}

interface Emits {
  (e: 'switch-tab', tab: 'request' | 'response'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeTab = defineModel(() => props.initialTab || 'request');

function switchTab(tab: 'request' | 'response'): void {
  activeTab.value = tab;
  emit('switch-tab', tab);
}
</script>

<style scoped>
.tab-buttons {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid rgba(100, 108, 255, 0.1);
  background: rgba(0, 0, 0, 0);
  cursor: pointer;
  transition: all 0.15s;
  color: #999;
}

.tab-btn:hover:not(:disabled) {
  background: rgba(100, 108, 255, 0.15);
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-btn.active {
  background: #646cff;
  color: white;
  border-color: #646cff;
}
</style>
