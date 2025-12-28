<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { CaptureConfig, CaptureStats } from '@/utils/types';
import { LogLevel } from '@/utils/logger';

const config = ref<CaptureConfig>({
  enabled: true,
  urlPatterns: ['*://example.com/*'],
  advanced: {
    allowedStatusCodes: [200, 206],
    requireContentType: true,
    captureRedirects: false,
    captureErrors: false,
    minBodySize: 0,
    maxBodySize: 10 * 1024 * 1024
  },
  debug: {
    logLevel: LogLevel.WARN,
    logFilteredRequests: false
  }
});

const trafficCount = ref(0);
const recentTraffic = ref<any[]>([]);
const saving = ref(false);
const stats = ref<CaptureStats>({
  totalCaptured: 0,
  totalFiltered: 0,
  lastCapturedUrl: null,
  lastFilteredUrl: null,
  lastFilterReason: null,
  isCapturing: false
});

let statsInterval: number | null = null;

async function loadConfig() {
  const cfg = await browser.runtime.sendMessage({ action: 'getConfig' });
  config.value = cfg as CaptureConfig;
}

async function loadTrafficCount() {
  const traffic = await browser.runtime.sendMessage({ action: 'getAllTraffic' });
  const allTraffic = traffic as any[];
  trafficCount.value = allTraffic.length;

  // Get the last 5 requests for diagnostic display
  recentTraffic.value = allTraffic
    .filter(t => t.type === 'request' || t.type === 'response')
    .slice(-10)
    .reverse();
}

async function loadStats() {
  const result = await browser.runtime.sendMessage({ action: 'getCaptureStats' });
  stats.value = result as CaptureStats;
}

async function saveConfig() {
  saving.value = true;
  try {
    await browser.runtime.sendMessage({
      action: 'saveConfig',
      config: config.value
    });
    await new Promise(resolve => setTimeout(resolve, 500));
  } finally {
    saving.value = false;
  }
}

async function clearTraffic() {
  if (!confirm('Clear all captured traffic data?')) return;

  await browser.runtime.sendMessage({ action: 'clearTraffic' });
  trafficCount.value = 0;
  recentTraffic.value = [];
}

function openViewer() {
  browser.tabs.create({
    url: browser.runtime.getURL('/viewer.html')
  });
}

function addPattern() {
  config.value.urlPatterns.push('');
}

function removePattern(index: number) {
  config.value.urlPatterns.splice(index, 1);
}

const statusCodesInput = computed({
  get: () => config.value.advanced?.allowedStatusCodes.join(', ') || '200, 206',
  set: (value: string) => {
    const codes = value.split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n >= 100 && n < 600);
    if (config.value.advanced) {
      config.value.advanced.allowedStatusCodes = codes.length > 0 ? codes : [200, 206];
    }
  }
});

onMounted(async () => {
  await loadConfig();
  await loadTrafficCount();
  await loadStats();

  // Poll stats every 2 seconds
  statsInterval = setInterval(loadStats, 2000) as unknown as number;
});

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
});
</script>

