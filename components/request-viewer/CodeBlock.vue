<template>
  <div class="code-block" :class="{ 'binary': isBinary }">
    <pre><code>{{ content }}</code></pre>
    <div v-if="isBinary" class="binary-warning">Binary content (not displayed)</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  content: string;
  language?: string;
}

const props = defineProps<Props>();

const isBinary = computed(() => {
  if (!props.language) return false;
  return !props.language.startsWith('text/') && !props.language.includes('json');
});
</script>

<style scoped>
.code-block {
  background: #1e1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 1rem;
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  overflow: auto;
  white-space: pre;
  line-height: 1.5;
}

.code-block code {
  color: #d4d4d4;
}

.binary-warning {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}
</style>
