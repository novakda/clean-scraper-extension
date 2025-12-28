import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  dev: {
    // Automatically open browser with extension installed during development
    // See: https://wxt.dev/guide/essentials/config/browser-startup.html
  },
  manifest: {
    // Permissions for StreamFilter request/response capture (Firefox only)
    permissions: [
      'webRequest',
      'webRequestBlocking',
    ],
    host_permissions: [
      '<all_urls>',
    ],
  },
});
