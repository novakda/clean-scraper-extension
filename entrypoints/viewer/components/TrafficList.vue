<script setup lang="ts">
import type { TrafficData } from '@/utils/types';
import TrafficItem from './TrafficItem.vue';

defineProps<{
  traffic: TrafficData[];
}>();

defineEmits<{
  showDetails: [id: number];
}>();
</script>

<template>
  <div class="traffic-list">
    <div v-if="traffic.length === 0" class="empty-state">
      No traffic captured yet. Browse the web to start capturing!
    </div>

    <TrafficItem
      v-for="item in traffic"
      :key="item.id"
      :traffic="item"
      @click="$emit('showDetails', item.id!)"
    />
  </div>
</template>

<style scoped>
.traffic-list {
  max-height: 70vh;
  overflow-y: auto;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>
