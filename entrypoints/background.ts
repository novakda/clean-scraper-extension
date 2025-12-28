export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Listen for extension installation
  browser.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details.reason);
    if (details.reason === 'install') {
      console.log('First time installation!');
    }
  });

  // Listen for messages from popup or content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);
    sendResponse({ status: 'Message received by background worker' });
    return true; // Keep the message channel open for async response
  });

  console.log('Background service worker initialized successfully!');
});
