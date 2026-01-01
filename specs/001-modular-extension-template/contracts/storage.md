# Storage Interface Contract

**Feature**: Modular Extension Template (001-modular-extension-template)
**Date**: 2025-12-31

## Overview

This document defines the `ICaptureStorage` interface that enables dependency injection for storage backend. All storage implementations (in-memory, persistent, future backends) MUST implement this interface.

## ICaptureStorage Interface

### Type Definition

```typescript
interface ICaptureStorage {
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
  addResponse(id: string, response: CapturedResponse): boolean;

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
  getByStatus(status: 'pending' | 'completed' | 'error'): CapturedEntry[];

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
```

---

## Related Types

### SizeInfo

Storage size information for monitoring.

```typescript
interface SizeInfo {
  current: number;        // Current number of entries
  max: number;            // Maximum number of entries allowed
  percentage: number;      // Percentage of capacity used (0-100)
  nearCapacity: boolean;   // true if >= 90% full
}
```

### CaptureStats

Aggregated statistics about captured requests.

```typescript
interface CaptureStats {
  totalEntries: number;       // Total number of entries
  completedEntries: number;   // Number of completed entries
  pendingEntries: number;    // Number of pending entries
  errorEntries: number;      // Number of error entries
  totalDataSize: number;     // Total size of all response data in bytes
  lastCaptureTime?: number;  // Timestamp of most recent capture
}
```

---

## Implementation Requirements

### In-Memory Storage (Default)

**File**: `lib/storage/memory-storage.ts`

**Data Structure**:
- Primary storage: `Map<string, CapturedEntry>` for O(1) lookups
- Insertion order: `string[]` array for maintaining order
- Entry limit: Configured via `CaptureConfig.maxEntries` (default: 100)

**Behavior**:
- **addEntry**: Adds to Map and array, triggers prune if over limit
- **updateEntry**: Updates in Map only
- **prune**: Removes oldest entries from both Map and array

**Advantages**:
- Fast lookups and updates
- No async operations
- Simple implementation

**Limitations**:
- Data lost on extension restart
- No persistence
- Memory-bound (entries stored in browser memory)

---

### Persistent Storage (Future)

**File**: `lib/storage/browser-storage.ts` (to be implemented)

**Data Structure**:
- Cache: `Map<string, CapturedEntry>` for in-memory lookups
- Persistent: `browser.storage.local` for persistence
- Sync strategy: Write-through (cache for reads, write to persistent for all operations)

**Behavior**:
- **addEntry**: Update both cache and persistent storage
- **updateEntry**: Update both cache and persistent storage
- **getAll**: Load from persistent storage on first call, use cache for subsequent calls
- **prune**: Remove from both cache and persistent storage

**Advantages**:
- Data persists across extension restarts
- Cache provides fast lookups
- Synced with browser storage

**Challenges**:
- **Quota limits**: `browser.storage.local` has quota limits (typically 5-10MB)
- **Async operations**: All persistent operations are async (Promises)
- **Sync complexity**: Need to handle race conditions between cache and persistent storage

**Error Handling**:
- `browser.storage.local.QUOTA_EXCEEDED`: Prune old entries and retry
- `browser.storage.local.ACCESS_DENIED`: Log error and degrade to in-memory only
- Network/IO errors: Retry with exponential backoff (max 3 attempts)

---

## Usage Patterns

### Basic Storage

```typescript
const storage = createMemoryStorage();

// Add entry
storage.addEntry(entry);

// Update with response
storage.addResponse(entryId, response);

// Get all entries
const entries = storage.getAll();

// Get statistics
const stats = storage.getStats();
console.log(`Captured ${stats.totalEntries} requests`);
```

### Filtering

```typescript
// Get API requests only
const apiRequests = storage.getByUrlPattern('api.example.com');

// Get failed requests
const errors = storage.getByStatus('error');

// Get POST requests with 200 status
const successPosts = storage.filter(e =>
  e.request.method === 'POST' && e.response?.status === 200
);
```

### Capacity Management

```typescript
// Check if near capacity
if (storage.isNearCapacity()) {
  console.warn('Storage is near capacity');
}

// Get size info
const size = storage.getSizeInfo();
console.log(`Storage: ${size.current}/${size.max} (${size.percentage}%)`);

// Manual prune
storage.prune(50); // Keep only 50 newest entries
```

