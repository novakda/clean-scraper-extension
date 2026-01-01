/**
 * Storage factory for creating storage instances based on configuration
 */

import type { ICaptureStorage } from './types/storage';
import type { CaptureConfig } from './types/capture';
import { InMemoryStorage } from './memory-storage';

interface StorageFactoryConfig extends CaptureConfig {
  storageType?: 'memory' | 'persistent';
}

export function createStorage(config: StorageFactoryConfig = 'memory'): ICaptureStorage {
  switch (config.storageType) {
    case 'memory':
      console.log('[StorageFactory] Creating in-memory storage');
      return new InMemoryStorage(config);
    case 'persistent':
      console.log('[StorageFactory] Persistent storage not yet implemented, falling back to in-memory');
      return new InMemoryStorage(config);
    default:
      console.log('[StorageFactory] Unknown storage type, using in-memory default');
      return new InMemoryStorage(config);
  }
}
