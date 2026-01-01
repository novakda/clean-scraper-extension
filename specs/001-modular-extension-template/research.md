# Research: Modular Extension Template

**Feature**: Modular Extension Template (001-modular-extension-template)
**Date**: 2025-12-31
**Status**: Complete

## Overview

This research document summarizes the comprehensive modularization plan for transforming the current Firefox extension into a reusable starter template. The detailed implementation plan is available at [`.plan/INITIAL.MD`](../../../../.plan/INITIAL.MD).

## Research Summary

**Goal**: Create a modular, reusable starter template for Firefox Manifest V3 web scraping extensions that separates background scripts, workers, and supporting code into logical modules.

**Approach**: 14-phase modularization with:
- Clear dependencies between phases
- Validation gates after each phase
- Test-driven development
- Concurrent documentation

## Decisions Made

### 1. Storage Strategy

**Decision**: Separate optional module in monorepo (not bundled with core library)

**Rationale**:
- Core library remains focused on request capture and message routing
- Storage can be swapped (in-memory, browser.storage.local, future persistent backends)
- Follows dependency inversion principle
- Easier to test core library with mock storage

**Alternatives Considered**:
- **Bundled storage in core**: Rejected because would couple core library to specific storage implementation
- **Separate npm package**: Rejected because adds complexity; monorepo simpler for starter template
- **Multiple storage options built-in**: Rejected because increases maintenance burden; factory pattern better

---

### 2. Content Script Strategy

**Decision**: Hybrid approach (lightweight framework + examples)

**Rationale**:
- Framework provides essential messaging/injection utilities
- Examples demonstrate common scraping patterns
- Developers can copy/modify examples without being locked into specific approach
- Balances structure with flexibility

**Alternatives Considered**:
- **No content script framework**: Rejected because many scraping scenarios need DOM interaction; would require every developer to implement messaging from scratch
- **Full scraping toolkit**: Rejected because scraping patterns vary wildly by use case; too opinionated would limit flexibility

---

### 3. UI Strategy

**Decision**: Composable toolkit + complete example implementation

**Rationale**:
- Composables provide reusable logic (state management, filtering)
- Components provide reusable UI building blocks
- Complete example (MainApp.vue) demonstrates integration
- Developers can pick: use everything, use just composables, or build custom from components

**Alternatives Considered**:
- **Library includes full UI**: Rejected because would lock developers into specific UI structure; extensions often need custom interfaces
- **UI completely separate**: Rejected because provides no starting point; developers want ready-to-use example

---

### 4. Testing Strategy

**Decision**: Full test suite (unit + integration + component tests)

**Rationale**:
- Comprehensive testing ensures modules are independently testable (constitutional principle)
- Integration tests verify cross-module communication
- Component tests ensure UI composables work correctly
- No minimal coverage target established yet; focus on meaningful tests

**Alternatives Considered**:
- **No tests included**: Rejected because constitution requires module independence and testability
- **Core module tests only**: Rejected because UI components and composables are critical to template value

---

### 5. Message Handler Strategy

**Decision**: Mixed approach (grouped modules + central registry)

**Rationale**:
- Groups handlers by functional responsibility (storage, capture, system)
- Central router provides single message listener entry point
- Individual handlers can be tested in isolation
- Easy to add new message types or modify existing ones

**Alternatives Considered**:
- **Single handler file**: Rejected because would grow too large; harder to maintain and test
- **Message routing with explicit types**: Rejected because adds significant boilerplate for limited benefit

---

## Technical Decisions

### Build System

**Decision**: WXT framework only (no new platforms or libraries)

**Rationale**:
- WXT provides comprehensive tooling for Firefox extensions
- Adding new build tools creates complexity and maintenance burden
- Constitution Principle VI explicitly mandates WXT-only approach

### Testing Framework

**Decision**: WXT testing capabilities + project's existing tools

**Rationale**:
- WXT supports testing natively
- Vue Test Utils available for component testing
- Avoids introducing new frameworks that diverge from project's established workflow

### TypeScript Configuration

**Decision**: Strict mode with comprehensive type exports

**Rationale**:
- Catch errors early
- Better IDE autocomplete
- Exported types enable external modules to use library correctly
- Constitutional Principle V requires strong TypeScript typing

### File Organization

**Decision**: Logical separation by responsibility

