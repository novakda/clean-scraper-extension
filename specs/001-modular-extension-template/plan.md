# Implementation Plan: Modular Extension Template

**Branch**: `001-modular-extension-template` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-modular-extension-template/spec.md`

**Note**: Existing research plan at `.plan/INITIAL.MD` provides comprehensive technical approach. This plan operationalizes that research for implementation.

## Summary

Transform the current monolithic Firefox extension into a reusable starter template for Firefox Manifest V3 web scraping extensions. The modularization separates background scripts, workers, and supporting code into logical, independent modules with clear responsibilities.

**Technical Approach**: Refactor existing code into 14 phases:
1. Extract types and utilities from mixed modules
2. Create interface-based storage system
3. Build request capture coordinator
4. Implement modular message routing
5. Extract UI logic into composables
6. Reorganize components into reusable toolkit
7. Create content script framework
8. Simplify background script to orchestration layer
9. Simplify UI components to use composables
10. Build comprehensive test suite (unit, integration, component)
11. Create library documentation (architecture, API, testing)
12. Build fully functional example extensions (basic and advanced)
13. Cleanup deprecated files
14. Finalize configuration and scripts

Each phase is independently testable, with validation gates and commit points.

## Technical Context

**Language/Version**: TypeScript 5.9.3

**Primary Dependencies**:
- **Vue** 3.5.26 - UI framework
- **WXT** 0.20.13 - Web extension build framework
- **Vite** (via WXT) - Build tool
- **pnpm** 10.26.2 - Package manager

**Storage**: browser.storage.local (for persistent data) + in-memory Map (session data)

**Testing**: WXT testing capabilities + Vue Test Utils for component testing

**Target Platform**: Firefox Developer Edition or Nightly (Manifest V3, supports StreamFilter API)

**Project Type**: single (browser extension)

**Performance Goals**:
- Extension creation time: <10 minutes from template
- Test suite execution: <30 seconds
- Background script size: <100 lines (down from 293)
- UI component reduction: >50% code reduction (from 410 to ~200 lines)

**Constraints**:
- Firefox-only (Chrome and other browsers out of scope)
- Must use StreamFilter API for response body capture
- WXT-only build system (no additional platforms/libraries)
- All public APIs must have JSDoc documentation
- Modules must be independent (no circular dependencies)

**Scale/Scope**:
- ~1000 lines of core library code
- 49 functional requirements
- 14 modularization phases
- 5 user stories (P1, P1, P2, P2, P3)
- 10 edge case scenarios
- 14 success criteria

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Firefox-First Architecture
✅ **PASS**: Specification explicitly states "Firefox Manifest V3 specialized web scraping extensions. Chrome and other browsers are out of scope."

**Principle II: Modular Background Architecture**
✅ **PASS**: Requirement FR-001 mandates "separate code into independent modules with single responsibilities"

**Principle III: StreamFilter-Centric Design**
✅ **PASS**: Requirement FR-007 specifies "capture HTTP response bodies using Firefox's StreamFilter API"

**Principle IV: Module Independence**
✅ **PASS**: Requirements FR-002, FR-003 mandate TypeScript interfaces and JSDoc, FR-004 prohibits circular dependencies

**Principle V: Typed Extensibility**
✅ **PASS**: Requirements FR-002, FR-003 require TypeScript interfaces and exported types

**Principle VI: WXT Build System Constraint**
✅ **PASS**: Requirements FR-005 mandate "use only WXT framework for building and testing - no additional build platforms or testing frameworks"

### Browser API Constraints
✅ **PASS**: Requirements FR-006 (webRequest), FR-007 (StreamFilter), FR-025 (runtime) align with permitted APIs

**Result**: All gates pass. No violations found. Proceeding to Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/001-modular-extension-template/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (references .plan/INITIAL.MD)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal APIs, no external endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
lib/
├── types/                    # Type definitions
│   ├── capture.ts           # CapturedRequest, CapturedResponse, CapturedEntry
│   ├── messages.ts          # Message types (GET_CAPTURED_REQUESTS, etc.)
│   └── storage.ts           # ICaptureStorage interface
├── config.ts                 # Configuration management
├── utils.ts                  # Pure utility functions
├── stream-filter.ts          # StreamFilter wrapper
├── capture-coordinator.ts    # Request lifecycle orchestration
├── message-router.ts        # Central message router
├── handlers/
│   ├── storage-handler.ts   # Storage-related messages
│   ├── capture-handler.ts   # Capture-related messages
│   └── system-handler.ts    # System messages (PING, health checks)
├── storage/                  # OPTIONAL storage module
│   ├── types.ts            # Storage interface definitions
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
├── MainApp.vue             # Complete app example
└── HelloWorld.vue           # [DELETE - legacy component]

tests/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── components/              # Component tests
└── utils/                   # Test utilities (mocks, helpers)

docs/
├── library/
│   ├── architecture.md
│   ├── api.md
│   └── testing.md
├── migration.md
└── [existing docs preserved]

examples/
├── basic-extension/          # Minimal working example
├── advanced-extension/       # Feature-complete example
└── content-scripts/         # Content script examples
    ├── basic-scraper.ts
    └── advanced-scraper.ts

entrypoints/
├── background.ts          # Simplified orchestrator
├── popup/                # Popup UI
├── tab/                  # Tab UI
└── content.ts            # Minimal content script (framework only)
```

