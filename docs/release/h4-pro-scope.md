# H4 Pro Scope Decision Packet

Status on May 6, 2026: H4 approved with the recommendations in this packet. Pro remains a separate future package, Skia remains a separate optional preview renderer, and no license enforcement is added before beta.

This packet defines the approved free-vs-Pro boundary for the v2 beta path. It does not add license checks. The implementation keeps the main modern package barrel focused on the free/baseline API and exposes current Pro-candidate workflows through an explicit preview subpath while paid package implementation and native evidence continue.

## Approved H4 Decision

Keep the free library useful and trustworthy. Make Pro about the places real production apps bleed: layout certainty, touch workflows, commercial chart types, export, premium templates, and performance.

Approved beta decision:

- ship free v2 with SVG renderer, modern baseline charts, compatibility facade, themes, accessibility helpers, safe default layout, and basic examples
- keep currently implemented advanced interactions, range selector, pan/zoom, animation, and financial charts visible only as preview/pro-candidate features until API feedback stabilizes
- do not add runtime license gating before the free API and package boundaries are stable
- create Pro as a separate package later, not as conditional behavior hidden inside free chart components

Guardrail: do not make the free library look broken to create Pro value. Free charts should avoid obvious clipping and should have good defaults. Pro monetizes depth, polish, scale, and advanced workflows.

## Free V2 Boundary

These should remain free because they are baseline production expectations for a modern mobile chart library.

| Area          | Free scope                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Renderer      | SVG renderer, theme-aware primitives, gradients, clipping, test IDs                                         |
| Compatibility | `react-native-chart-kit` legacy component names and common data shapes                                      |
| Core charts   | Line, Area, Bar, StackedBar, Pie, Donut, Progress, Contribution baseline                                    |
| Layout        | safe default padding, no obvious label clipping, basic tick density, responsive chart area, debug layout    |
| Themes        | good default, dark mode, custom preset creation, tooltip tokens                                             |
| Interaction   | basic chart press events and simple selected-value examples; advanced touch workflows remain Pro candidates |
| Scales/data   | explicit domains, null gaps, categorical/time/linear scales, conservative decimation hooks                  |
| Scrolling     | basic scrollable chart examples; fixed-axis/brush/range workflows remain Pro candidates until approved      |
| Accessibility | generated summaries, data table helpers, high-contrast theme                                                |
| Tooling       | docs, Expo showcase, RN CLI smoke surface, codemod, visual tests, benchmarks                                |

## Pro Candidate Boundary

These are reasonable Pro candidates because they are deeper product workflows, performance layers, or specialized domains.

| Area              | Pro candidate scope                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Layout engine     | smart Y-axis width measurement, multi-line/rotated/ellipsized X labels, auto tick density, custom ticks, axis titles, true full-width plotting, small-screen solvers           |
| Interactions      | tooltips, crosshair, scrubbing, nearest-point selection, long press, selected-series highlighting, shared tooltips, zoom/pan, fixed Y-axis scrolling, brush/range selection    |
| Commercial charts | Candlestick/OHLC, financial presets, combo bar + line, dual-axis, grouped bars, horizontal stacked bars, advanced donut, gauge, radar, treemap, advanced contribution heatmaps |
| Export            | PNG/SVG export, snapshot API, share sheet integration, and future server-side/headless chart image generation                                                                  |
| Themes/templates  | beautiful presets, Apple Health style, Linear-style, fintech dark mode, analytics dashboard, minimal SaaS, fitness, crypto, accessibility-safe palettes, animated transitions  |
| Performance       | large dataset mode, decimation/downsampling, virtualized or windowed rendering, memoized path generation, optional Skia renderer, native benchmarks in docs                    |
| Enterprise        | accessibility reports, design-system token adapters, support matrices                                                                                                          |

## Package Architecture

Recommended package direction:

```text
react-native-chart-kit          # compatibility package and migration bridge
@chart-kit/react-native         # modern free v2 public API
@chart-kit/skia-renderer        # optional/Pro renderer package, peer-depends on Skia
@chart-kit/pro                  # paid workflow package that composes free primitives
```