<template>
  <div class="popup" data-testid="popup-container">
    <div class="header">
      <h1>Network Traffic Capturer</h1>
      <div class="status">
        <span
          class="badge"
          :class="{ active: config.enabled }"
          data-testid="capture-status-badge"
          :data-status="config.enabled ? 'active' : 'inactive'"
        >
          {{ config.enabled ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>

    <div class="content">
      <div class="section status-section">
        <h2>Capture Status</h2>
        <div class="status-grid">
          <div class="status-item success">
            <span class="status-label">Captured</span>
            <span
              class="status-value"
              data-testid="total-captured"
              :data-count="stats.totalCaptured"
            >
              {{ stats.totalCaptured }}
            </span>
          </div>
          <div class="status-item warning">
            <span class="status-label">Filtered</span>
            <span
              class="status-value"
              data-testid="total-filtered"
              :data-count="stats.totalFiltered"
            >
              {{ stats.totalFiltered }}
            </span>
          </div>
        </div>

        <div
          v-if="stats.lastCapturedUrl"
          class="last-activity"
          data-testid="last-captured"
        >
          <div class="activity-label">Last captured:</div>
          <div
            class="activity-url"
            data-testid="last-captured-url"
            :data-url="stats.lastCapturedUrl"
          >
            {{ stats.lastCapturedUrl }}
          </div>
        </div>

        <div
          v-if="stats.lastFilteredUrl"
          class="last-activity warning"
          data-testid="last-filtered"
        >
          <div class="activity-label">Last filtered:</div>
          <div
            class="activity-url"
            data-testid="last-filtered-url"
            :data-url="stats.lastFilteredUrl"
          >
            {{ stats.lastFilteredUrl }}
          </div>
          <div
            v-if="stats.lastFilterReason"
            class="activity-reason"
            data-testid="last-filter-reason"
          >
            {{ stats.lastFilterReason }}
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Captured Traffic</h2>
        <div class="stats">
          <div class="stat-item">
            <span
              class="stat-value"
              data-testid="traffic-count"
              :data-count="trafficCount"
            >
              {{ trafficCount }}
            </span>
            <span class="stat-label">requests captured</span>
          </div>
        </div>
        <div class="actions">
          <button
            @click="openViewer"
            class="btn btn-primary"
            data-testid="view-traffic-btn"
          >
            View Traffic
          </button>
          <button
            @click="clearTraffic"
            class="btn btn-secondary"
            data-testid="clear-traffic-btn"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- Diagnostic: Recent Captures -->
      <div v-if="recentTraffic.length > 0" class="section diagnostic-section">
        <h2>Recent Captures (Last 10)</h2>
        <div class="recent-traffic" data-testid="recent-traffic-list">
          <div
            v-for="(item, index) in recentTraffic"
            :key="index"
            class="traffic-item"
            :data-testid="`traffic-item-${index}`"
            :data-type="item.type"
            :data-url="item.url"
            :data-method="item.method"
            :data-status="item.status"
          >
            <div class="traffic-type" :class="item.type">
              {{ item.type === 'request' ? 'REQ' : 'RES' }}
            </div>
            <div class="traffic-details">
              <div class="traffic-method-status">
                <span v-if="item.method" class="method">{{ item.method }}</span>
                <span v-if="item.status" class="status">{{ item.status }}</span>
              </div>
              <div class="traffic-url" :title="item.url">
                {{ item.url }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Diagnostic: Current Config -->
      <div class="section diagnostic-section">
        <h2>Current Config (Diagnostic)</h2>
        <div class="config-display" data-testid="config-display">
          <div class="config-item">
            <span class="config-label">Enabled:</span>
            <span class="config-value" data-testid="config-enabled">{{ config.enabled }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">Status Codes:</span>
            <span class="config-value" data-testid="config-status-codes">
              {{ config.advanced?.allowedStatusCodes.join(', ') }}
            </span>
          </div>
          <div class="config-item">
            <span class="config-label">Require Content-Type:</span>
            <span class="config-value" data-testid="config-require-content-type">
              {{ config.advanced?.requireContentType }}
            </span>
          </div>
          <div class="config-item">
            <span class="config-label">URL Patterns:</span>
            <span class="config-value" data-testid="config-url-patterns">
              {{ config.urlPatterns.join(', ') }}
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>URL Patterns</h2>
        <div class="patterns" data-testid="url-patterns-list">
          <div
            v-for="(pattern, index) in config.urlPatterns"
            :key="index"
            class="pattern-item"
            :data-testid="`pattern-item-${index}`"
          >
            <input
              v-model="config.urlPatterns[index]"
              type="text"
              placeholder="*://example.com/*"
              class="pattern-input"
              :data-testid="`pattern-input-${index}`"
            />
            <button
              @click="removePattern(index)"
              class="btn-icon"
              title="Remove"
              :data-testid="`remove-pattern-${index}`"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          @click="addPattern"
          class="btn btn-small"
          data-testid="add-pattern-btn"
        >
          + Add Pattern
        </button>
      </div>

      <div class="section">
        <h2>Debug Settings</h2>
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="config.debug!.logFilteredRequests"
          />
          <span>Log filtered requests to console</span>
        </label>

        <div class="form-group">
          <label>Log Level</label>
          <select v-model="config.debug!.logLevel" class="select">
            <option :value="0">Debug (All messages)</option>
            <option :value="1">Info</option>
            <option :value="2">Warnings only</option>
            <option :value="3">Errors only</option>
            <option :value="4">Off</option>
          </select>
        </div>

        <div class="help-text">
          Enable debug logging and check the browser console
          (Ctrl+Shift+J / Cmd+Option+J) for detailed capture information.
        </div>
      </div>

      <div class="section">
        <h2>Advanced Filtering</h2>

        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="config.advanced!.requireContentType"
          />
          <span>Require Content-Type header</span>
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="config.advanced!.captureRedirects"
          />
          <span>Capture 3xx redirects</span>
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="config.advanced!.captureErrors"
          />
          <span>Capture 4xx/5xx errors</span>
        </label>

        <div class="form-group">
          <label>Allowed Status Codes (comma-separated)</label>
          <input
            type="text"
            v-model="statusCodesInput"
            placeholder="200, 201, 206"
            class="pattern-input"
          />
        </div>
      </div>

      <div class="section">
        <button
          @click="saveConfig"
          :disabled="saving"
          class="btn btn-primary btn-block"
          data-testid="save-config-btn"
          :data-saving="saving"
        >
          {{ saving ? 'Saving...' : 'Save Configuration' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255,255,255,0.2);
}

.badge.active {
  background: rgba(76, 217, 100, 0.9);
}

.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.section {
  margin-bottom: 20px;
}

.section h2 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.actions {
  display: flex;
  gap: 8px;
}

.patterns {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.pattern-item {
  display: flex;
  gap: 8px;
}

.pattern-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.pattern-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-secondary {
  background: #e9ecef;
  color: #333;
  flex: 1;
}

.btn-secondary:hover:not(:disabled) {
  background: #dee2e6;
}

.btn-small {
  padding: 6px 12px;
  background: #f8f9fa;
  color: #667eea;
  font-size: 12px;
}

.btn-small:hover {
  background: #e9ecef;
}

.btn-block {
  width: 100%;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #fee;
  border-color: #fcc;
  color: #f44;
}

.status-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.status-item {
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.status-item.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.status-item.warning {
  background: #fff3cd;
  border: 1px solid #ffeeba;
}

.status-label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.status-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.last-activity {
  margin-top: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 11px;
}

.last-activity.warning {
  background: #fff3cd;
}

.activity-label {
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
}

.activity-url {
  color: #333;
  word-break: break-all;
  font-family: monospace;
  font-size: 10px;
}

.activity-reason {
  color: #856404;
  font-style: italic;
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
}

.select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: #667eea;
}

.help-text {
  margin-top: 12px;
  padding: 8px;
  background: #e7f3ff;
  border-left: 3px solid #667eea;
  border-radius: 4px;
  font-size: 11px;
  color: #555;
  line-height: 1.4;
}

/* Diagnostic Sections */
.diagnostic-section {
  background: #f0f8ff;
  border: 1px dashed #667eea;
  border-radius: 8px;
  padding: 12px;
}

.diagnostic-section h2 {
  color: #667eea;
  font-size: 12px;
}

/* Recent Traffic List */
.recent-traffic {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.traffic-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  font-size: 11px;
}

.traffic-type {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 700;
  font-size: 10px;
}

.traffic-type.request {
  background: #e3f2fd;
  color: #1976d2;
}

.traffic-type.response {
  background: #e8f5e9;
  color: #388e3c;
}

.traffic-details {
  flex: 1;
  min-width: 0;
}

.traffic-method-status {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.traffic-method-status .method {
  font-weight: 600;
  color: #1976d2;
}

.traffic-method-status .status {
  font-weight: 600;
  color: #388e3c;
}

.traffic-url {
  font-family: monospace;
  font-size: 10px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Config Display */
.config-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  background: white;
  border-radius: 4px;
  font-size: 11px;
}

.config-label {
  font-weight: 600;
  color: #666;
  min-width: 140px;
}

.config-value {
  font-family: monospace;
  color: #333;
  word-break: break-all;
}
</style>
