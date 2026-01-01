<template>
  <div class="status-badge" :class="getStatusClass(status)">{{ status }}</div>
</template>

<script setup lang="ts">
interface Props {
  status: number;
}

const props = defineProps<Props>();

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
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
  border-radius: 3px;
  text-transform: uppercase;
  min-width: 50px;
  text-align: center;
}

.status-success {
  background-color: #1e985d;
  color: #b8e986;
  border: 1px solid #1e985d;
}

.status-redirect {
  background-color: #ff9800;
  color: #1565c0;
  border: 1px solid #ff9800;
}

.status-client-error {
  background-color: #f44336;
  color: #dcfce7;
  border: 1px solid #f44336;
}

.status-server-error {
  background-color: #f87171;
  color: #dc2626;
  border: 1px solid #f87171;
}

.status-other {
  background-color: #6b7280;
  color: #9ca3af;
  border: 1px solid #6b7280;
}
</style>
