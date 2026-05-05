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

Commands refreshed on May 5, 2026. The `test:e2e` row was added after promoting the web-showcase interaction suite from a placeholder to a real command. The native release-build dry-run row verifies the command path and generated build commands, not a native build artifact.

| Requirement            | Evidence                           | Result                                                                                              |
| ---------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| Lint                   | `npm run lint`                     | Passed                                                                                              |
| TypeScript             | `npm run typecheck`                | Passed for root, core, SVG renderer, React Native package, and Expo showcase                        |
| Unit and compat tests  | `npm run test`                     | Passed: 37 unit files, 215 unit tests, 1 compat file, 5 compat tests                                |
| Web e2e interactions   | `npm run test:e2e`                 | Passed: 21 Playwright showcase interaction flows                                                    |
| Visual regression      | `npm run test:visual`              | Passed: 94 Playwright tests                                                                         |
| Benchmark              | `npm run benchmark`                | Passed: core geometry scenarios plus web showcase scrub timing                                      |
| Public surface audit   | `npm run surface:check`            | Passed: `react-native-chart-kit` compatibility exports and `@chart-kit/react-native` modern exports |
| Docs verification      | `npm run docs:build`               | Passed: markdown, JS/TS fence, and public TS/TSX example validation                                 |
| RN CLI example source  | `npm run example:rn-cli:typecheck` | Passed: non-Expo app source and local package aliases type-check                                    |
| Native release dry-run | `npm run native:release:dry-run`   | Passed: prints Expo prebuild, Android Gradle release, CocoaPods, and iOS xcodebuild commands        |
| iOS release build      | `npm run native:release:ios`       | Passed locally outside the sandbox; green CI workflow artifact still required for H5/H6             |
| Android release build  | `npm run native:release:android`   | Blocked locally by missing Java preflight; CI workflow configures Java and needs a run              |
| Package build          | `npm run build`                    | Passed                                                                                              |

Latest benchmark highlights from `npm run benchmark`:

| Scenario                           |  Median |     p95 |
| ---------------------------------- | ------: | ------: |
| `line-100`                         | 0.06 ms | 0.17 ms |
| `line-1000`                        | 0.42 ms | 0.75 ms |
| `line-10000-decimated`             | 1.43 ms | 3.11 ms |
| `multi-line-5x1000-decimated`      | 1.46 ms | 1.83 ms |
| `line-10000-window-2000`           | 0.71 ms | 1.16 ms |
| `range-selector-2x10000-overview`  | 2.56 ms | 3.31 ms |
| `bar-500-scrollable-grouped`       | 0.17 ms | 0.31 ms |
| `bar-500-scrollable-stacked`       | 0.25 ms | 0.33 ms |
| `candlestick-1000`                 | 0.23 ms | 0.32 ms |
| `line-scrub-v2-scrub`, frame times | 8.20 ms | 9.60 ms |

Benchmark scope covers core geometry plus one web showcase scrub timing scenario. It does not measure native render time, native gesture FPS, or release-build memory.

## Prompt-To-Artifact Checklist

