<template>
  <div class="method-badge" :class="getMethodClass(method)">{{ method }}</div>
</template>

<script setup lang="ts">
import type { HttpMethod } from '@/lib/types/capture';

interface Props {
  method: HttpMethod;
}

const props = defineProps<Props>();

function getMethodClass(method: HttpMethod): string {
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
</script>

<style scoped>
.method-badge {
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

.method-get {
  background-color: #2196f3;
  color: #b8e986;
  border: 1px solid #2196f3;
}

.method-post {
  background-color: #1b5e20;
  color: #4caf50;
  border: 1px solid #1b5e20;
}

.method-put {
  background-color: #3f51b5;
  color: #d1e7dd;
  border: 1px solid #3f51b5;
}

.method-delete {
  background-color: #e53935;
  color: #fce8e6;
  border: 1px solid #e53935;
}

.method-patch {
  background-color: #faa908;
  color: #e0d660;
  border: 1px solid #faa908;
}

.method-other {
  background-color: #7f8c8d;
  color: #5d5e6f;
  border: 1px solid #7f8c8d;
}
</style>
