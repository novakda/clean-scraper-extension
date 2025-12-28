/**
 * In-memory storage service for captured HTTP requests/responses
 */

import type {
  CapturedEntry,
  CapturedRequest,
  CapturedResponse,
  CaptureStats,
} from './request-capture';
import { getConfig } from './config';

/**
 * In-memory storage using Map for O(1) lookups
 */
class CaptureStorage {
  private entries: Map<string, CapturedEntry>;
  private insertionOrder: string[]; // Track insertion order for pruning

  constructor() {
    this.entries = new Map();
    this.insertionOrder = [];
  }

  /**
   * Add a new captured entry
   */
  addEntry(entry: CapturedEntry): void {
    const config = getConfig();

    // Add to storage
    this.entries.set(entry.id, entry);
    this.insertionOrder.push(entry.id);

    console.log(`[Storage] Added entry ${entry.id}, total entries: ${this.entries.size}`);

    // Auto-prune if we exceed max entries
    if (this.entries.size > config.maxEntries) {
      this.prune(config.maxEntries);
    }
  }

  /**
   * Update an existing entry
   */
  updateEntry(id: string, updates: Partial<CapturedEntry>): boolean {
    const entry = this.entries.get(id);
    if (!entry) {
      console.warn(`[Storage] Entry ${id} not found for update`);
      return false;
    }

    const updated: CapturedEntry = {
      ...entry,
      ...updates,
      updatedAt: Date.now(),
    };

    this.entries.set(id, updated);
    console.log(`[Storage] Updated entry ${id}`);
    return true;
  }

  /**
   * Update entry with response data
   */
  addResponse(id: string, response: CapturedResponse): boolean {
    return this.updateEntry(id, {
      response,
      status: 'completed',
    });
  }

  /**
   * Mark entry as error
   */
  markAsError(id: string, error: string): boolean {
    return this.updateEntry(id, {
      status: 'error',
      error,
    });
  }

  /**
   * Get all captured entries
   */
  getAll(): CapturedEntry[] {
    // Return in insertion order (newest first)
    return this.insertionOrder
      .slice()
      .reverse()
      .map(id => this.entries.get(id))
      .filter((entry): entry is CapturedEntry => entry !== undefined);
  }

  /**
   * Get entry by ID
   */
  getById(id: string): CapturedEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get entries matching a filter
   */
  filter(predicate: (entry: CapturedEntry) => boolean): CapturedEntry[] {
    return this.getAll().filter(predicate);
  }

  /**
   * Get entries by URL pattern
   */
  getByUrlPattern(pattern: string): CapturedEntry[] {
    const regex = new RegExp(pattern, 'i');
    return this.filter(entry => regex.test(entry.request.url));
  }

  /**
   * Get entries by HTTP method
   */
  getByMethod(method: string): CapturedEntry[] {
    return this.filter(entry => entry.request.method === method.toUpperCase());
  }

  /**
   * Get entries by status
   */
  getByStatus(status: 'pending' | 'completed' | 'error'): CapturedEntry[] {
    return this.filter(entry => entry.status === status);
  }

  /**
   * Get entries by HTTP status code
   */
  getByStatusCode(statusCode: number): CapturedEntry[] {
    return this.filter(entry => entry.response?.status === statusCode);
  }

  /**
   * Get entries within a time range
   */
  getByTimeRange(startTime: number, endTime: number): CapturedEntry[] {
    return this.filter(
      entry => entry.createdAt >= startTime && entry.createdAt <= endTime
    );
  }

  /**
   * Clear all entries
   */
  clear(): void {
    const count = this.entries.size;
    this.entries.clear();
    this.insertionOrder = [];
    console.log(`[Storage] Cleared ${count} entries`);
  }