| Spec requirement        | Artifact or evidence                                                                                                                                                | Coverage status                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Passing test suite      | `npm run test`; unit tests under `packages/core/test` and `packages/react-native/test`                                                                              | Covered for current unit and compatibility scope                                                                    |
| E2E command             | `npm run test:e2e`; `apps/expo-showcase/visual/chart-interaction.spec.ts`                                                                                           | Covered for web showcase interactions; not native runtime                                                           |
| Visual baseline         | `apps/expo-showcase/visual/__screenshots__`; `npm run test:visual`                                                                                                  | Covered for 73 chart-story screenshots plus 21 interaction tests                                                    |
| Example apps            | `apps/expo-showcase`; `examples/rn-cli-basic`; `npm run example:expo`; `npm run example:ios`; `npm run example:android`; `npm run example:rn-cli:typecheck`         | Expo showcase is available for manual review; RN CLI source type-checks; neither is a native release-build artifact |
| Native release workflow | `.github/workflows/native-release.yml`; [Native release checks](native-release-checks.md); `scripts/run-expo-native-release-check.mjs`                              | Configured for Android/iOS release-build verification; still requires a green workflow run before RC                |
| H4 Pro scope packet     | [H4 Pro scope decision packet](h4-pro-scope.md)                                                                                                                     | Drafted for owner review; not approved                                                                              |
| Migration guide         | [From v1](../migration/from-v1.md)                                                                                                                                  | Covered                                                                                                             |
| Codemod                 | `scripts/chartkit-codemod.mjs`; `npx chartkit-codemod v1-to-v2 ./src`                                                                                               | Covered for conservative compatibility-prop insertion and migration warnings                                        |
| Prop mapping            | [Prop mapping](../migration/prop-mapping.md)                                                                                                                        | Covered for common props                                                                                            |
| Install docs            | [Installation](../getting-started/installation.md)                                                                                                                  | Covered for compatibility and modern package paths                                                                  |
| Recipes                 | [Production recipes](../recipes/README.md)                                                                                                                          | Covered                                                                                                             |
| Docs example checks     | `npm run docs:build`; `packages/react-native/test/docs-examples.typecheck.tsx`; `npm run rn:typecheck`                                                              | Syntax-covered for every JS/TS markdown fence; type-covered for public docs and representative integrated examples  |
| Issue list              | [Known issues](known-issues.md)                                                                                                                                     | Covered                                                                                                             |
| Benchmark results       | `npm run benchmark`; this document                                                                                                                                  | Covered for core geometry and web scrub timing                                                                      |
| Native release results  | [Native release results](native-release-results.md)                                                                                                                 | Partial: iOS passed locally; Android still needs Java-backed CI/local evidence                                      |
| Native runtime QA       | [Native runtime QA protocol](native-runtime-qa.md); `npm run test:e2e`; `npm run test:visual`                                                                       | Protocol exists; manual iOS/Android gesture/runtime evidence still pending                                          |
| Accessibility QA        | [Accessibility QA protocol](accessibility-qa.md); `packages/react-native/test/chart-accessibility.test.ts`; `packages/react-native/test/line-accessibility.test.ts` | Automated helper coverage exists; native VoiceOver/TalkBack evidence still pending                                  |
| Changelog               | [Changelog](../../CHANGELOG.md)                                                                                                                                     | Covered for current v7 preview                                                                                      |
| Support workflow        | `.github/ISSUE_TEMPLATE/*`                                                                                                                                          | Covered for layout, compatibility, and performance bugs                                                             |
| Public export surface   | `scripts/verify-public-surface.mjs`; `npm run surface:check`                                                                                                        | Covered for root compatibility exports and modern v2 exports                                                        |
| Release command safety  | `.github/workflows/publish.yml`                                                                                                                                     | Covered for branch, duplicate version, dist-tag, tests, docs, and build checks                                      |
| CI checks               | `.github/workflows/ci.yml`; `.github/workflows/native-release.yml`                                                                                                  | Covered for fast checks and native release-build workflow definition; native workflow result still pending          |

## Visual Coverage Summary

The visual suite includes modern line/area, bar, combined, financial, pie/donut, progress, contribution, and legacy compatibility fixtures. Current story IDs are listed in `apps/expo-showcase/visual/stories.ts`.

Notable covered cases:

- line animation, range selector, viewport pan/zoom, scrollable datasets, dense labels, rotated labels, staggered labels, null gaps, custom markers, custom crosshair, reference overlays, thresholds, themes
- bar grouped, selectable, animated, scrollable, scrollable selectable, custom renderer, horizontal, negative, stacked percentage, themed behavior
- combined dual-axis, shared tooltip, legend toggles, negative values
- pie/donut external labels, custom legend, active slice selection
- progress and contribution theme inheritance
- candlestick price-action preview, session-gap markers, range selector, and scrollable long-history preview
- legacy line, bar, and stacked-bar fixtures

## Known Gaps

These are not covered by the green checks:

- green native iOS release-build workflow artifact, despite local iOS release-build success
- green native Android release-build workflow artifact
- completed native runtime QA log beyond the web showcase interaction suite
- generated native RN CLI `ios/` and `android/` release-build projects
- Skia renderer and Pro package split
- final free-vs-Pro boundary for animation, range selector, zoom, and financial features

The example commands `npm run example:ios` and `npm run example:android` launch the Expo showcase through Expo dev tooling. They are manual review commands and must not be counted as passing native release-build or native e2e checks.

## Owner Decisions Required

H5 can proceed only after the owner decides:

- publish beta now or keep iterating
- whether native release-build gaps are acceptable for beta
- whether advanced line interactions visible in the showcase remain free, move to Pro, or stay labeled preview
- whether `CandlestickChart` is included in public beta or remains financial preview

See [H5 owner decision memo](h5-owner-decision-memo.md) for recommended defaults.

If any answer is negative, keep iterating against [known issues](known-issues.md) before publishing.