---

## Testing

### Mock Implementation

For testing, create a mock storage that implements `ICaptureStorage`:

```typescript
class MockCaptureStorage implements ICaptureStorage {
  private entries: Map<string, CapturedEntry> = new Map();

  addEntry(entry: CapturedEntry): void {
    this.entries.set(entry.id, entry);
  }

  getAll(): CapturedEntry[] {
    return Array.from(this.entries.values());
  }

  // ... implement all methods
}

// Use in tests
const mockStorage = new MockCaptureStorage();
```

### Unit Tests

For each `ICaptureStorage` implementation:

```typescript
describe('InMemoryStorage', () => {
  it('should add and retrieve entry', () => {
    const storage = createMemoryStorage();
    const entry = createMockEntry({ id: '1' });
    storage.addEntry(entry);

    const retrieved = storage.getById('1');
    expect(retrieved).toEqual(entry);
  });

  it('should update existing entry', () => {
    const storage = createMemoryStorage();
    const entry = createMockEntry({ id: '1' });
    storage.addEntry(entry);

    const updated = storage.updateEntry('1', { response: mockResponse });
    expect(updated).toBe(true);

    const retrieved = storage.getById('1');
    expect(retrieved?.response).toEqual(mockResponse);
  });

  it('should prune old entries when over limit', () => {
    const storage = createMemoryStorage({ maxEntries: 2 });
    storage.addEntry(createMockEntry({ id: '1' }));
    storage.addEntry(createMockEntry({ id: '2' }));
    storage.addEntry(createMockEntry({ id: '3' })); // Should trigger prune

    const entries = storage.getAll();
    expect(entries.length).toBe(2);
    expect(entries[0].id).toBe('2'); // Newest first
    expect(entries[1].id).toBe('3');
  });

  it('should return correct statistics', () => {
    const storage = createMemoryStorage();
    storage.addEntry(createMockEntry({ id: '1' }, 'completed'));
    storage.addEntry(createMockEntry({ id: '2' }, 'pending'));
    storage.addEntry(createMockEntry({ id: '3' }, 'error'));

    const stats = storage.getStats();
    expect(stats.totalEntries).toBe(3);
    expect(stats.completedEntries).toBe(1);
    expect(stats.pendingEntries).toBe(1);
    expect(stats.errorEntries).toBe(1);
  });
});
```

---

## Integration with Capture Coordinator

### Dependency Injection

```typescript
// In background.ts
const storage = createMemoryStorage();
const coordinator = createCaptureCoordinator(storage);

coordinator.initialize();

// Capture coordinator uses storage internally via ICaptureStorage interface
// Storage can be swapped without changing coordinator code
```

### Storage Factory

```typescript
// lib/storage/factory.ts
export function createStorage(config: StorageConfig): ICaptureStorage {
  switch (config.type) {
    case 'memory':
      return new MemoryStorage(config);
    case 'persistent':
      return new BrowserStorage(config);
    default:
      return new MemoryStorage(config); // Default fallback
  }
}
```

---

## Considerations

### Thread Safety

- In-Memory storage: Single-threaded (JavaScript), no race conditions
- Persistent storage: Multiple tabs may access simultaneously, need locking strategy

### Memory Usage

- Large response bodies stored in memory can cause issues
- Consider implementing response size limits or body truncation
- Monitor memory usage via `storage.getMemoryUsage()`

### Performance

- O(1) lookups by ID (via Map)
- O(n) for `getAll()` (must iterate all entries)
- O(n) for filtering operations (must scan all entries)
- Pruning operations are O(m) where m is number of entries to remove

### Quota Management

- Monitor `browser.storage.local` quota remaining
- Implement size-based pruning when quota low
- Provide user feedback when approaching quota limits

---

## Future Enhancements

### Search Index

For large storage sets, consider implementing:
- URL pattern search index
- Method-based bucketing
- Status code-based partitioning

### Compression

For large response bodies:
- Compress response data before storage (e.g., gzip via pako library)
- Decompress on retrieval
- Trade-off: CPU vs storage space

### Partitioning

For advanced use cases:
- Partition by domain/website
- Partition by day/week
- Manual partitioning (user-defined collections)

---

**Status**: Complete