`packages/skia-renderer` currently exposes capability metadata, install guidance, and an injected Skia primitive adapter. `LineChart` can accept the injected renderer for its main plot, range selector, sticky-axis, path-local area gradients, threshold rect clips, measured text anchors, default marker, default legend, default tooltip, and debug-layout surfaces. `BarChart` can accept the injected renderer for its chart body, sticky Y-axis, and default tooltip overlay. `PieChart` and `DonutChart` can accept the injected renderer for slices, connector lines, and SVG text labels. `ProgressChart`, `ProgressRing`, `ContributionGraph`, and `CalendarHeatmap` can accept the injected renderer for their chart primitives and SVG text labels. `CombinedChart` can accept the injected renderer for bars, lines, axes, legend, selection overlay, and default tooltip. `CandlestickChart` can accept the injected renderer for its OHLC body, volume bars, session markers, selection overlay, default tooltip, and range selector. `npm run skia:parity` covers the local Skia primitive tests plus LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, CombinedChart, and CandlestickChart renderer contracts. Sticky-axis labels require a Skia font, and native install evidence plus native renderer parity evidence remain pending in [skia-renderer-matrix.json](evidence/skia-renderer-matrix.json). Per H4, Skia remains a separate optional preview renderer package and does not add license gating before beta.

`packages/pro` currently exists only as a preview feature-registry, surface-boundary, and injected composition package. It has no license checks, no runtime activation, and no gated chart implementations. Its registry now mirrors the owner-proposed commercial buckets: `pro-layout-engine`, `pro-interactions`, `pro-chart-types`, `pro-export`, `pro-theme-templates`, `pro-performance`, `skia-renderer`, and `accessibility-reports`. Each feature entry records the included paid capabilities, the commercial rationale, and the free guardrail that keeps baseline v2 useful. Its package-boundary metadata classifies current exports as compatibility, free baseline, or Pro candidate, and it now tracks prop-level Pro candidate triggers such as `LineChart.rangeSelector`, `LineChart.interaction=scrub`, `BarChart.mode=grouped`, `BarChart.orientation=horizontal`, `CombinedChart`, `CandlestickChart`, active donut selection, and injected renderer props. This makes the final split reviewable before moving runtime code. Its React Native preview helper accepts an injected `@chart-kit/react-native/pro-preview` module and selects Pro-candidate exports without statically importing the free runtime package.

`@chart-kit/react-native/pro-preview` now exists as an explicit preview entrypoint for current Pro-candidate workflows. It exposes the current advanced LineChart, BarChart, DonutChart, CombinedChart, CandlestickChart, and chart-selection surface while the main `@chart-kit/react-native` barrel stays focused on the free/baseline API. This is not license gating and does not decide the final paid boundary; it gives demos, docs, and `@chart-kit/pro` a clean target before runtime code moves.

`npm run surface:check` now also verifies that public docs, showcase source, and docs-example type fixtures do not import explicit Pro-preview-only exports from the main modern package barrel.

The Developer Preview publish list is controlled by [package-manifest.json](evidence/package-manifest.json). Per H4/H5, `@chart-kit/skia-renderer` and `@chart-kit/pro` remain pack-checked preview packages with `publishInBeta: false` until paid-package implementation and native evidence are ready.

Implementation principles:

- keep free components free of license checks
- keep license logic out of `packages/core` and renderer-agnostic chart math
- make Pro features compose around free chart models rather than forking chart behavior
- keep Pro install optional so Expo/SVG users do not pay a native dependency cost
- let CI run without remote license activation
- paywall production depth and commercial workflows, not obvious bug fixes

## Preview Feature Labels

After H4 approval, keep these labeled as preview or Pro candidate in docs/showcase language instead of calling them final free or final Pro:

- advanced tooltip/crosshair/scrub workflows
- LineChart range selector and brush selection
- controlled pan and pinch-zoom windows
- animation previews and animated transitions
- CandlestickChart and financial workflows
- Combo/Dual-axis polish and advanced grouped/horizontal bar variants
- future Skia renderer experiments

## Approved Owner Decisions

H4 approved these answers on May 6, 2026:

1. Does `@chart-kit/pro` ship as a separate package?
2. Does `@chart-kit/skia-renderer` ship as a separate optional package or inside Pro?
3. Which current preview interactions must remain free at beta?
4. Can `CandlestickChart` remain public as Financial Preview?
5. Should combo/dual-axis, grouped bars, horizontal stacked bars, and advanced contribution heatmap move to Pro candidates?
6. Should the Developer Preview publish without any license enforcement?

7. Yes, separate package.
8. Separate optional preview package, with Pro docs and examples depending on it after native evidence is complete.
9. Keep simple press handlers and baseline selection examples free; label production touch workflows as Pro candidates until pricing is final.
10. Yes, but only as Financial Preview until native performance evidence is complete.
11. Yes, where they are commercial workflows rather than baseline chart primitives.
12. Yes. Add license enforcement only after API feedback and package boundaries settle.
