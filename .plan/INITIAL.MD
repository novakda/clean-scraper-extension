# Modularization Plan: Firefox Scraper Base Extension

**Date**: 2025-12-31
**Status**: Draft - Not Yet Executed
**Constitution Version**: 1.0.0

---

## Executive Summary

Transform the current working Firefox extension into a reusable starter template for Firefox Manifest V3 web scraping extensions. The goal is to separate background scripts, workers, and supporting code into logical modules for general request/response capture.

**Key Principles**:
- Firefox-first architecture (Chrome out of scope)
- Modular background architecture with independent, reusable modules
- StreamFilter-centric design for response body capture
- Module independence (testable, documented, minimal public APIs)
- Typed extensibility with strong TypeScript types
- WXT build system constraint (no new platforms/libraries)

**Clarifying Decisions**:
1. **Storage**: Separate optional module (not bundled with core)
2. **Content Scripts**: Hybrid approach (lightweight framework + examples)
3. **UI**: Composable toolkit + complete example implementation
4. **Testing**: Full test suite (unit + integration + component tests)
5. **Message Handlers**: Mixed approach (grouped modules + central registry)

---

## Current Codebase Analysis

### Current Structure

```
lib/
├── config.ts              # Configuration management (201 lines)
├── request-capture.ts     # Data models + utilities (231 lines)
├── storage.ts             # In-memory storage (335 lines)
└── stream-filter.ts       # StreamFilter wrapper (195 lines)

entrypoints/
├── background.ts          # Monolithic orchestrator (293 lines)
├── popup/                # Popup UI
├── tab/                  # Tab UI
└── content.ts            # Minimal content script

components/
├── MainApp.vue           # Heavy UI shell with messaging (410 lines)
├── RequestList.vue        # Request list display
├── RequestDetail.vue      # Request detail view
├── RequestFilter.vue      # Filter UI
└── HelloWorld.vue        # Legacy component
```

### Identified Issues

1. **background.ts** - Monolithic, mixes orchestration, message handling, and capture logic
2. **request-capture.ts** - Mixes data models with utility functions
3. **storage.ts** - Tightly coupled to in-memory Map, no interface abstraction
4. **MainApp.vue** - 410 lines with messaging, state management, and UI logic mixed
5. **No tests** - No unit tests, integration tests, or component tests
6. **Limited reusability** - Components tightly coupled to specific UI structure

---

## Proposed Target Structure

```
lib/
├── types/                    # Type definitions
│   ├── capture.ts           # CapturedRequest, CapturedResponse, etc.
│   ├── messages.ts          # Message types
│   └── storage.ts           # Storage interfaces
├── config.ts                 # Configuration management
├── utils.ts                  # Pure utility functions
├── stream-filter.ts          # StreamFilter wrapper
├── capture-coordinator.ts    # Request lifecycle orchestration
├── message-router.ts        # Central message router
├── handlers/
│   ├── storage-handler.ts   # Storage-related messages
│   ├── capture-handler.ts   # Capture-related messages
│   └── system-handler.ts    # System messages
├── storage/                  # OPTIONAL storage module
│   ├── types.ts            # Storage interface
│   ├── memory-storage.ts   # In-memory implementation
│   ├── factory.ts          # Storage factory
│   └── index.ts           # Public API
├── composables/              # Vue composables
│   ├── useRequestCapture.ts
│   ├── useRequestFilters.ts
│   ├── useAutoRefresh.ts
│   └── utils.ts
└── content-script/           # Content script framework
    ├── types.ts
    ├── messaging.ts
    └── injector.ts

components/request-viewer/    # Reusable UI components
├── RequestList.vue
├── RequestDetail.vue
├── RequestFilter.vue
├── MethodBadge.vue
├── StatusCodeBadge.vue
├── CodeBlock.vue
└── TabPane.vue

components/                   # Example implementation
└── MainApp.vue              # Complete app example

tests/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── components/              # Component tests
└── utils/                   # Test utilities

examples/
├── basic-extension/          # Minimal working example
├── advanced-extension/       # Feature-complete example
└── content-scripts/         # Content script examples
    ├── basic-scraper.ts
    └── advanced-scraper.ts
```

