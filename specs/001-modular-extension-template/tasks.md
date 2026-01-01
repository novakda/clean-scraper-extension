---

description: "Task list for feature implementation"
---

# Tasks: Modular Extension Template

**Input**: Design documents from `/specs/001-modular-extension-template/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: The examples below DO NOT include test tasks. Tests will be added separately if requested via `/speckit.tasks` with `--with-tests` flag.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `lib/`, `components/`, `tests/`, `docs/`, `examples/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize TypeScript project with strict configuration
- [x] T003 [P] Configure linting and formatting tools

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create lib/types/ directory structure
- [ ] T005 Create lib/types/capture.ts with CapturedRequest, CapturedResponse, CapturedEntry, CaptureStats types
- [ ] T006 Create lib/types/messages.ts with BackgroundMessage, BackgroundResponse<T> types
- [ ] T007 Create lib/types/storage.ts with ICaptureStorage interface
- [ ] T008 Create lib/types/index.ts to export all types
- [ ] T009 Extract pure utility functions from lib/request-capture.ts to lib/utils.ts
- [ ] T010 [P] Add formatting utilities (formatBytes, formatDuration, formatTimestamp) to lib/utils.ts
- [ ] T011 Create lib/config.ts configuration management (if not fully implemented)
- [ ] T012 Refactor lib/stream-filter.ts for interface compliance and JSDoc
- [ ] T013 Add JSDoc to all types and functions in lib/types/ and lib/utils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Basic Extension (Priority: P1) 🎯 MVP

**Goal**: Developers can create a working Firefox extension from template in under 10 minutes with zero custom code

**Independent Test**: Developer installs extension in Firefox, navigates to any website, and sees captured requests in popup UI

### Implementation for User Story 1

