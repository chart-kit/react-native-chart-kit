# H4 Pro Scope Decision Packet

Status on May 5, 2026: ready for owner review, not approved.

This packet defines the recommended free-vs-Pro boundary for the v2 beta path. It does not add license checks or move exports. The implementation should keep the current preview surface intact until the owner approves this boundary.

## Recommended H4 Decision

Keep the free library excellent and broad. Make Pro about advanced production workflows that save teams implementation time or unlock high-performance apps.

Recommended beta decision:

- ship free v2 with SVG renderer, modern charts, compatibility facade, themes, accessibility helpers, basic interaction, tooltips, scrollable charts, and line/bar viewport controls
- keep range selector, pan/zoom, animation, and financial charts visible as preview features until API feedback stabilizes
- do not add runtime license gating before the free API and package boundaries are stable
- create Pro as a separate package later, not as conditional behavior hidden inside free chart components

## Free V2 Boundary

These should remain free because they are baseline production expectations for a modern mobile chart library.

| Area          | Free scope                                                                            |
| ------------- | ------------------------------------------------------------------------------------- |
| Renderer      | SVG renderer, theme-aware primitives, gradients, clipping, test IDs                   |
| Compatibility | `react-native-chart-kit` legacy component names and common data shapes                |
| Core charts   | Line, Area, Bar, StackedBar, Pie, Donut, Progress, Contribution, Combined baseline    |
| Layout        | auto padding, smart labels, legends, tooltip placement, debug layout                  |
| Themes        | light/dark/system, presets, custom preset creation, tooltip tokens                    |
| Interaction   | tap, scrub, selected points, basic shared tooltip, crosshair, bar/pie/donut selection |
| Scales/data   | explicit domains, null gaps, categorical/time/linear scales, decimation hooks         |
| Scrolling     | visible windows, initial index, scrollable line/bar charts, sticky-label-safe layout  |
| Accessibility | generated summaries, data table helpers, high-contrast theme                          |
| Tooling       | docs, Expo showcase, RN CLI smoke surface, codemod, visual tests, benchmarks          |

## Pro Candidate Boundary

These are reasonable Pro candidates because they are deeper product workflows, performance layers, or specialized domains.

| Area              | Pro candidate scope                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Renderer          | Skia renderer adapter, renderer parity tests, renderer-specific performance tuning          |
| Large data        | viewport windowing beyond baseline, LTTB/advanced decimation policies, native frame metrics |
| Gestures          | production pinch zoom, inertial pan, axis-locking, bottom-sheet/ScrollView conflict recipes |
| Cross-chart UX    | shared tooltips across charts, synchronized cursors, linked chart groups                    |
| Finance           | finished candlestick/financial module, advanced session handling, range selector polish     |
| Advanced overlays | annotations, reference bands, event markers, custom label placement solvers                 |
| Export            | PNG/SVG export helpers where platform support is reliable                                   |
| Enterprise        | accessibility reports, design-system token adapters, support matrices                       |

## Package Architecture

Recommended package direction:

```text
react-native-chart-kit          # compatibility package and migration bridge
@chart-kit/react-native         # modern free v2 public API
@chart-kit/skia-renderer        # optional/Pro renderer package, peer-depends on Skia
@chart-kit/pro                  # paid workflow package that composes free primitives
```

Implementation principles:

- keep free components free of license checks
- keep license logic out of `packages/core` and renderer-agnostic chart math
- make Pro features compose around free chart models rather than forking chart behavior
- keep Pro install optional so Expo/SVG users do not pay a native dependency cost
- let CI run without remote license activation

## Preview Feature Labels

Until H4 is approved, label these as preview in docs/showcase language instead of calling them free or Pro:

- LineChart range selector
- controlled pan and pinch-zoom windows
- animation previews
- CandlestickChart and financial workflows
- future Skia renderer experiments

## Owner Decisions Needed

H4 approval needs explicit answers:

1. Does `@chart-kit/pro` ship as a separate package?
2. Does `@chart-kit/skia-renderer` ship as a separate optional package or inside Pro?
3. Which current preview features must remain free at beta?
4. Can `CandlestickChart` remain public as Financial Preview?
5. Should the first beta publish without any license enforcement?

Recommended answers:

1. Yes, separate package.
2. Separate optional package, with Pro docs and examples depending on it.
3. Keep basic animation, tap/scrub, tooltips, simple viewport controls, and scrollable charts free.
4. Yes, but only as Financial Preview until native performance, early-close handling, and emergency-closure handling are proven.
5. Yes. Add license enforcement only after API feedback and package boundaries settle.