---

## Implementation Phases

### Phase 1: Foundation & Types (No Dependencies)

**Goal**: Establish type system and extract pure utilities

**Files Created**:
- `lib/types/capture.ts` - Capture data models
- `lib/types/messages.ts` - Message type definitions
- `lib/types/storage.ts` - Storage interface
- `lib/types/index.ts` - Type exports
- `lib/utils.ts` - Pure utility functions

**Files Modified**:
- `lib/request-capture.ts` - Remove type definitions and utilities

**Actions**:
1. Extract `CapturedRequest`, `CapturedResponse`, `CapturedEntry`, `CaptureStats` to `lib/types/capture.ts`
2. Create message type union and request/response types in `lib/types/messages.ts`
3. Define `ICaptureStorage` interface in `lib/types/storage.ts`
4. Extract utilities from `lib/request-capture.ts` to `lib/utils.ts`:
   - `parseHeaders`, `arrayBufferToString`, `uint8ArrayToString`
   - `truncateData`, `isTextContent`
5. Add formatting utilities: `formatBytes`, `formatDuration`, `formatTimestamp`
6. Add JSDoc to all types and functions

**Validation**:
- [ ] All types compile with `pnpm compile`
- [ ] No circular dependencies
- [ ] JSDoc complete for public API

**Tests**:
- Unit tests for utility functions in `lib/utils.test.ts`

---

### Phase 2: Refactor Core Models (Depends on Phase 1)

**Goal**: Clean up request-capture.ts after type extraction

**Files Modified**:
- `lib/request-capture.ts`

**Actions**:
1. Review `lib/request-capture.ts` for any remaining functions
2. Keep only pure type definitions (if any remain)
3. Add JSDoc comments
4. Consider marking for deprecation

**Validation**:
- [ ] `pnpm compile` passes
- [ ] No undefined type references in other files

**Tests**:
- None (types only)

---

### Phase 3: Storage Module Refactoring (Depends on Phase 1, 2)

**Goal**: Create interface-based storage system

**Files Created**:
- `lib/storage/types.ts` - Storage interface
- `lib/storage/memory-storage.ts` - In-memory implementation
- `lib/storage/factory.ts` - Storage factory
- `lib/storage/index.ts` - Public API

**Files Modified**:
- `lib/storage.ts` - Delete (moved to storage/)

**Actions**:
1. Define `ICaptureStorage` interface in `lib/storage/types.ts`
2. Move `CaptureStorage` class from `lib/storage.ts` to `lib/storage/memory-storage.ts`
3. Implement `ICaptureStorage` interface
4. Create `createStorage(config: StorageConfig): ICaptureStorage` factory
5. Export public API from `lib/storage/index.ts`
6. Delete `lib/storage.ts`
7. Add JSDoc throughout

**Validation**:
- [ ] `pnpm compile` passes
- [ ] All storage imports resolve to new location
- [ ] Factory creates instances correctly

**Tests**:
- Unit tests for memory-storage in `tests/unit/storage/memory-storage.test.ts`
- Unit tests for factory in `tests/unit/storage/factory.test.ts`

---

### Phase 4: Request Capture Coordinator (Depends on Phase 1, 2, 3)

**Goal**: Extract request orchestration logic

**Files Created**:
- `lib/capture-coordinator.ts`

**Files Modified**:
- `entrypoints/background.ts` - Remove capture logic

**Actions**:
1. Extract from `entrypoints/background.ts`:
   - `pendingRequests` Map management
   - Request lifecycle orchestration
   - StreamFilter attachment logic
   - Request-response correlation
   - Cleanup on completion/error
2. Make independent of storage implementation (accepts `ICaptureStorage`)
3. Create public API:
   - `createCaptureCoordinator(storage: ICaptureStorage): CaptureCoordinator`
   - `initialize()` method
   - Cleanup methods