- [ ] T014 [US1] Create lib/storage/types.ts defining ICaptureStorage interface in lib/storage/types/types.ts
- [x] T014 [US1] Create lib/storage/types.ts defining ICaptureStorage interface in lib/storage/types/types.ts
- [x] T015 [US1] Implement lib/storage/memory-storage.ts as CaptureStorage class implementing ICaptureStorage in lib/storage/memory-storage.ts
- [x] T016 [US1] Create lib/storage/factory.ts createStorage(config) factory function in lib/storage/factory.ts
- [x] T017 [US1] Create lib/storage/index.ts exporting public storage API in lib/storage/index.ts
- [x] T018 [US1] Delete old lib/storage.ts file from root lib/ directory
- [ ] T019 [US1] Create lib/capture-coordinator.ts with request lifecycle orchestration in lib/capture-coordinator.ts
- [ ] T020 [US1] Implement webRequest listeners in lib/capture-coordinator.ts using browser.webRequest API
- [ ] T021 [US1] Implement request-response correlation logic using pendingRequests Map in lib/capture-coordinator.ts
- [ ] T022 [US1] Implement StreamFilter attachment via attachStreamFilter call in lib/capture-coordinator.ts
- [ ] T023 [US1] Implement cleanup on completion/error handling in lib/capture-coordinator.ts
- [ ] T024 [US1] Create lib/handlers/storage-handler.ts implementing GET_CAPTURED_REQUESTS, CLEAR_CAPTURED_REQUESTS, GET_STATS handlers in lib/handlers/storage-handler.ts
- [ ] T025 [US1] Create lib/handlers/capture-handler.ts implementing GET_CONFIG handler in lib/handlers/capture-handler.ts
- [ ] T026 [US1] Create lib/handlers/system-handler.ts implementing PING handler in lib/handlers/system-handler.ts
- [ ] T027 [US1] Create lib/message-router.ts with registerHandler and message routing in lib/message-router.ts
- [ ] T028 [US1] Implement type-safe message dispatch in lib/message-router.ts handling BackgroundMessage union type
- [ ] T029 [US1] Add error handling middleware to lib/message-router.ts
- [ ] T030 [US1] Implement browser.runtime.onMessage integration in lib/message-router.ts
- [ ] T031 [US1] Refactor entrypoints/background.ts to use message router, storage, and capture coordinator in entrypoints/background.ts
- [ ] T032 [US1] Simplify entrypoints/background.ts to ~100 lines using modular components in entrypoints/background.ts
- [ ] T033 [US1] Keep webRequest listener setup and runtime.onInstalled handler in entrypoints/background.ts
- [ ] T034 [US1] Create components/request-viewer/ directory for reusable UI components in components/request-viewer/
- [ ] T035 [US1] Refactor components/RequestList.vue for module independence and JSDoc in components/request-viewer/RequestList.vue
- [ ] T036 [US1] Refactor components/RequestDetail.vue for module independence and JSDoc in components/request-viewer/RequestDetail.vue
- [ ] T037 [US1] Refactor components/RequestFilter.vue for module independence and JSDoc in components/request-viewer/RequestFilter.vue
- [ ] T038 [US1] Update all imports throughout codebase to use new component paths in components/request-viewer/
- [ ] T039 [US1] Add JSDoc to RequestList, RequestDetail, and RequestFilter components in components/request-viewer/
- [ ] T040 [US1] Create components/MainApp.vue example implementation using default UI in components/MainApp.vue
- [ ] T041 [US1] Create lib/composables/useRequestCapture.ts composable with fetchRequests, clearRequests, loading/error state in lib/composables/useRequestCapture.ts
- [ ] T042 [US1] Implement type-safe messaging to background using browser.runtime.sendMessage in lib/composables/useRequestCapture.ts
- [ ] T043 [US1] Return reactive state and functions from useRequestCapture composable in lib/composables/useRequestCapture.ts
- [ ] T044 [US1] Add auto-refresh logic to useRequestCapture composable in lib/composables/useRequestCapture.ts
- [ ] T045 [US1] Create lib/composables/useRequestFilters.ts composable with filter state and computed filtered results in lib/composables/useRequestFilters.ts
- [ ] T046 [US1] Implement filter logic for URL, method, status code in lib/composables/useRequestFilters.ts
- [ ] T047 [US1] Return reactive state and functions from useRequestFilters composable in lib/composables/useRequestFilters.ts
- [ ] T048 [US1] Create lib/composables/useAutoRefresh.ts composable with interval management in lib/composables/useAutoRefresh.ts
- [ ] T049 [US1] Implement auto-refresh toggle and cleanup on unmount in lib/composables/useAutoRefresh.ts
- [ ] T050 [US1] Create lib/composables/utils.ts with formatTime, formatDuration, getMethodClass, getStatusClass, formatHeaders, copyToClipboard in lib/composables/utils.ts
- [ ] T051 [US1] Refactor components/MainApp.vue to use composables and reduce code to ~200 lines in components/MainApp.vue
- [ ] T052 [US1] Remove extracted logic from MainApp.vue and focus on layout and template in components/MainApp.vue
- [ ] T053 [US1] Update MainApp.vue imports to use new composables and component paths in components/MainApp.vue

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Customize Capture Logic (Priority: P1) 🎯 MVP

**Goal**: Developers can customize request capture logic by modifying only capture coordinator module without touching other parts of system

**Independent Test**: Developer creates custom filter function in capture-coordinator.ts, rebuilds, and verifies only matching requests are captured

### Implementation for User Story 2

- [ ] T054 [US2] Add JSDoc to createCaptureCoordinator() factory function in lib/capture-coordinator.ts
- [ ] T055 [US2] Document customization points in capture-coordinator.ts for URL matching and data transformation in lib/capture-coordinator.ts
- [ ] T056 [US2] Export capture coordinator public API clearly in lib/capture-coordinator.ts
- [ ] T057 [US2] Ensure capture coordinator is testable with dependency injection in lib/capture-coordinator.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Use Composable UI Components (Priority: P2)

**Goal**: Developers can build a custom UI using provided Vue components and composables to create a different interface layout or add new features

**Independent Test**: Developer creates a new Vue component that imports useRequestCapture composable and RequestList component, displays requests in a custom layout

### Implementation for User Story 3

- [ ] T058 [US3] Extract MethodBadge.vue component from RequestList.vue in components/request-viewer/MethodBadge.vue
- [ ] T059 [US3] Extract StatusCodeBadge.vue component from RequestList.vue in components/request-viewer/StatusCodeBadge.vue
- [ ] T060 [US3] Update RequestList.vue to use MethodBadge and StatusCodeBadge subcomponents in components/request-viewer/RequestList.vue
- [ ] T061 [US3] Extract CodeBlock.vue component from RequestDetail.vue in components/request-viewer/CodeBlock.vue
- [ ] T062 [US3] Extract TabPane.vue component from RequestDetail.vue in components/request-viewer/TabPane.vue
- [ ] T063 [US3] Update RequestDetail.vue to use CodeBlock and TabPane subcomponents in components/request-viewer/RequestDetail.vue
- [ ] T064 [US3] Add JSDoc to all new subcomponents (MethodBadge, StatusCodeBadge, CodeBlock, TabPane) in components/request-viewer/

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Run and Extend Tests (Priority: P2)

