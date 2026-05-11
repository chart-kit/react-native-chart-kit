# Prompt-To-Artifact Checklist

Status on May 10, 2026: Developer Preview path is simplified and complete; stable RC remains a later gate.

This checklist maps the original CKV2 prompt to current artifacts without requiring native QA matrices.

## Covered Developer Preview Milestones

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

## Open Stable-RC Milestone

- CKV2-018 release candidate: not complete and intentionally blocked on H6
  owner approval

Mapped artifacts:

- [CKV2-018 release candidate notes](ckv2-018-release-candidate.md)
- [H6 RC readiness packet](../release/h6-rc-readiness-packet.md)
- [H6 finalization checklist](../release/h6-finalization-checklist.md)
- [H6 owner decision memo](../release/h6-owner-decision-memo.md)
- [Owner gate evidence](../release/evidence/owner-gates.json)

## Active Gates

| Gate                       | Status                                       |
| -------------------------- | -------------------------------------------- |
| H0 package strategy        | Covered                                      |
| H1 compatibility direction | Covered                                      |
| H2 visual direction        | Preview approved through showcase review     |
| H3 core API direction      | Preview approved through docs/showcase usage |
| H4 Pro/free split          | Approved for Developer Preview boundary      |
| H5 Developer Preview       | Approved                                     |
| H6 stable RC               | Not started; decision packet drafted         |

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

The old summary evidence manifests are also archived:

- `docs/release/evidence/native-runtime-qa.json`
- `docs/release/evidence/native-accessibility-qa.json`
- `docs/release/evidence/native-performance-benchmark.json`

Each archived manifest is historical evidence only, with no active `requiredFor`
gates and no active `missingEvidence` list.

The old `release:qa:*` matrix recorder/status/capture scripts were removed. Use `npm run release:preview:gate` for preview readiness and concise smoke-test notes for human feedback.

## Remaining Stable-RC Decisions

- release candidate approval
- final semver
- final changelog
- docs freeze
- visual baseline freeze
- deprecation policy approval
- Pro and Skia package plan
- exact release claims

Draft H6 artifacts exist for these decisions in `docs/release/`. The H6
approval dry-run passes with all eight labels, so the active release gate
remains blocked only until the owner explicitly approves H6.