4. Add JSDoc
5. Make testable (dependency injection for storage)

**Validation**:
- [ ] `pnpm compile` passes
- [ ] Background.ts compiles without errors
- [ ] Coordinator initializes correctly

**Tests**:
- Unit tests for coordinator in `tests/unit/capture-coordinator.test.ts`

---

### Phase 5: Message Handling System (Depends on Phase 1, 3, 4)

**Goal**: Create modular, grouped message handlers

**Files Created**:
- `lib/handlers/storage-handler.ts`
- `lib/handlers/capture-handler.ts`
- `lib/handlers/system-handler.ts`
- `lib/message-router.ts`

**Files Modified**:
- `entrypoints/background.ts` - Remove message handling logic

**Actions**:

**5.1 Define Message Types**:
1. Complete message type definitions in `lib/types/messages.ts`
2. Define all message types:
   - `GET_CAPTURED_REQUESTS`, `CLEAR_CAPTURED_REQUESTS`
   - `GET_STATS`, `GET_REQUEST_BY_ID`, `FILTER_REQUESTS`
   - `GET_CONFIG`, `PING`
3. Define request/response type pairs
4. Add JSDoc for each message type

**5.2 Create Storage Handler**:
1. Extract storage-related handlers from `background.ts`
2. Accept `ICaptureStorage` as dependency
3. Add JSDoc
4. Make handlers individually testable

**5.3 Create Capture Handler**:
1. Extract capture-related handlers
2. Access configuration system
3. Add JSDoc
4. Make testable

**5.4 Create System Handler**:
1. Extract system handlers (PING)
2. Add diagnostic handlers
3. Add JSDoc
4. Make testable

**5.5 Create Message Router**:
1. Create centralized message router
2. Support handler registration
3. Type-safe message dispatch
4. Add error handling middleware
5. Integration with `browser.runtime.onMessage`

**Validation**:
- [ ] `pnpm compile` passes
- [ ] All message types compile
- [ ] Background.ts compiles with router
- [ ] Handlers register correctly

**Tests**:
- Unit tests for router in `tests/unit/message-router.test.ts`
- Unit tests for storage-handler in `tests/unit/handlers/storage-handler.test.ts`
- Unit tests for capture-handler in `tests/unit/handlers/capture-handler.test.ts`
- Unit tests for system-handler in `tests/unit/handlers/system-handler.test.ts`

---

### Phase 6: Vue Composables (Depends on Phase 1, 5)

**Goal**: Extract UI logic into reusable composables

**Files Created**:
- `lib/composables/useRequestCapture.ts`
- `lib/composables/useRequestFilters.ts`
- `lib/composables/useAutoRefresh.ts`
- `lib/composables/utils.ts`

**Files Modified**:
- `components/MainApp.vue` - Simplify to use composables

**Actions**:

**6.1 Create useRequestCapture Composable**:
1. Extract from `components/MainApp.vue`:
   - `fetchRequests()` function
   - `clearRequests()` function
   - Auto-refresh logic
   - Loading/error state
2. Type-safe messaging to background
3. Return reactive state and functions
4. Add JSDoc

**6.2 Create useRequestFilters Composable**:
1. Extract filter logic from `components/MainApp.vue`
2. Filter state and computed filtered results
3. Update filters function
4. Return reactive state and functions
5. Add JSDoc

**6.3 Create useAutoRefresh Composable**:
1. Extract auto-refresh logic from `components/MainApp.vue`
2. Manage interval lifecycle
3. Return reactive state and functions
4. Add cleanup on unmount
5. Add JSDoc

**6.4 Create Composable Utilities**:
1. Extract UI utilities from components:
   - `formatTime`, `formatDuration`
   - `getMethodClass`, `getStatusClass`
   - `formatHeaders`, `copyToClipboard`
2. Add JSDoc

**6.5 Refactor MainApp.vue**:
1. Import and use composables
2. Remove extracted logic
3. Focus on layout and template only