**Goal**: Developers can verify that template's tests pass and add new tests for their custom functionality

**Independent Test**: Developer runs `pnpm test:all`, sees all existing tests pass, then adds a new test file for custom logic

**Note**: Tests are optional per spec.md and will NOT be included in this task list. This phase will be added via `/speckit.tasks --with-tests` if requested.

---

## Phase 7: User Story 5 - Use Content Script Framework (Priority: P3)

**Goal**: Developers can inject custom scripts into web pages to scrape DOM elements and communicate with the background script using provided utilities

**Independent Test**: Developer creates a content script using messaging bridge, sends messages to background, and receives responses

### Implementation for User Story 5

- [ ] T065 [US5] Create lib/content-script/types.ts with content script configuration and message types in lib/content-script/types.ts
- [ ] T066 [US5] Create lib/content-script/messaging.ts with sendMessageToBackground utility in lib/content-script/messaging.ts
- [ ] T067 [US5] Create lib/content-script/injector.ts with script injection and DOM wait helpers in lib/content-script/injector.ts
- [ ] T068 [US5] Add JSDoc to all content script framework modules in lib/content-script/
- [ ] T069 [US5] Create examples/content-scripts/basic-scraper.ts with DOM scraping example in examples/content-scripts/basic-scraper.ts
- [ ] T070 [US5] Create examples/content-scripts/advanced-scraper.ts with mutation observers in examples/content-scripts/advanced-scraper.ts
- [ ] T071 [US5] Add extensive JSDoc and inline comments to example scrapers in examples/content-scripts/

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T072 [P] Create tests/ directory structure (unit/, integration/, components/, utils/) in tests/
- [ ] T073 [P] Create tests/utils/mock-browser.ts with browser API mocks (webRequest, runtime, storage) in tests/utils/mock-browser.ts
- [ ] T074 [P] Create tests/utils/mock-storage.ts implementing ICaptureStorage in tests/utils/mock-storage.ts
- [ ] T075 [P] Create tests/utils/test-helpers.ts with common test helpers (setup, teardown, assertions) in tests/utils/test-helpers.ts
- [ ] T076 [P] Create examples/basic-extension/ directory for minimal working example in examples/basic-extension/
- [ ] T077 [P] Create examples/basic-extension/entrypoints/background.ts using library modules in examples/basic-extension/entrypoints/background.ts
- [ ] T078 [P] Create examples/basic-extension/entrypoints/popup/App.vue using library components in examples/basic-extension/entrypoints/popup/App.vue
- [ ] T079 [P] Create examples/basic-extension/components/ directory for minimal UI if needed in examples/basic-extension/components/
- [ ] T080 [P] Add README and comments to basic extension example in examples/basic-extension/
- [ ] T081 [P] Create examples/advanced-extension/ directory for feature-complete example in examples/advanced-extension/
- [ ] T082 [P] Create examples/advanced-extension/entrypoints/background.ts using persistent storage and custom filters in examples/advanced-extension/entrypoints/background.ts
- [ ] T083 [P] Create examples/advanced-extension/entrypoints/content.ts using content script framework in examples/advanced-extension/entrypoints/content.ts
- [ ] T084 [P] Create examples/advanced-extension/entrypoints/popup/App.vue with custom layout and composables in examples/advanced-extension/entrypoints/popup/App.vue
- [ ] T085 [P] Create examples/advanced-extension/components/ directory for custom UI components in examples/advanced-extension/components/
- [ ] T086 [P] Add README and comments to advanced extension example in examples/advanced-extension/
- [ ] T087 [P] Create examples/README.md with overview of all examples and usage instructions in examples/README.md
- [ ] T088 [P] Create docs/library/architecture.md documenting design decisions and module structure in docs/library/architecture.md
- [ ] T089 [P] Create docs/library/api.md with comprehensive API reference for all public modules in docs/library/api.md
- [ ] T090 [P] Create docs/library/testing.md documenting testing approach and patterns in docs/library/testing.md
- [ ] T091 [P] Create docs/migration.md documenting breaking changes and migration steps in docs/migration.md
- [ ] T092 [P] Update project README.md with new structure and quick start in README.md
- [ ] T093 [P] Remove components/HelloWorld.vue legacy component from components/HelloWorld.vue
- [ ] T094 [P] Delete lib/request-capture.ts if fully replaced by types and utils in lib/request-capture.ts
- [ ] T095 [P] Update package.json with test scripts (test:unit, test:integration, test:components, test:all) in package.json
- [ ] T096 [P] Update wxt.config.ts for new structure and test environment in wxt.config.ts
- [ ] T097 [P] Update tsconfig.json for new paths and strict TypeScript configuration in tsconfig.json

