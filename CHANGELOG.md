# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

### Added
- CI workflow for compile, tests, and typecheck on push/PR.

### Removed
- Non-shipping clutter: vendored `devtools/agent-workflows/`, internal planning and CI notes under `docs/`, session dry-run report, and unlinked `docs/regulatory-mapping.md`.

### Changed
- Submission and deployment docs now use concrete status wording instead of raw placeholders.
- README core command list now includes `typecheck` and `ens:passport`.