**Structure Decision**: This is a single-project browser extension using WXT framework. The structure separates core library (`lib/`) from UI components and provides optional modules (`storage/`, `content-script/`) that can be imported independently. The `components/request-viewer/` directory contains reusable UI building blocks, while `components/MainApp.vue` serves as a complete example implementation.

## Complexity Tracking

> **No constitution violations found. Complexity tracking not required.**

All gates pass. The modularization plan introduces complexity intentionally to create a reusable template, but this complexity is justified by the stated goal: transform a monolithic extension into a modular starter template that can serve as a foundation for multiple future scraping extensions.

## Phase 0: Research Complete

**Status**: ✅ **Complete**

**Research Document**: Existing comprehensive research plan at [`.plan/INITIAL.MD`](../../../../.plan/INITIAL.MD)

**Summary**:
The research phase produced a detailed 14-phase modularization plan (908 lines) covering:
- Complete current codebase analysis
- Target modular structure
- Detailed implementation phases with dependencies
- Risk mitigation strategies
- Success criteria and validation steps

**Decisions Made**:
1. **Storage**: Separate optional module in monorepo (not bundled with core)
2. **Content Scripts**: Hybrid approach (lightweight framework + examples)
3. **UI**: Composable toolkit + complete example implementation
4. **Testing**: Full test suite (unit + integration + component tests)
5. **Message Handlers**: Mixed approach (grouped modules + central registry)
6. **Execution**: Review and validate after each phase
7. **File Deletion**: Delete deprecated files in new git branch only
8. **Component Organization**: Move components immediately to `request-viewer/` directory
9. **Testing**: Test after each phase
10. **Documentation**: Implement and document concurrently

**Research Complete**: Proceeding to Phase 1 (Design & Contracts).

## Phase 1: Design & Contracts

**Prerequisites**: Phase 0 research complete ✅

### 1.1 Generate data-model.md

Extract entities from feature specification and define data structures.

**Status**: ✅ **Complete**

---

### 1.2 Generate contracts/

Generate internal API contracts for module communication.

**Status**: ✅ **Complete**

- Created [messages.md](contracts/messages.md) - Message passing contracts
- Created [storage.md](contracts/storage.md) - Storage interface contract

**Note**: This is an internal library with no external HTTP/GraphQL endpoints.

---

### 1.3 Generate quickstart.md

Create quick start guide for developers using the template.

**Status**: ✅ **Complete**

- 10-minute quick start guide
- 5 development workflow steps
- Common tasks and examples

---

### 1.4 Update Agent Context

Run agent context update script to inform AI agents about new technologies and patterns used in this template.

**Status**: ✅ **Complete**

- Added TypeScript 5.9.3 to opencode context
- Added browser.storage.local + in-memory Map storage pattern

---

### Constitution Check Re-evaluation

Post-design review of constitutional compliance with new artifacts.

**Status**: ✅ **All Gates Pass**

**Review Results**:
- ✅ All 6 constitutional principles upheld by design artifacts
- ✅ No violations introduced in contracts or data model
- ✅ Type definitions provide strong typing (Principle V)
- ✅ Interface-based storage enables module independence (Principle IV)
- ✅ Message contracts follow WXT-only constraint (Principle VI)
- ✅ No implementation details leaked into contracts

**Result**: Design artifacts comply with constitution. Ready for `/speckit.tasks` to generate implementation tasks.

---

## Next Steps

**Current Phase**: Phase 1 - Design & Contracts

**Tasks**:
1. Generate `data-model.md` from spec entities
2. Generate internal `contracts/` for message/storage interfaces
3. Generate `quickstart.md` for template users
4. Run `.specify/scripts/bash/update-agent-context.sh opencode` to update agent context
5. Re-evaluate Constitution Check with new design artifacts

**After Phase 1**: Proceed to `/speckit.tasks` to generate detailed task breakdown and begin implementation.

---

**Plan Version**: 1.0
**Status**: Phase 0 Complete, Phase 1 Complete

---

## Next Steps

**Current Phase**: Complete (Phase 1: Design & Contracts)

**Completed Artifacts**:
- ✅ [research.md](./research.md) - Comprehensive research plan with 14-phase implementation strategy
- ✅ [data-model.md](./data-model.md) - Core entities with validation rules and state transitions
- ✅ [contracts/messages.md](contracts/messages.md) - Message passing contracts for background ↔ popup communication
- ✅ [contracts/storage.md](contracts/storage.md) - ICaptureStorage interface with implementation requirements
- ✅ [quickstart.md](./quickstart.md) - 10-minute quick start guide for developers
- ✅ **Agent Context Updated** - opencode context includes TypeScript 5.9.3 and browser.storage.local patterns

**Ready for**: `/speckit.tasks` command to generate detailed task breakdown and begin implementation.

**Next Command**:
```bash
/speckit.tasks
```

This will generate [tasks.md](./tasks.md) with:
- Detailed task breakdown for 14 implementation phases
- Task dependencies and execution order
- Phase checkpoints and validation gates
- Testing requirements for each phase

**After Task Generation**:
1. Review tasks.md
2. Begin Phase 1 implementation (Foundation & Types)
3. Execute phases sequentially with review and validation after each phase
4. Test after each phase
5. Document concurrently with implementation
