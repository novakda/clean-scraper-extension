/**
 * In-memory storage implementation for captured HTTP requests/responses
 */

import type {
  CapturedEntry,
} from '../types/capture';
import type {
  ICaptureStorage,
} from '../types/storage';
import type { CaptureStats } from '../types/capture';
import type { CaptureConfig } from '../config';

interface PendingRequestInfo {
  entryId: string;
  contentType?: string;
}

/**
 * In-memory storage using Map for O(1) lookups
 */
export class InMemoryStorage implements ICaptureStorage {
  private entries: Map<string, CapturedEntry>;
  private insertionOrder: string[];
  private maxEntries: number;

  constructor(maxEntries: number = 100) {
    this.entries = new Map();
    this.insertionOrder = [];
    this.maxEntries = maxEntries;
  }

  addEntry(entry: CapturedEntry): void {
    this.entries.set(entry.id, entry);
    this.insertionOrder.push(entry.id);
    this.prune(this.maxEntries);
  }

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
    return true;
  }

  addResponse(id: string, response: import('../types/capture').CapturedResponse): boolean {
    return this.updateEntry(id, { response, status: 'completed' });
  }

  markAsError(id: string, error: string): boolean {
    return this.updateEntry(id, {
      error,
      status: 'error',
    });
  }

  getAll(): CapturedEntry[] {
    return this.insertionOrder
      .slice()
      .reverse()
      .map(id => this.entries.get(id))
      .filter((entry): entry is CapturedEntry => entry !== undefined);
  }

  getById(id: string): CapturedEntry | undefined {
    return this.entries.get(id);
  }

  filter(predicate: (entry: CapturedEntry) => boolean): CapturedEntry[] {
    return this.getAll().filter(predicate);
  }

  getByUrlPattern(pattern: string): CapturedEntry[] {
    const regex = new RegExp(pattern, 'i');
    return this.filter(entry => regex.test(entry.request.url));
  }

  getByMethod(method: string): CapturedEntry[] {
    return this.filter(entry => entry.request.method === method.toUpperCase());
  }

  getByStatus(status: import('../types/capture').CaptureEntryStatus): CapturedEntry[] {
    return this.filter(entry => entry.status === status);
  }

  getByStatusCode(statusCode: number): CapturedEntry[] {
    return this.filter(entry => entry.response?.status === statusCode);
  }

  getByTimeRange(startTime: number, endTime: number): CapturedEntry[] {
    return this.filter(
      entry => entry.createdAt >= startTime && entry.createdAt <= endTime
    );
  }

  clear(): void {
    const count = this.entries.size;
    this.entries.clear();
    this.insertionOrder = [];
    console.log(`[Storage] Cleared ${count} entries`);
  }

  prune(maxEntries: number): void {
    if (this.insertionOrder.length <= maxEntries) {
      return;
    }

    const entriesToRemove = this.insertionOrder.length - maxEntries;
    for (let i = 0; i < entriesToRemove; i++) {
      const oldestId = this.insertionOrder.shift()!;
      this.entries.delete(oldestId);
    }

    console.log(`[Storage] Pruned ${entriesToRemove} entries, ${this.entries.size} remaining`);
  }

  getStats(): CaptureStats {
    const all = Array.from(this.entries.values());
    const completed = all.filter(e => e.status === 'completed');
    const pending = all.filter(e => e.status === 'pending');
    const errors = all.filter(e => e.status === 'error');

    let totalDataSize = 0;
    for (const entry of all) {
      if (entry.response?.bodySize) {
        totalDataSize += entry.response.bodySize;
      }
    }

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

  isNearCapacity(): boolean {
    return this.entries.size >= this.maxEntries * 0.9;
  }

  getSizeInfo() {
    const current = this.entries.size;
    const max = this.maxEntries;
    const percentage = (current / max) * 100;

    return {
      current,
      max,
      percentage,
      nearCapacity: this.isNearCapacity(),
    };
  }
}
