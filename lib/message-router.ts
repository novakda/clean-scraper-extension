import type { BackgroundMessage, BackgroundResponse, MessageHandler } from '../types/messages';
import type { StorageHandlerDependencies, CaptureHandlerDependencies } from '../messages';

export interface RouterDependencies {
  storageHandler: import('../handlers/storage-handler').StorageHandlerDependencies;
  captureHandler: import('../handlers/capture-handler').CaptureHandlerDependencies;
}

export interface MessageRouterDependencies {
  storageHandler: import('../handlers/storage-handler').StorageHandlerDependencies;
}

/**
 * Message router for handling runtime.onMessage events
 */
export interface MessageRouter {
  handle: (message: BackgroundMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => void | boolean;
  registerHandler: (type: string, handler: MessageHandler) => void;
}

export function createMessageRouter(deps: MessageRouterDependencies): MessageRouter {
  const handlers = new Map<string, MessageHandler>();

  const handle = (
    message: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): void | boolean => {
    console.log(`[MessageRouter] Received message:`, message.type);

    const handler = handlers.get(message.type);

    if (!handler) {
      console.warn(`[MessageRouter] No handler registered for message type:`, message.type);
      sendResponse({
        success: false,
        error: `Unknown message type: ${message.type}`,
      });
      return false;
    }

    try {
      const keepChannel = handler(message, sender, sendResponse);
      return keepChannel;
    } catch (error) {
      console.error('[MessageRouter] Error handling message:', message.type, error);
      sendResponse({
        success: false,
        error: `Error processing message: ${error.message}`,
      });
      return false;
    }
  };

  const registerHandler = (type: string, handler: MessageHandler): void => {
    console.log(`[MessageRouter] Registering handler for:`, type);
    handlers.set(type, handler);
  };

  return {
    handle,
    registerHandler,
  };
}