**Checkpoint**: All user stories and polish work should now be complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Phase 4)**: Can start after Foundational (Phase 2) - Depends on US1 for extension functionality
- **User Story 3 (Phase 5)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (Phase 6)**: Can start after Foundational (Phase 2) - Depends on US1 for testing infrastructure
- **User Story 5 (Phase 7)**: Can start after Foundational (Phase 2) - Independent of other stories
- **Polish (Phase 8)**: Depends on ALL user stories being complete

### User Story Dependencies

- **User Story 1 (US1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (US2)**: Can start after Foundational (Phase 2) - Depends on US1 for capture coordinator to exist
- **User Story 3 (US3)**: Can start after Foundational (Phase 2) - Depends on US1 for components to exist
- **User Story 4 (US4)**: Can start after Foundational (Phase 2) - Depends on US1 for test infrastructure to exist
- **User Story 5 (US5)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Foundation (Phase 2) MUST complete before any user story work begins
- Tests (Phase 6) MUST exist before US4 can be implemented
- Models before services/components - Core entities and types before logic
- Services before endpoints - Storage and handlers before background script

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (Phase 1)
- All Foundational tasks marked [P] can run in parallel within Phase 2
- Once Foundational (Phase 2) completes, all user stories (US1-US5) can start in parallel (if team capacity allows)
- All subcomponent extractions (MethodBadge, StatusCodeBadge, CodeBlock, TabPane) can run in parallel (US3)
- All example extension tasks can run in parallel (Phase 8)
- All documentation tasks can run in parallel (Phase 8)
- All config updates (package.json, wxt.config.ts, tsconfig.json) can run in parallel (Phase 8)

---

## Parallel Example: User Story 3 (Composable UI Components)

```bash
# Launch all subcomponent tasks together:
Task: "Extract MethodBadge.vue component from RequestList.vue"
Task: "Extract StatusCodeBadge.vue component from RequestList.vue"
Task: "Extract CodeBlock.vue component from RequestDetail.vue"
Task: "Extract TabPane.vue component from RequestDetail.vue"
Task: "Add JSDoc to all new subcomponents"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Basic Extension)
   - Developer B: User Story 2 (Customize Capture)
   - Developer C: User Story 5 (Content Script)
3. Stories complete and integrate independently
4. Polish and cross-cutting concerns (Phase 8) as team

---

## Task Count Summary

**Total Tasks**: 97

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (US1): 40 tasks
- Phase 4 (US2): 4 tasks
- Phase 5 (US3): 7 tasks
- Phase 6 (US4): 0 tasks (tests optional - to be added separately)
- Phase 7 (US5): 7 tasks
- Phase 8 (Polish): 26 tasks

**By User Story**:
- US1 (Create Basic Extension): 40 tasks
- US2 (Customize Capture Logic): 4 tasks
- US3 (Use Composable UI): 7 tasks
- US4 (Run and Extend Tests): 0 tasks (tests optional)
- US5 (Use Content Script Framework): 7 tasks

**Parallelizable Tasks**: 28 tasks marked [P]

**Independent Test Points**:
- After Phase 3: US1 is independently testable (basic extension with zero custom code)
- After Phase 4: US2 is independently testable (customize capture without touching other modules)
- After Phase 5: US3 is independently testable (custom UI using components/composables)
- After Phase 6: US4 is independently testable (run and extend tests)
- After Phase 7: US5 is independently testable (content script framework)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify types pass before committing changes
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are NOT included in this task list per spec.md requirements

**MVP Recommendation**: Start with Phase 1, 2, and 3 (US1) to have a fully functional basic extension first.
