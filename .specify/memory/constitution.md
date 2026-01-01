<!--
Sync Impact Report:
Version Change: N/A → 1.0.0 (initial constitution)

Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (6 new principles)
    - I. Firefox-First Architecture
    - II. Modular Background Architecture
    - III. StreamFilter-Centric Design
    - IV. Module Independence
    - V. Typed Extensibility
    - VI. WXT Build System Constraint
  - Browser API Constraints
  - Development Workflow
  - Testing Requirements
  - Governance

Removed Sections: N/A (initial creation)

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section references generic gates
  ✅ spec-template.md - Requirements section compatible with new principles
  ✅ tasks-template.md - Task organization compatible with modular architecture

Follow-up TODOs: None
-->

# Firefox Scraper Base Constitution

## Core Principles

### I. Firefox-First Architecture

All code MUST target Firefox Manifest V3 exclusively. Chrome, Chromium, and other browsers are out of scope. No cross-browser compatibility considerations shall influence design decisions.

**Rationale**: Firefox provides unique APIs like StreamFilter that are essential for web scraping. Cross-browser compatibility adds unnecessary complexity and prevents us from leveraging Firefox-specific capabilities.

### II. Modular Background Architecture

Background scripts, workers, and supporting code MUST be separated into logical, independently importable modules in the `lib/` directory. Each module MUST have a single, well-defined responsibility.

**Rationale**: Modular architecture enables reuse across different scraping extensions, simplifies testing, and allows independent evolution of components like request capture, storage, and filtering.

### III. StreamFilter-Centric Design

HTTP response body capture MUST use Firefox's StreamFilter API. Code MUST gracefully handle StreamFilter unavailability and provide clear error messages. Alternative capture methods (e.g., declarativeNetRequest) may only be used when StreamFilter is insufficient.

**Rationale**: StreamFilter provides the most reliable method for capturing response bodies in Firefox extensions. Embracing it as the primary capture mechanism ensures consistency and leverages Firefox's strengths.

### IV. Module Independence

Each module in `lib/` MUST be independently testable, documented with clear JSDoc comments, and export a minimal public API. Modules MUST NOT depend on specific extension entry points (popup, background, content scripts) unless necessary.

**Rationale**: Independent modules form a reusable foundation for future scraping extensions. This principle prevents tight coupling and makes the codebase easier to maintain and extend.

### V. Typed Extensibility

All public APIs MUST use TypeScript types. Types MUST be exported and reusable across modules. Complex data structures MUST have explicit interfaces defined in shared type files.

**Rationale**: Strong typing catches errors early, improves developer experience, and enables better IDE support. Exporting types ensures modules can be used correctly in new extensions without ambiguity.

### VI. WXT Build System Constraint

All development, building, and testing MUST use WXT framework exclusively. No additional build platforms, bundlers, or testing frameworks MAY be introduced without explicit justification. Existing WXT commands (`pnpm dev`, `pnpm build`, `pnpm compile`) MUST be used for all standard operations.

**Rationale**: WXT provides comprehensive tooling for Firefox extension development. Introducing additional build tools or frameworks creates complexity, increases maintenance burden, and diverges from the project's established development workflow.

## Browser API Constraints

### Permitted Firefox APIs

- **webRequest**: MUST use for request/response interception
- **webRequest.filterResponseData** (StreamFilter): MUST use for response body capture
- **storage**: MUST use for persistent data storage
- **runtime**: MUST use for message passing
- **tabs**: MAY use for tab-specific operations when needed

### Prohibited APIs

- **chrome.* APIs**: MUST NOT use Chrome-specific APIs
- **declarativeNetRequest**: SHOULD NOT use as primary capture mechanism (webRequest preferred)
- **nativeMessaging**: MUST NOT use (out of scope for this project)

### API Availability Checks

All code using Firefox-specific APIs MUST check for availability at runtime and fail gracefully with clear error messages if unavailable.

## Development Workflow

### Module Development

1. Create module in `lib/` with clear, focused responsibility
2. Export minimal public API with TypeScript types
3. Add JSDoc documentation for all public functions
4. Write unit tests if applicable
5. Import and use in background.ts, popup, or content scripts

### Background Script Organization

Background scripts MUST:
- Import functionality from `lib/` modules
- Initialize webRequest listeners
- Handle runtime messages
- Coordinate between modules
- Minimize business logic (delegate to lib modules)

### Storage Strategy

In-memory storage is default for session data. Persistent storage MUST use browser.storage.local with clear data retention policies. Storage modules MUST be in `lib/storage.ts`.

## Testing Requirements

### Testing Framework Constraints

MUST use WXT's built-in testing capabilities and existing project tools (Vue Test Utils, Vitest if available in WXT ecosystem). No new testing frameworks MAY be introduced.

### Unit Tests

Modules in `lib/` SHOULD have unit tests that:
- Test public API surface only
- Mock browser APIs where necessary
- Verify error handling and edge cases
- Are runnable without extension context
- Use WXT-compatible testing tools

### Integration Tests

Integration tests MUST verify:
- Request capture through webRequest + StreamFilter
- Message passing between components
- Storage operations
- Error scenarios

Tests MUST be runnable via standard WXT commands or project scripts.

### Manual Testing

All features MUST be manually tested in Firefox Developer Edition or Nightly before merging to main. Use `pnpm dev:firefox` for development builds.

## Code Style

### TypeScript

- Use strict mode in tsconfig.json
- Avoid `any` types; use `unknown` if type is truly unknown
- Prefer `const` over `let`
- Use arrow functions for callbacks

### File Organization

```
lib/
├── types/          # Shared TypeScript types
├── config.ts       # Configuration management
├── storage.ts      # Storage operations
├── request-capture.ts # Request/response capture logic
└── stream-filter.ts   # StreamFilter wrapper

entrypoints/
├── background.ts   # Background service worker
├── popup/          # Popup UI
└── content.ts      # Content scripts
```

## Governance

### Amendment Process

1. Proposed amendment MUST be documented with rationale
2. Amendment MUST NOT violate existing principles without consensus
3. Changes affecting multiple modules require review and potential version bump
4. Document amendments in Sync Impact Report at top of constitution

### Versioning

Follow semantic versioning for constitution:
- **MAJOR**: Backward incompatible principle removals or redefinitions
- **MINOR**: New principle or section added
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

All pull requests MUST:
- Not violate any constitutional principles
- Follow modular architecture guidelines
- Maintain module independence
- Include type definitions for new public APIs

**Version**: 1.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2025-12-31
