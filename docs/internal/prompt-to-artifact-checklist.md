# Prompt-To-Artifact Checklist

Status on May 10, 2026: Developer Preview path is simplified and complete; stable RC remains a later gate.

This checklist maps the original CKV2 prompt to current artifacts without requiring native QA matrices.

## Covered Milestones

- CKV2-000 repository audit
- CKV2-001 monorepo foundation
- CKV2-002 data normalization
- CKV2-003 scales and domains
- CKV2-004 layout engine
- CKV2-005 SVG renderer
- CKV2-006 line/area charts
- CKV2-007 bar/stacked bar charts
- CKV2-008 pie/donut/progress/contribution charts
- CKV2-009 theme system
- CKV2-010 interactions
- CKV2-011 scrollable viewports and range selector
- CKV2-012 accessibility helpers
- CKV2-013 benchmark and Skia preview boundary
- CKV2-014 combined chart preview
- CKV2-015 candlestick/financial preview
- CKV2-016 docs/migration/recipes
- CKV2-017 Developer Preview preparation

## Active Gates

| Gate                       | Status                                       |
| -------------------------- | -------------------------------------------- |
| H0 package strategy        | Covered                                      |
| H1 compatibility direction | Covered                                      |
| H2 visual direction        | Preview approved through showcase review     |
| H3 core API direction      | Preview approved through docs/showcase usage |
| H4 Pro/free split          | Approved for Developer Preview boundary      |
| H5 Developer Preview       | Approved                                     |
| H6 stable RC               | Not started                                  |

## Active Commands

Developer Preview readiness:

```sh
npm run release:preview:gate
```

Stable RC readiness:

```sh
npm run release:gate
```

Core verification:

```sh
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:visual
npm run benchmark
npm run docs:build
npm run build
npm run pack:check
```

## Removed From Active Completion

The old runtime, accessibility, and performance matrices are archived reference data only. They are no longer required commands, owner tasks, or Developer Preview blockers.

The old `release:qa:*` matrix recorder/status/capture scripts were removed. Use `npm run release:preview:gate` for preview readiness and concise smoke-test notes for human feedback.

## Remaining Stable-RC Decisions

- final semver
- final changelog
- docs freeze
- visual baseline freeze
- deprecation policy
- Pro package timing and licensing
- whether more native evidence is needed for the exact release claims
