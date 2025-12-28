<script lang="ts" setup>
import { ref, watch } from 'vue';

// Define RequestFilters interface locally since it's UI-specific
interface RequestFilters {
  urlPattern: string;
  method: string;
  statusCode: string;
}

interface Emits {
  (e: 'update', filters: RequestFilters): void;
}

const emit = defineEmits<Emits>();

const urlPattern = ref('');
const method = ref('');
const statusCode = ref('');

const httpMethods = [
  { value: '', label: 'All Methods' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'OPTIONS', label: 'OPTIONS' },
  { value: 'HEAD', label: 'HEAD' },
];

// Emit filter updates whenever any filter changes
watch([urlPattern, method, statusCode], () => {
  emit('update', {
    urlPattern: urlPattern.value,
    method: method.value,
    statusCode: statusCode.value,
  });
});

function clearFilters(): void {
  urlPattern.value = '';
  method.value = '';
  statusCode.value = '';
}
</script>

<template>
  <div class="request-filter">
    <div class="filter-group">
      <label for="url-filter">URL Pattern</label>
      <input
        id="url-filter"
        v-model="urlPattern"
        type="text"
        placeholder="Filter by URL (e.g., api.example.com)"
        class="filter-input"
      />
    </div>

    <div class="filter-group">
      <label for="method-filter">HTTP Method</label>
      <select id="method-filter" v-model="method" class="filter-select">
        <option v-for="m in httpMethods" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label for="status-filter">Status Code</label>
      <input
        id="status-filter"
        v-model="statusCode"
        type="text"
        placeholder="e.g., 200, 404"
        class="filter-input"
      />
    </div>

    <div class="filter-actions">
      <button class="clear-btn" @click="clearFilters">Clear Filters</button>
    </div>
  </div>
</template>

<style scoped>
.request-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
}

.filter-input,
.filter-select {
  padding: 0.5rem;
  font-size: 0.875rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: inherit;
  font-family: inherit;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #646cff;
  background-color: rgba(0, 0, 0, 0.3);
}

.filter-input::placeholder {
  color: #666;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.clear-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.clear-btn:hover {
  background-color: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.6);
}
</style>
