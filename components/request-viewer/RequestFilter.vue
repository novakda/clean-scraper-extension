<script setup lang="ts">
import { computed } from 'vue';
import type { CapturedEntry } from '@/lib/types/capture';

interface Props {
  requests: CapturedEntry[];
}

interface Filters {
  urlPattern: string;
  method: string;
  statusCode: string;
}

const props = defineProps<Props>();

// Reactive filter state
const filters = ref<Filters>({
  urlPattern: '',
  method: '',
  statusCode: '',
});

/**
 * Filter requests by all active filters
 */
const filteredRequests = computed((): CapturedEntry[] => {
  return props.requests.filter(entry => {
    const matchesUrl = !filters.value.urlPattern || entry.request.url.toLowerCase().includes(filters.value.urlPattern);
    const matchesMethod = !filters.value.method || entry.request.method === filters.value.method.toUpperCase();
    const matchesStatus = !filters.value.statusCode || entry.response?.status?.toString() === filters.value.statusCode;

    return matchesUrl && matchesMethod && matchesStatus;
  });
});

/**
 * Update filter values
 */
function updateFilters(newFilters: Partial<Filters>): void {
  Object.assign(filters.value, newFilters);
}

/**
 * Clear all filters
 */
function clearFilters(): void {
  filters.value = {
    urlPattern: '',
    method: '',
    statusCode: '',
  };
}

/**
 * Emit filter update to parent
 */
const emit = defineEmits<{
  update: (filters: Filters) => void;
}>();
</script>

<template>
  <div class="request-filter">
    <div class="filter-group">
      <label for="url-filter">URL Pattern</label>
      <input
        id="url-filter"
        v-model="filters.urlPattern"
        type="text"
        placeholder="e.g., api.example.com"
        class="filter-input"
        @input="updateFilters({ urlPattern: $event.target.value })"
      />
    </div>

    <div class="filter-group">
      <label for="method-filter">HTTP Method</label>
      <select
        id="method-filter"
        v-model="filters.method"
        class="filter-select"
        @input="updateFilters({ method: $event.target.value })"
      >
        <option value="">All Methods</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
        <option value="OPTIONS">OPTIONS</option>
        <option value="HEAD">HEAD</option>
        <option value="TRACE">TRACE</option>
      </select>
    </div>

    <div class="filter-group">
      <label for="status-filter">Status Code</label>
      <input
        id="status-filter"
        v-model="filters.statusCode"
        type="text"
        placeholder="e.g., 200"
        class="filter-input"
        @input="updateFilters({ statusCode: $event.target.value })"
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
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
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
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(100, 108, 255, 0.1);
  border-radius: 3px;
  color: inherit;
}

.filter-input:focus,
.filter-select:focus {
  outline: 2px solid rgba(100, 108, 255, 0.3);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.clear-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.1);
  color: white;
  transition: all 0.15s;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