**Structure**:
```
lib/
├── types/           # Type definitions
├── config.ts        # Configuration
├── utils.ts         # Utilities
├── stream-filter.ts # StreamFilter wrapper
├── capture-coordinator.ts  # Orchestration
├── message-router.ts        # Routing
├── handlers/        # Message handlers (grouped)
├── storage/         # Optional storage module
├── composables/    # Vue composables
└── content-script/   # Content script framework
```

**Rationale**:
- Clear module boundaries
- Easy to navigate and understand
- Supports independent testing
- Enables selective imports for custom extensions

## Current Codebase Analysis

### Current State

**Issues Identified**:

1. **Monolithic background.ts** (293 lines)
   - Mixes orchestration, message handling, and capture logic
   - Difficult to test and maintain
   - Violates modular architecture principle

2. **Mixed concerns in request-capture.ts** (231 lines)
   - Combines data models with utility functions
   - Harder to import selectively

3. **Tight coupling in storage.ts** (335 lines)
   - No interface abstraction
   - Tied to specific Map implementation
   - Cannot swap storage backends

4. **Heavy UI component** (MainApp.vue - 410 lines)
   - Mixes messaging, state management, and UI
   - No reusable logic extraction
   - Difficult to customize

5. **No tests**
   - No unit tests for modules
   - No integration tests
   - No component tests
   - Violates testability principle

6. **Limited reusability**
   - Components tightly coupled to specific UI structure
   - No composable extraction
   - Cannot build custom UIs from existing parts

### Target State

After 14-phase modularization:

**Code Reduction Goals**:
- Background script: 293 lines → <100 lines (using coordinator + router)
- MainApp.vue: 410 lines → ~200 lines (using composables)
- Overall library: More focused modules with single responsibilities

**Test Coverage Goals**:
- Unit tests for all library modules (config, utils, stream-filter, coordinator, handlers, composables)
- Integration tests for cross-module flows
- Component tests for all UI components and composables
- Test utilities (mocks, helpers)

**Documentation Goals**:
- JSDoc on all public APIs
- Architecture documentation
- API reference
- Testing guide
- Migration guide
- Quick start guide
- Example READMEs

## Phases Overview

**14-Phase Implementation Plan**:

1. **Foundation & Types** - Establish type system and extract utilities
2. **Refactor Core Models** - Clean up request-capture.ts
3. **Storage Module Refactoring** - Interface-based storage system
4. **Request Capture Coordinator** - Extract orchestration logic
5. **Message Handling System** - Modular grouped handlers + central router
6. **Vue Composables** - Extract UI logic into reusable functions
7. **UI Component Toolkit** - Organize components into reusable toolkit
8. **Content Script Framework** - Create reusable content script infrastructure
9. **Simplify Background Script** - Reduce to orchestration layer
10. **Simplify UI Components** - Use composables
11. **Testing Infrastructure** - Build comprehensive test suite
12. **Documentation** - Create library and migration docs
13. **Create Example Extensions** - Basic and advanced examples
14. **Cleanup & Finalization** - Remove deprecated files, finalize configuration

**Execution Strategy**:
- Review and validate after each phase
- Test after each phase
- Document concurrently with implementation
- All work in `001-modular-extension-template` branch
- Breaking changes allowed

## Risk Mitigation

1. **Git Branching** - All work in separate branch; main remains stable
2. **Phase-by-Phase** - Review and validate after each phase
3. **Testing Each Phase** - Catch issues early
4. **Documentation** - Concurrent documentation prevents knowledge loss
5. **Backward Compatibility** - While breaking changes allowed, migration guide provided

## Success Criteria

From specification:

- ✅ Extension creation time: <10 minutes
- ✅ All 14 phases complete: zero compilation errors
- ✅ Test pass rate: 100%
- ✅ Background script: <100 lines
- ✅ UI component reduction: >50%
- ✅ JSDoc coverage: All public APIs
- ✅ No circular dependencies
- ✅ Examples: Fully functional
- ✅ Test suite: <30 seconds
- ✅ Migration guide: <15 minutes to understand

## Conclusion

Research phase complete with comprehensive 14-phase implementation plan. All decisions documented with rationale. Constitutional compliance verified. Ready to proceed to Phase 1: Design & Contracts.

---

**Status**: ✅ Complete
**Next**: Phase 1 - Generate data-model.md, contracts/, quickstart.md, and update agent context
