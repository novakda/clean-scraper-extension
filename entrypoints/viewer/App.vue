<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { TrafficData } from '@/utils/types';
import TrafficList from './components/TrafficList.vue';
import TrafficDetailModal from './components/TrafficDetailModal.vue';

const allTraffic = ref<TrafficData[]>([]);
const selectedTraffic = ref<TrafficData | null>(null);
const showModal = ref(false);

async function loadTraffic() {
  const response = await browser.runtime.sendMessage({
    action: 'getAllTraffic'
  });
  allTraffic.value = (response as TrafficData[])
    .sort((a, b) => b.timestamp - a.timestamp);
}

function showDetails(id: number) {
  const item = allTraffic.value.find(t => t.id === id);
  if (!item) return;

  selectedTraffic.value = item;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedTraffic.value = null;
}

onMounted(() => {
  loadTraffic();
});
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>Captured Network Traffic</h1>
    </div>

    <TrafficList
      :traffic="allTraffic"
      @show-details="showDetails"
    />

    <TrafficDetailModal
      v-if="showModal && selectedTraffic"
      :traffic="selectedTraffic"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.header h1 {
  margin: 0;
  font-size: 20px;
}
</style>