**Validation**:
- [ ] `pnpm compile` passes
- [ ] MainApp.vue compiles
- [ ] Composables work in isolation

**Tests**:
- Component tests for useRequestCapture in `tests/composables/useRequestCapture.test.ts`
- Component tests for useRequestFilters in `tests/composables/useRequestFilters.test.ts`
- Component tests for useAutoRefresh in `tests/composables/useAutoRefresh.test.ts`

---

### Phase 7: UI Component Toolkit (Depends on Phase 6)

**Goal**: Organize components into reusable toolkit

**Files Created**:
- `components/request-viewer/MethodBadge.vue`
- `components/request-viewer/StatusCodeBadge.vue`
- `components/request-viewer/CodeBlock.vue`
- `components/request-viewer/TabPane.vue`

**Files Moved**:
- `components/RequestList.vue` → `components/request-viewer/RequestList.vue`
- `components/RequestDetail.vue` → `components/request-viewer/RequestDetail.vue`
- `components/RequestFilter.vue` → `components/request-viewer/RequestFilter.vue`

**Files Modified**:
- `components/request-viewer/RequestList.vue`
- `components/request-viewer/RequestDetail.vue`
- `components/MainApp.vue` (update imports)

**Actions**:

**7.1 Move Components**:
1. Create `components/request-viewer/` directory
2. Move RequestList.vue, RequestDetail.vue, RequestFilter.vue
3. Update all imports throughout codebase

**7.2 Extract RequestList Subcomponents**:
1. Extract method badge rendering to `MethodBadge.vue`
2. Extract status code rendering to `StatusCodeBadge.vue`
3. Add JSDoc
4. Update RequestList.vue to use new components

**7.3 Extract RequestDetail Subcomponents**:
1. Extract code block display to `CodeBlock.vue`
2. Extract tab interface to `TabPane.vue`
3. Add JSDoc
4. Update RequestDetail.vue to use new components

**7.4 Add JSDoc to All Components**:
1. Document components with JSDoc
2. Document props
3. Document emits
4. Document public methods

**Validation**:
- [ ] `pnpm compile` passes
- [ ] All imports resolve correctly
- [ ] Components render without errors
- [ ] UI functions as before

**Tests**:
- Component tests for all components in `tests/components/`
- Tests for: RequestList, RequestDetail, RequestFilter, MethodBadge, StatusCodeBadge, CodeBlock, TabPane

---

### Phase 8: Content Script Framework (Independent)

**Goal**: Create reusable content script framework

**Files Created**:
- `lib/content-script/types.ts`
- `lib/content-script/messaging.ts`
- `lib/content-script/injector.ts`
- `examples/content-scripts/basic-scraper.ts`
- `examples/content-scripts/advanced-scraper.ts`

**Actions**:

**8.1 Create Content Script Types**:
1. Define content script configuration
2. Define content script message types
3. Define selector types
4. Add JSDoc

**8.2 Create Content Script Messaging**:
1. Create communication bridge with background
2. Message utilities
3. Error handling
4. Type-safe messaging
5. Add JSDoc

**8.3 Create Content Script Injector**:
1. Script injection utilities
2. Wait for DOM ready helpers
3. Wait for element helpers
4. Add JSDoc

**8.4 Create Example Scrapers**:
1. Basic DOM scraping example
2. Advanced scraping with mutation observers
3. Extensive JSDoc and inline comments
4. Fully functional

**Validation**:
- [ ] `pnpm compile` passes
- [ ] Content scripts compile
- [ ] Examples compile

**Tests**:
- Unit tests for messaging in `tests/unit/content-script/messaging.test.ts`
- Unit tests for injector in `tests/unit/content-script/injector.test.ts`

---

### Phase 9: Simplify Background Script (Depends on Phase 4, 5)

**Goal**: Reduce background.ts to orchestration layer

**Files Modified**:
- `entrypoints/background.ts`

**Actions**:
1. Replace inline message handling with `message-router`
2. Replace inline capture logic with `capture-coordinator`
3. Simplify to orchestration only
4. Keep webRequest listener setup
5. Keep runtime.onInstalled handler
6. Add JSDoc

