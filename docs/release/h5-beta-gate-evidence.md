# H5 Beta Gate Evidence

Status on May 5, 2026: ready for owner review, not approved for publishing.

This document maps CKV2 beta-gate requirements to concrete repository evidence. It is intentionally stricter than a test summary: passing checks are useful only where they cover the stated requirement.

## Objective

Prepare the first public beta decision packet for Chart Kit v2:

- passing local verification for current implementation
- example app and visual artifacts available for review
- migration docs and issue list available
- benchmark data available
- explicit gaps and owner decisions documented

## Verification Evidence

Commands refreshed on May 5, 2026. The `test:e2e` row was added after promoting the web-showcase interaction suite from a placeholder to a real command.

| Requirement           | Evidence              | Result                                                                       |
| --------------------- | --------------------- | ---------------------------------------------------------------------------- |
| Lint                  | `npm run lint`        | Passed                                                                       |
| TypeScript            | `npm run typecheck`   | Passed for root, core, SVG renderer, React Native package, and Expo showcase |
| Unit and compat tests | `npm run test`        | Passed: 33 unit files, 196 unit tests, 1 compat file, 5 compat tests         |
| Web e2e interactions  | `npm run test:e2e`    | Passed: Playwright showcase interaction flows                                |
| Visual regression     | `npm run test:visual` | Passed: 87 Playwright tests                                                  |
| Benchmark             | `npm run benchmark`   | Passed: core line and bar geometry scenarios                                 |
| Docs verification     | `npm run docs:build`  | Passed: 48 markdown files                                                    |
| Package build         | `npm run build`       | Passed                                                                       |

Latest benchmark highlights from `npm run benchmark`:

| Scenario                      |  Median |     p95 |
| ----------------------------- | ------: | ------: |
| `line-100`                    | 0.06 ms | 0.22 ms |
| `line-1000`                   | 0.43 ms | 1.55 ms |
| `line-10000-decimated`        | 1.56 ms | 2.67 ms |
| `multi-line-5x1000-decimated` | 1.52 ms | 2.36 ms |
| `bar-500-scrollable-grouped`  | 0.19 ms | 0.36 ms |
| `bar-500-scrollable-stacked`  | 0.22 ms | 0.59 ms |

Benchmark scope is core geometry only. It does not measure native render time, gesture FPS, or release-build memory.

## Prompt-To-Artifact Checklist

| Spec requirement       | Artifact or evidence                                                                                     | Coverage status                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Passing test suite     | `npm run test`; unit tests under `packages/core/test` and `packages/react-native/test`                   | Covered for current unit and compatibility scope                               |
| E2E command            | `npm run test:e2e`; `apps/expo-showcase/visual/chart-interaction.spec.ts`                                | Covered for web showcase interactions; not native runtime                      |
| Visual baseline        | `apps/expo-showcase/visual/__screenshots__`; `npm run test:visual`                                       | Covered for 69 chart-story screenshots plus interaction tests                  |
| Example app            | `apps/expo-showcase`; `npm run example:expo`; [Expo showcase README](../../apps/expo-showcase/README.md) | Available for manual phone review; not automated native release coverage       |
| Migration guide        | [From v1](../migration/from-v1.md)                                                                       | Covered                                                                        |
| Prop mapping           | [Prop mapping](../migration/prop-mapping.md)                                                             | Covered for common props                                                       |
| Install docs           | [Installation](../getting-started/installation.md)                                                       | Covered with package-path caveat                                               |
| Recipes                | [Production recipes](../recipes/README.md)                                                               | Covered                                                                        |
| Docs example types     | `packages/react-native/test/docs-examples.typecheck.tsx`; `npm run rn:typecheck`                         | Covered for representative examples; not every markdown fence                  |
| Issue list             | [Known issues](known-issues.md)                                                                          | Covered                                                                        |
| Benchmark results      | `npm run benchmark`; this document                                                                       | Covered for core geometry only                                                 |
| Changelog              | [Changelog](../../CHANGELOG.md)                                                                          | Covered for current v7 preview                                                 |
| Support workflow       | `.github/ISSUE_TEMPLATE/*`                                                                               | Covered for layout, compatibility, and performance bugs                        |
| Release command safety | `.github/workflows/publish.yml`                                                                          | Covered for branch, duplicate version, dist-tag, tests, docs, and build checks |
| CI checks              | `.github/workflows/ci.yml`                                                                               | Covered for lint, typecheck, test, docs, benchmark, and build                  |

## Visual Coverage Summary

The visual suite includes modern line/area, bar, combined, financial, pie/donut, progress, contribution, and legacy compatibility fixtures. Current story IDs are listed in `apps/expo-showcase/visual/stories.ts`.

Notable covered cases:

- line animation, range selector, viewport pan/zoom, scrollable datasets, dense labels, rotated labels, staggered labels, null gaps, custom markers, custom crosshair, reference overlays, thresholds, themes
- bar grouped, selectable, animated, scrollable, scrollable selectable, horizontal, negative, stacked percentage, themed behavior
- combined dual-axis, shared tooltip, legend toggles, negative values
- pie/donut external labels, custom legend, active slice selection
- progress and contribution theme inheritance
- candlestick price-action preview
- legacy line, bar, and stacked-bar fixtures

## Known Gaps

These are not covered by the green checks:

- native iOS release build
- native Android release build
- native e2e tests beyond the web showcase interaction suite
- React Native CLI example apps
- automatic extraction and compilation of every docs snippet
- Skia renderer and Pro package split
- final public package/import path
- final free-vs-Pro boundary for animation, range selector, zoom, and financial features

The placeholder commands `npm run example:ios` and `npm run example:android` intentionally fail and must not be counted as passing native checks.

## Owner Decisions Required

H5 can proceed only after the owner decides:

- publish beta now or keep iterating
- final beta package name and import path
- whether native release-build gaps are acceptable for beta
- whether advanced line interactions visible in the showcase remain free, move to Pro, or stay labeled preview
- whether `CandlestickChart` is included in public beta or remains financial preview

See [H5 owner decision memo](h5-owner-decision-memo.md) for recommended defaults.

If any answer is negative, keep iterating against [known issues](known-issues.md) before publishing.