  /**
   * Prune old entries to stay within limit
   */
  prune(maxEntries: number): void {
    const currentSize = this.entries.size;
    if (currentSize <= maxEntries) {
      return;
    }

    const entriesToRemove = currentSize - maxEntries;
    console.log(`[Storage] Pruning ${entriesToRemove} old entries`);

    // Remove oldest entries
    for (let i = 0; i < entriesToRemove; i++) {
      const oldestId = this.insertionOrder.shift();
      if (oldestId) {
        this.entries.delete(oldestId);
      }
    }

    console.log(`[Storage] After pruning: ${this.entries.size} entries`);
  }

  /**
   * Get storage statistics
   */
  getStats(): CaptureStats {
    const all = Array.from(this.entries.values());
    const completed = all.filter(e => e.status === 'completed');
    const pending = all.filter(e => e.status === 'pending');
    const errors = all.filter(e => e.status === 'error');

    // Calculate total data size
    let totalDataSize = 0;
    for (const entry of all) {
      if (entry.response?.bodySize) {
        totalDataSize += entry.response.bodySize;
      }
    }

    // Get last capture time
    const lastCaptureTime = all.length > 0
      ? Math.max(...all.map(e => e.updatedAt))
      : undefined;

    return {
      totalEntries: all.length,
      completedEntries: completed.length,
      pendingEntries: pending.length,
      errorEntries: errors.length,
      totalDataSize,
      lastCaptureTime,
    };
  }

  /**
   * Get memory usage estimate (in bytes)
   */
  getMemoryUsage(): number {
    let size = 0;
    for (const entry of this.entries.values()) {
      // Rough estimate: JSON string length * 2 (for UTF-16)
      size += JSON.stringify(entry).length * 2;
    }
    return size;
  }

  /**
   * Check if storage is near capacity
   */
  isNearCapacity(): boolean {
    const config = getConfig();
    return this.entries.size >= config.maxEntries * 0.9; // 90% full
  }

  /**
   * Get storage size info
   */
  getSizeInfo(): {
    current: number;
    max: number;
    percentage: number;
    nearCapacity: boolean;
  } {
    const config = getConfig();
    const current = this.entries.size;
    const max = config.maxEntries;
    const percentage = (current / max) * 100;

    return {
      current,
      max,
      percentage,
      nearCapacity: this.isNearCapacity(),
    };
  }
}

/**
 * Singleton instance of storage
 */
const storage = new CaptureStorage();

/**
 * Export storage methods as functions
 */
export function addEntry(entry: CapturedEntry): void {
  return storage.addEntry(entry);
}

export function updateEntry(id: string, updates: Partial<CapturedEntry>): boolean {
  return storage.updateEntry(id, updates);
}

export function addResponse(id: string, response: CapturedResponse): boolean {
  return storage.addResponse(id, response);
}

export function markAsError(id: string, error: string): boolean {
  return storage.markAsError(id, error);
}

export function getAll(): CapturedEntry[] {
  return storage.getAll();
}

export function getById(id: string): CapturedEntry | undefined {
  return storage.getById(id);
}

export function filter(predicate: (entry: CapturedEntry) => boolean): CapturedEntry[] {
  return storage.filter(predicate);
}

export function getByUrlPattern(pattern: string): CapturedEntry[] {
  return storage.getByUrlPattern(pattern);
}

export function getByMethod(method: string): CapturedEntry[] {
  return storage.getByMethod(method);
}

export function getByStatus(status: 'pending' | 'completed' | 'error'): CapturedEntry[] {
  return storage.getByStatus(status);
}

export function getByStatusCode(statusCode: number): CapturedEntry[] {
  return storage.getByStatusCode(statusCode);
}

export function getByTimeRange(startTime: number, endTime: number): CapturedEntry[] {
  return storage.getByTimeRange(startTime, endTime);
}

export function clear(): void {
  return storage.clear();
}

export function prune(maxEntries: number): void {
  return storage.prune(maxEntries);
}

export function getStats(): CaptureStats {
  return storage.getStats();
}

export function getMemoryUsage(): number {
  return storage.getMemoryUsage();
}

export function isNearCapacity(): boolean {
  return storage.isNearCapacity();
}

export function getSizeInfo() {
  return storage.getSizeInfo();
}