**Target Structure**:
```typescript
export default defineBackground(() => {
  // Initialize storage
  const storage = createMemoryStorage();

  // Initialize message router
  const router = createMessageRouter();
  registerStorageHandlers(router, storage);
  registerCaptureHandlers(router);
  registerSystemHandlers(router);

  // Initialize capture coordinator
  const coordinator = createCaptureCoordinator(storage);
  coordinator.initialize();

  // Setup message listener
  browser.runtime.onMessage.addListener(router.handle);
});
```

**Validation**:
- [ ] `pnpm compile` passes
- [ ] Background script initializes correctly
- [ ] Message routing works
- [ ] Capture coordinator works
- [ ] All existing functionality preserved

**Tests**:
- Integration tests in `tests/integration/background.test.ts`

---

### Phase 10: Simplify UI Components (Depends on Phase 6, 7)

**Goal**: Reduce MainApp.vue to layout only

**Files Modified**:
- `components/MainApp.vue`

**Actions**:
1. Import and use `useRequestCapture` composable
2. Import and use `useRequestFilters` composable
3. Import and use `useAutoRefresh` composable
4. Remove extracted logic
5. Keep only layout and template
6. Update component imports to new paths

**Target**: 50% reduction in code, focus on UI structure

**Validation**:
- [ ] `pnpm compile` passes
- [ ] MainApp renders correctly
- [ ] All functionality preserved
- [ ] Code is cleaner and more readable

**Tests**:
- Component tests for MainApp in `tests/components/MainApp.test.ts`

---

### Phase 11: Testing Infrastructure (Depends on Phase 1-10)

**Goal**: Create comprehensive test suite

**Files Created**:
- `tests/utils/mock-browser.ts`
- `tests/utils/mock-storage.ts`
- `tests/utils/test-helpers.ts`
- All unit test files
- All component test files
- Integration test files

**Actions**:

**11.1 Create Test Utilities**:
1. Browser API mocks (webRequest, runtime, storage)
2. Storage mock implementing `ICaptureStorage`
3. Common test helpers (setup, teardown, assertions)
4. Add JSDoc

**11.2 Create Unit Tests**:
1. `tests/unit/config.test.ts`
2. `tests/unit/utils.test.ts`
3. `tests/unit/stream-filter.test.ts`
4. `tests/unit/capture-coordinator.test.ts`
5. `tests/unit/storage/memory-storage.test.ts`
6. `tests/unit/storage/factory.test.ts`
7. `tests/unit/message-router.test.ts`
8. `tests/unit/handlers/storage-handler.test.ts`
9. `tests/unit/handlers/capture-handler.test.ts`
10. `tests/unit/handlers/system-handler.test.ts`
11. `tests/unit/content-script/messaging.test.ts`
12. `tests/unit/content-script/injector.test.ts`

**11.3 Create Integration Tests**:
1. `tests/integration/request-capture.test.ts` - Full request capture flow
2. `tests/integration/message-handling.test.ts` - End-to-end messaging
3. `tests/integration/background.test.ts` - Background script integration

**11.4 Create Component Tests**:
1. `tests/composables/useRequestCapture.test.ts`
2. `tests/composables/useRequestFilters.test.ts`
3. `tests/composables/useAutoRefresh.test.ts`
4. `tests/components/RequestList.test.ts`
5. `tests/components/RequestDetail.test.ts`
6. `tests/components/RequestFilter.test.ts`
7. `tests/components/MethodBadge.test.ts`
8. `tests/components/StatusCodeBadge.test.ts`
9. `tests/components/CodeBlock.test.ts`
10. `tests/components/TabPane.test.ts`
11. `tests/components/MainApp.test.ts`

**11.5 Update WXT Config**:
1. Configure test environment
2. Ensure tests run with WXT

