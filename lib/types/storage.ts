/**
 * Storage interface defining operations for storing and retrieving captured entries
 */

import type { CapturedEntry, CaptureStats } from './capture';

/**
 * Storage interface defining operations for storing and retrieving captured entries.
 * Enables dependency injection and storage backend swapping.
 */
export interface ICaptureStorage {
  /**
   * Add a new captured entry to storage
   * @param entry - The entry to add
   */
  addEntry(entry: CapturedEntry): void;

  /**
   * Update an existing entry with partial data
   * @param id - The entry ID to update
   * @param updates - Partial data to merge into existing entry
   * @returns true if entry was found and updated, false otherwise
   */
  updateEntry(id: string, updates: Partial<CapturedEntry>): boolean;

  /**
   * Add response data to an existing entry
   * @param id - The entry ID to add response to
   * @param response - The response data to add
   * @returns true if entry was found and updated, false otherwise
   */
  addResponse(id: string, response: import('./capture').CapturedResponse): boolean;

  /**
   * Mark an entry as error status
   * @param id - The entry ID to mark as error
   * @param error - The error message
   * @returns true if entry was found and updated, false otherwise
   */
  markAsError(id: string, error: string): boolean;

  /**
   * Get all captured entries (newest first)
   * @returns Array of all captured entries in insertion order (reversed)
   */
  getAll(): CapturedEntry[];

  /**
   * Get a specific entry by ID
   * @param id - The entry ID to retrieve
   * @returns The entry if found, undefined otherwise
   */
  getById(id: string): CapturedEntry | undefined;

  /**
   * Get entries matching a filter predicate
   * @param predicate - Function that returns true for entries to include
   * @returns Array of matching entries
   */
  filter(predicate: (entry: CapturedEntry) => boolean): CapturedEntry[];

  /**
   * Get entries with URL matching a pattern
   * @param pattern - URL pattern (regex or substring) to match
   * @returns Array of entries with matching URLs
   */
  getByUrlPattern(pattern: string): CapturedEntry[];

  /**
   * Get entries with specific HTTP method
   * @param method - The HTTP method (uppercase)
   * @returns Array of entries with matching method
   */
  getByMethod(method: string): CapturedEntry[];

  /**
   * Get entries with specific status
   * @param status - The status to filter by ('pending', 'completed', 'error')
   * @returns Array of entries with matching status
   */
  getByStatus(status: import('./capture').CaptureEntryStatus): CapturedEntry[];

  /**
   * Get entries with specific HTTP status code
   * @param statusCode - The HTTP status code
   * @returns Array of entries with matching response status code
   */
  getByStatusCode(statusCode: number): CapturedEntry[];

  /**
   * Get entries within a time range
   * @param startTime - Start timestamp (inclusive)
   * @param endTime - End timestamp (inclusive)
   * @returns Array of entries created within the range
   */
  getByTimeRange(startTime: number, endTime: number): CapturedEntry[];

  /**
   * Remove all entries from storage
   */
  clear(): void;

  /**
   * Remove old entries to stay within limit
   * @param maxEntries - Maximum number of entries to keep
   */
  prune(maxEntries: number): void;

  /**
   * Get storage statistics
   * @returns Statistics about captured entries
   */
  getStats(): CaptureStats;

  /**
   * Check if storage is near capacity (90% full)
   * @returns true if near capacity, false otherwise
   */
  isNearCapacity(): boolean;

  /**
   * Get storage size information
   * @returns Object with current count, max count, percentage, and near capacity flag
   */
  getSizeInfo(): SizeInfo;
}

/**
 * Storage size information for monitoring
 */
export interface SizeInfo {
  current: number;        // Current number of entries
  max: number;            // Maximum number of entries allowed
  percentage: number;      // Percentage of capacity used (0-100)
  nearCapacity: boolean;   // true if >= 90% full
}
