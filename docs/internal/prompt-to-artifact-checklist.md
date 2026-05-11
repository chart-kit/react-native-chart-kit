# Prompt-To-Artifact Checklist

Status on May 11, 2026: Developer Preview readiness is simplified and complete;
the current `7.0.0-next.1` npm publish remains pending. Stable RC remains a
later gate.

This checklist maps the original CKV2 prompt to current artifacts without requiring native QA matrices.

## Deliverable Coverage Matrix

| Requirement area                      | Current evidence                                                                                                                                                                                      | Verification                                                                                                                        | Status                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Repository audit and API inventory    | [repo-audit.md](repo-audit.md), [current-api-inventory.md](current-api-inventory.md), [compatibility-matrix-draft.md](compatibility-matrix-draft.md)                                                  | `npm run release:preview:gate` required-file checks                                                                                 | Covered for Developer Preview                    |
| H0/H1 package and compatibility gates | [h0-h1-decisions.md](h0-h1-decisions.md), [h4-owner-decision-memo.md](../release/h4-owner-decision-memo.md), [owner-gates.json](../release/evidence/owner-gates.json)                                 | `npm run release:preview:gate`, `npm run release:owner:record -- --list`                                                            | H0/H1/H4 approved for Developer Preview          |
| Monorepo and package structure        | `packages/core`, `packages/svg-renderer`, `packages/react-native`, `packages/skia-renderer`, `packages/pro`, `apps/expo-showcase`, `examples/rn-cli-basic`                                            | `npm run build`, `npm run pack:check`, `npm run surface:check`, `npm run boundaries:check`                                          | Covered                                          |
| Publishable package boundary          | [package-manifest.json](../release/evidence/package-manifest.json), [.github/workflows/publish.yml](../../.github/workflows/publish.yml), [npm-publish-runbook.md](../release/npm-publish-runbook.md) | `npm run pack:check`, `npm run release:publish:status`, `npm run release:preview:publish:preflight`, `npm run release:preview:gate` | Prepared; `7.0.0-next.1` not published yet       |
| Core engine: data, scales, layout     | `packages/core/src/data`, `packages/core/src/scales`, `packages/core/src/layout`, CKV2-002/003/004 notes                                                                                              | `npm run test`, `npm run typecheck`                                                                                                 | Covered                                          |
| Geometry and render models            | `packages/core/src/geometry`, line/bar/pie/progress/contribution/candlestick tests and stories                                                                                                        | `npm run test`, `npm run test:visual`                                                                                               | Covered for preview chart surfaces               |
| SVG renderer                          | `packages/svg-renderer`, [ckv2-005-svg-renderer.md](ckv2-005-svg-renderer.md)                                                                                                                         | `npm run svg:typecheck`, `npm run test:visual`                                                                                      | Covered                                          |
| Skia renderer boundary                | `packages/skia-renderer`, [skia-renderer-qa.md](../release/skia-renderer-qa.md), [skia-renderer-evidence.json](../release/evidence/skia-renderer-evidence.json)                                       | `npm run skia:parity`, `npm run boundaries:check`, `npm run release:preview:gate`                                                   | Preview evidence complete; package unpublished   |
| Free React Native components          | `packages/react-native/src/charts`, chart docs under `docs/charts`, Expo showcase stories                                                                                                             | `npm run rn:typecheck`, `npm run test`, `npm run test:visual`                                                                       | Covered                                          |
| v1 compatibility facade               | `react-native-chart-kit` root package, [from-v1.md](../migration/from-v1.md), [prop-mapping.md](../migration/prop-mapping.md), compatibility tests                                                    | `npm run test:compat`, `npm run test:visual`, `npm run docs:build`                                                                  | Covered for common v1 API/data shapes            |
| Interaction, tooltip, selection       | Line, bar, combined, pie/donut, and candlestick interaction code plus visual/e2e specs                                                                                                                | `npm run test:e2e`, `npm run test:visual`                                                                                           | Covered for preview interactions                 |
| Scroll, viewport, range selector      | Line and candlestick viewport/range-selector stories and financial viewport specs                                                                                                                     | `npm run test:visual`, `npm run benchmark`                                                                                          | Covered for preview                              |
| Accessibility baseline                | `packages/core/src/accessibility`, chart accessibility summaries, owner smoke notes                                                                                                                   | `npm run test`, `npm run docs:build`, [owner smoke notes](../release/artifacts/owner-smoke-notes-2026-05-10.md)                     | Covered for Developer Preview; RC claims limited |
| Themes and visual baselines           | theme packages/stories, [h6-visual-baseline-freeze.md](../release/h6-visual-baseline-freeze.md), screenshot baselines                                                                                 | `npm run test:visual`                                                                                                               | Current for Developer Preview; H6 freeze open    |
| Performance and benchmarks            | [ckv2-013-performance-benchmark.md](ckv2-013-performance-benchmark.md), benchmark scripts and latest audit notes                                                                                      | `npm run benchmark`                                                                                                                 | Covered for preview benchmarks                   |
| Docs, migration, recipes, codemod     | `docs/`, `scripts/chartkit-codemod.mjs`, public README files                                                                                                                                          | `npm run docs:build`, `npm run test:unit -- scripts/chartkit-codemod.test.mjs` via `npm run test`                                   | Covered                                          |
| Support workflow and issue templates  | `.github/ISSUE_TEMPLATE/*`, [known-issues.md](../release/known-issues.md), [h6-release-claims.md](../release/h6-release-claims.md)                                                                    | `npm run test:unit -- scripts/issue-templates.test.mjs`, `npm run release:preview:gate`                                             | Covered                                          |
| Security and release hardening        | [known-issues.md](../release/known-issues.md), [h6-release-notes-draft.md](../release/h6-release-notes-draft.md), release gate scripts                                                                | `npm run security:audit`, `npm run test:unit -- scripts/package-scripts.test.mjs`, `npm run release:preview:gate`                   | Covered for high/critical gate                   |
| Native/RN CLI release evidence        | [native-release-workflow.json](../release/evidence/native-release-workflow.json), [rn-cli-example-evidence.json](../release/evidence/rn-cli-example-evidence.json), runbooks                          | `npm run release:preview:gate`, `npm run example:rn-cli:typecheck`, native workflow evidence checks                                 | Prepared for preview; full stable claims limited |
| Owner smoke evidence                  | [owner-smoke-notes-2026-05-10.md](../release/artifacts/owner-smoke-notes-2026-05-10.md), [smoke-test-checks.md](../release/smoke-test-checks.md)                                                      | `npm run release:preview:gate`                                                                                                      | Covered without long owner QA matrices           |
| H6 release candidate                  | [ckv2-018-release-candidate.md](ckv2-018-release-candidate.md), H6 packet/checklist/release notes/claims docs, [owner-gates.json](../release/evidence/owner-gates.json)                               | `npm run release:owner:record -- --list`, `npm run release:gate:report`                                                             | Open; blocked only on eight H6 owner decisions   |

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

Latest owner-gate output:

```text
h4 approved    Pro/free boundary approval       0 pending decisions
h5 approved    Developer Preview release approval 0 pending decisions
h6 not-started Release-candidate approval       8 pending decisions
```
