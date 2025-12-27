import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],

  manifest: {
    name: 'Network Traffic Capturer',
    description: 'Captures network requests and responses for specified URL patterns',
    permissions: [
      'storage',
      'webRequest',
      'webRequestBlocking',
      'tabs'
    ],
    host_permissions: ['<all_urls>'],

    // Browser-specific configurations
    browser_specific_settings: {
      gecko: {
        // Firefox-specific settings (for StreamFilter API)
        strict_min_version: '57.0'
      }
    }
  },

  webExt: {
    firefoxProfile: 'dev',
    keepProfileChanges: true,
  },
});
