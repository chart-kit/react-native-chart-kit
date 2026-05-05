# Chart Kit V2 Completion Audit

Status on May 5, 2026: not complete. The implementation is strong enough for continued beta preparation, but the full plan still has owner gates and native/Pro deliverables that cannot be treated as done.

## Objective

Finish the React Native Chart Kit v2 and v2 Pro plan from repository audit through release candidate.

Concrete success criteria:

- free v2 architecture, components, docs, examples, tests, visual baselines, benchmark, and migration path exist
- compatibility path for existing `react-native-chart-kit` users is covered
- modern `@chart-kit/react-native` path is usable without the old `chartConfig` API
- Pro/Skia/package boundary is approved and implemented or explicitly deferred
- native iOS and Android release-build behavior is verified
- H4, H5, and H6 owner gates are approved before beta/RC/stable release claims

## Evidence Snapshot

| Area                            | Evidence                                                                                                               | Status                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Repository audit                | `docs/internal/repo-audit.md`, `docs/internal/current-api-inventory.md`, `docs/internal/compatibility-matrix-draft.md` | Covered                                                        |
| H0/H1 decisions                 | `docs/internal/h0-h1-decisions.md`                                                                                     | Covered for initial package and compatibility direction        |
| Monorepo foundation             | `packages/core`, `packages/svg-renderer`, `packages/react-native`, `apps/expo-showcase`                                | Covered                                                        |
| Required commands               | `package.json` scripts for lint, typecheck, test, visual, compat, e2e, benchmark, examples, docs                       | Covered, except native example commands are manual dev targets |
| Core model/scales/layout        | `packages/core/src`, unit tests under `packages/core/test`                                                             | Covered for current chart scope                                |
| SVG renderer                    | `packages/svg-renderer/src`, renderer tests                                                                            | Covered                                                        |
| Line/area                       | modern API, range selector, pan/pinch preview, tooltips, markers, references, decimation, visual stories               | Covered for current free preview                               |
| Bar/stacked bar                 | grouped, stacked, stacked100, negative, horizontal, scrollable, selection, tooltip, `renderBar`, visual stories        | Covered for modern API and stacked compat                      |
| Pie/donut/progress/contribution | modern components, theming, interaction where applicable, docs, visual stories                                         | Covered for baseline                                           |
| Combined chart                  | dual-axis bar + line, shared tooltip, visible-series toggles, negative visual coverage                                 | Covered for baseline                                           |
| Candlestick                     | OHLC geometry, volume, tap tooltip, viewport gestures, range selector, scrollable preview                              | Covered as financial preview                                   |
| Theme system                    | provider, presets, app-level mode/preset switching, tooltip theme tokens                                               | Covered                                                        |
| Interaction                     | selection provider, tap/scrub, tooltips, crosshair, bar/pie/donut/candlestick interactions                             | Covered on web showcase; native QA still missing               |
| Accessibility baseline          | summary/table helpers across major chart families                                                                      | Covered for helpers; native screen-reader QA missing           |
| Benchmark                       | `npm run benchmark`, `docs/release/h5-beta-gate-evidence.md`                                                           | Covered for core geometry and web scrub timing                 |
| Docs and recipes                | `docs/README.md`, chart docs, migration, prop mapping, recipes, troubleshooting                                        | Covered                                                        |
| Docs verification               | `npm run docs:build` validates links, fences, and public TS/TSX examples                                               | Covered                                                        |
| Codemod                         | `scripts/chartkit-codemod.mjs`, `chartkit-codemod v1-to-v2`                                                            | Covered for conservative compatibility-prop insertion          |
| Visual baseline                 | `apps/expo-showcase/visual/__screenshots__`, `npm run test:visual`                                                     | Covered for current web showcase                               |
| Release packet                  | beta checklist, H5 evidence, owner decision memo, known issues, changelog                                              | Covered for owner review                                       |

## Missing Or Not Fully Verified

| Requirement                  | Missing evidence                                                       | Why it matters                                                                        |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Native iOS release build     | No automated release build or artifact                                 | Required before production beta/RC confidence                                         |
| Native Android release build | No automated release build or artifact                                 | Required before production beta/RC confidence                                         |
| Native e2e/runtime QA        | Only web Playwright e2e is automated                                   | Gestures, scroll conflicts, text rendering, and release behavior can differ on device |
| React Native CLI example     | No separate RN CLI app exists                                          | Spec requested Expo and RN CLI examples; current example surface is Expo showcase     |
| H4 Pro scope                 | No owner-approved Pro/free boundary or package/license implementation  | Required before labeling animation/range/zoom/financial/Skia features as free or Pro  |
| Skia renderer                | No `packages/skia-renderer` implementation                             | Spec lists this as Pro/performance scope                                              |
| Native performance benchmark | No release-device timing/FPS/memory data                               | Current benchmark is core geometry plus web scrub timing                              |
| Screen-reader QA             | No iOS VoiceOver/Android TalkBack evidence                             | Accessibility helpers exist, but native assistive-tech behavior is not verified       |
| Candlestick market sessions  | No market-session gap handling                                         | Financial chart remains preview, not a complete Pro financial chart                   |
| H5 approval                  | Owner has not approved beta publication                                | Beta cannot be claimed published/approved                                             |
| H6 approval                  | No RC approval, final semver, final release notes, final visual freeze | Release candidate cannot be claimed                                                   |

## Current Gate Position

- H0/H1: covered by prior decisions.
- H2/H3: preview implementation and API are reviewable; final design/API freeze still belongs to beta/RC review.
- H4: open. Pro package, Skia, licensing, and free-vs-Pro boundaries need owner decision.
- H5: open. Evidence packet exists, but recommendation remains "keep iterating before npm beta" unless owner explicitly accepts native gaps for an API-preview beta.
- H6: not started. RC requires native release-build evidence, final semver, final changelog, docs freeze, and owner approval.

## Recommended Next Decisions

1. Decide whether to build RN CLI/native release infrastructure now, or label the next beta as web/Expo API preview.
2. Decide H4 Pro boundary for range selector, pan/zoom, animation, candlestick, Skia, and large-data features.
3. Decide whether `CandlestickChart` remains in public preview or moves behind a financial/Pro preview label.
4. If production beta is the target, prioritize native release builds and device QA before adding more chart features.