**Validation**:
- [ ] All tests pass: `pnpm test`
- [ ] Unit tests: `pnpm test:unit`
- [ ] Integration tests: `pnpm test:integration`
- [ ] Component tests: `pnpm test:components`
- [ ] All tests pass

---

### Phase 12: Documentation (Depends on Phase 1-11)

**Goal**: Create comprehensive documentation

**Files Created**:
- `docs/library/architecture.md`
- `docs/library/api.md`
- `docs/library/testing.md`
- `docs/migration.md`
- `examples/README.md`

**Files Modified**:
- `README.md`

**Actions**:

**12.1 Create Library Documentation**:
1. Document architecture and design decisions
2. Create comprehensive API reference
3. Document testing approach and patterns
4. Add code examples
5. Add JSDoc throughout codebase

**12.2 Update README**:
1. Update with new library structure
2. Quick start guide
3. Installation instructions
4. Basic usage examples
5. Link to detailed documentation

**12.3 Create Migration Guide**:
1. Document breaking changes
2. Provide migration steps
3. Show before/after code examples
4. Common pitfalls and solutions

**12.4 Create Examples README**:
1. Overview of all examples
2. When to use each example
3. How to run examples
4. Common patterns demonstrated

**Validation**:
- [ ] README is clear and accurate
- [ ] API docs are comprehensive
- [ ] Migration guide is helpful
- [ ] Examples have clear instructions
- [ ] All JSDoc complete

---

### Phase 13: Create Example Extensions (Independent)

**Goal**: Create fully functional example extensions

**Files Created**:
- `examples/basic-extension/` (entire directory)
- `examples/advanced-extension/` (entire directory)

**Actions**:

**13.1 Create Basic Example Extension**:
1. Create minimal working extension using library
2. Show basic request capture
3. Show basic UI
4. Fully functional
5. Extensive comments and documentation

**13.2 Create Advanced Example Extension**:
1. Create feature-complete extension
2. Show persistent storage usage
3. Show content script integration
4. Show advanced filtering
5. Fully functional
6. Extensive comments and documentation

**13.3 Create Examples README**:
1. Overview of all examples
2. When to use each example
3. How to run examples
4. Common patterns demonstrated

**Validation**:
- [ ] Basic extension builds: `pnpm build:firefox`
- [ ] Advanced extension builds: `pnpm build:firefox`
- [ ] Basic extension works in Firefox
- [ ] Advanced extension works in Firefox
- [ ] All examples documented

---

### Phase 14: Cleanup & Finalization (Depends on All Phases)

**Goal**: Final cleanup and polish

**Files Deleted**:
- `components/HelloWorld.vue`
- `lib/request-capture.ts`

**Files Modified**:
- `package.json`
- `wxt.config.ts`
- `tsconfig.json`

**Actions**:

**14.1 Remove Deprecated Files**:
1. Review files for deletion
2. Verify no imports remain
3. Delete deprecated files

**14.2 Update Package Scripts**:
1. Add test scripts:
   - `test:unit` - Run unit tests
   - `test:integration` - Run integration tests
   - `test:components` - Run component tests
   - `test:all` - Run all tests
2. Verify existing scripts still work

**14.3 Update Configuration**:
1. Update wxt.config.ts for new structure
2. Ensure all paths resolve correctly
3. Add any new WXT-specific configurations

**14.4 Update TypeScript Config**:
1. Update tsconfig.json for new paths
2. Ensure type checking works
3. Update include/exclude patterns

**14.5 Final Testing**:
1. Run full test suite
2. Build extension
3. Test in Firefox
4. Verify all functionality

**Validation**:
- [ ] All deprecated files deleted
- [ ] Package scripts work correctly
- [ ] WXT config is correct
- [ ] TypeScript config is correct
- [ ] `pnpm compile` passes
- [ ] `pnpm build:firefox` succeeds
- [ ] Extension works in Firefox
- [ ] All tests pass
- [ ] Documentation is complete

---

## Execution Strategy

### Branching Strategy

1. Create new branch for modularization: `feature/modularization`
2. Delete deprecated files only in this branch
3. Review and validate after each phase
4. Test after each phase
5. Document concurrently with implementation

