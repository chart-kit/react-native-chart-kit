# CKV2-001 Foundation Notes

Date: May 1, 2026

## Current Slice

This slice introduces the first real package boundary without moving existing chart code.

Added:

- root npm workspace declaration for `packages/*`
- private `packages/core` scaffold
- strict TypeScript config for the core package
- `npm run core:typecheck`
- root `npm run typecheck` now includes core typechecking
- Vitest unit test runner
- core package boundary test

Not changed:

- current root package entrypoint
- current `src/` chart implementation
- current publish files
- visual harness ownership, which was moved to the Expo showcase in a later slice
- package manager choice

## Why This Shape

The approved strategy is an incremental monorepo. Creating `packages/core` first gives CKV2-002 a clean place to add renderer-agnostic data normalization without entangling new v2 engine code with the existing SVG components.

The package is private for now because it exports no real public API yet. It can become publishable when the core model stabilizes.

## Boundary Rules

`packages/core` must not import:

- `react`
- `react-native`
- `react-native-svg`
- renderer packages
- app/example code

It should expose deterministic functions and plain TypeScript models that can be consumed by SVG, Skia, compatibility adapters, docs fixtures, and tests.

## Next Recommended Work

Continue CKV2-001 with one of:

1. Add initial compatibility fixtures and make `npm run test:compat` real.
2. Start CKV2-002 by adding core data normalization types and tests.
3. Add CI coverage for `npm run test:visual` if runtime cost is acceptable.
