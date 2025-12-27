/// <reference types="chrome" />
/// <reference types="@types/webextension-polyfill" />

// Declare browser as an alias for chrome with extended types
declare const browser: typeof chrome & {
  webRequest: typeof chrome.webRequest & {
    filterResponseData?: (requestId: string) => {
      ondata: ((event: { data: ArrayBuffer }) => void) | null;
      onstop: (() => void) | null;
      onerror: ((error: any) => void) | null;
      onstart: (() => void) | null;
      write(data: ArrayBuffer | Uint8Array): void;
      disconnect(): void;
      close(): void;
      suspend(): void;
      resume(): void;
      readonly status: string;
      readonly error: string;
    };
  };
};

// Re-export browser.runtime namespace for TypeScript
declare namespace browser {
  export import runtime = chrome.runtime;
  export import storage = chrome.storage;
  export import tabs = chrome.tabs;
  export import webRequest = chrome.webRequest;
}