### Phase Dependencies

```
Phase 1: Foundation & Types
  └─> Phase 2: Refactor Core Models
        └─> Phase 3: Storage Module Refactoring
              ├─> Phase 4: Request Capture Coordinator
              ├─> Phase 5: Message Handling System
              │     └─> Phase 6: Vue Composables
              │           └─> Phase 7: UI Component Toolkit
              │                 └─> Phase 10: Simplify UI Components
              │
              └─> Phase 9: Simplify Background Script

Phase 8: Content Script Framework (Independent)

Phase 11: Testing Infrastructure (Depends on 1-10)
  └─> Phase 12: Documentation
  └─> Phase 13: Create Example Extensions (Independent)

Phase 14: Cleanup & Finalization (Depends on All)
```

### Review Process

After each phase:
1. Run `pnpm compile` - Verify TypeScript compilation
2. Run `pnpm test:phase` - Run tests for completed phases
3. Manual review of changed files
4. Verify functionality still works
5. Commit changes with descriptive message

### Test Strategy

- Test after each phase
- Unit tests for all library modules
- Integration tests for core flows
- Component tests for UI
- No minimal coverage target (establish later)

---

## Breaking Changes Summary

1. **Background Script API** - Completely restructured to use coordinator and router
2. **Message Handler Registration** - New grouped handler pattern with central router
3. **Storage API** - Interface-based, backward compatibility possible but not guaranteed
4. **Component Imports** - Paths changed to `components/request-viewer/`
5. **Type Imports** - Changed to `lib/types/`
6. **Composable Usage** - New composable pattern for UI state management
7. **File Deletions** - `lib/request-capture.ts`, `components/HelloWorld.vue`

All changes are intentional as part of modularization to create a reusable starter template.

---

## Risk Mitigation

1. **Git Branching** - All work in separate branch, main remains stable
2. **Phase-by-Phase** - Review and validate after each phase
3. **Testing Each Phase** - Catch issues early
4. **Documentation** - Concurrent documentation prevents knowledge loss
5. **Backward Compatibility** - While breaking changes are allowed, we'll document migration paths clearly

---

## Success Criteria

✓ All phases completed successfully
✓ All tests passing
✓ Extension builds and runs in Firefox
✓ Documentation is comprehensive
✓ Examples are fully functional
✓ Code follows constitution principles
✓ Modules are independent and reusable
✓ No circular dependencies
✓ Strong TypeScript typing throughout
✓ JSDoc on all public APIs

---

## Next Steps

**Status**: Draft - Ready for execution

**Action Items**:
1. Review this plan with stakeholders
2. Create feature branch: `feature/modularization`
3. Begin Phase 1 implementation
4. Review and validate after each phase
5. Test after each phase
6. Document concurrently
7. Finalize in Phase 14

**Estimated Timeline**: 14 phases with review/validate after each
**Complexity**: High - Major refactoring of entire codebase
**Risk**: Medium - Breaking changes, but isolated to feature branch

---

## Appendix: User Input Summary

**User Requirements**:
- Refactor for Firefox Manifest V3 specialized web scraping extensions
- Chrome and other browsers out of scope
- Only support what works in Firefox (e.g., StreamFilter)
- Separate background scripts, workers, and supporting code to logical modules
- General capturing of background web requests and responses

**User Decisions**:
1. **Storage**: Separate directory in monorepo (optional module)
2. **Examples**: Fully functional
3. **Documentation**: Both Markdown and JSDoc
4. **Testing**: Full test suite, no minimal coverage target
5. **Breaking Changes**: Allowed
6. **Execution**: Review and validate after each phase
7. **File Deletion**: Delete deprecated files in new git branch only
8. **Component Organization**: Move components immediately
9. **Testing**: Test after each phase
10. **Documentation**: Implement and document concurrently

---

**Document Version**: 1.0
**Last Updated**: 2025-12-31
**Status**: Draft - Not Yet Executed
