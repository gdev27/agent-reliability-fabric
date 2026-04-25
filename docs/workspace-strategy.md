# Workspace Strategy (Follow-up)

## Goal
Introduce explicit package boundaries and faster CI/test targeting without blocking current MVP delivery.

## Current pain points
- Multiple logical modules share one root package lifecycle.
- SDK, policy engine, workflows, and indexer changes are not independently versioned.
- CI cannot cheaply run only impacted package tests/typechecks.

## Recommended path
1. Add npm workspaces at the repo root (`packages/*` style or current-folder workspace globs).
2. Split modules into publishable/internal packages:
   - `policy-engine`
   - `agent-sdk`
   - `keeperhub-workflows`
   - `indexer`
   - `contracts` (tooling package)
3. Introduce package-local scripts for `build`, `test`, `typecheck`.
4. Add a lightweight task runner (Turbo or npm `-w`) for incremental execution.

## Migration approach
- Phase 1: workspace metadata + package manifests, keep root scripts as wrappers.
- Phase 2: move imports to package names and enforce `exports` boundaries.
- Phase 3: optimize CI with affected-package execution and caching.

## Non-goals (for this hardening PR)
- No large directory reshuffle.
- No release automation changes.
- No package publishing pipeline yet.
