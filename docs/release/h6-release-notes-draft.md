# Chart Kit v2 Stable Release Notes Draft

Status on May 10, 2026: draft for H6 owner review.

These notes are a stable-release draft, not the current Developer Preview
announcement. They should be edited before H6 approval if final scope changes.

## Headline

React Native Chart Kit v2 is a production-focused rebuild of Chart Kit with a
modern chart engine, safer mobile layout, a typed modern API, and a compatibility
path for existing `react-native-chart-kit` users.

## What Is New

- Monorepo package structure with renderer-agnostic core logic.
- Modern `@chart-kit/react-native` package for new adopters.
- Compatibility path through the existing `react-native-chart-kit` package.
- SVG renderer primitives as the default free rendering path.
- Modern LineChart and AreaChart with multi-series data, null gaps, smart
  labels, themed markers, reference overlays, thresholds, scrollable viewports,
  range selection, pan/zoom preview behavior, tooltips, crosshair, and
  accessibility helpers.
- Modern BarChart with grouped, stacked, 100% stacked, horizontal, negative,
  scrollable, selectable, animated, and themed examples.
- PieChart, DonutChart, ProgressChart, ContributionGraph, CalendarHeatmap,
  CombinedChart, and CandlestickChart preview foundations.
- Theme presets, light/dark mode, app-level theme switching in the showcase, and
  configurable tooltip/legend behavior.
- Expo showcase for visual review on web and native devices.
- Migration guide, prop mapping, codemod, production recipes, troubleshooting,
  issue templates, and release evidence docs.

## Compatibility

The v2 compatibility promise is partial and intentional:

- common v1 component names and data shapes are supported
- common chart config and display props map where practical
- old layout bugs, undocumented internals, SVG node order, and deep imports are
  not guaranteed
- migration docs explain known behavior changes

The existing package remains the continuity path:

```sh
npm install react-native-chart-kit
```

New adopters should prefer the modern package:

```sh
npm install @chart-kit/react-native @chart-kit/core @chart-kit/svg-renderer
```

## Preview And Pro-Candidate Scope

Advanced workflows such as financial charts, range selection, pan/zoom, Skia,
large-data performance workflows, and Pro package boundaries remain preview or
Pro-candidate unless explicitly promoted before H6.

`@chart-kit/pro` and `@chart-kit/skia-renderer` should not be published as
stable packages until their package plan is approved.

## Known Caveats To Keep If Still True At H6

- Native release workflow evidence exists, but final stable claims should match
  the exact tested surfaces.
- Physical Android and TalkBack remain disclosed preview gaps unless new owner
  or release-engineering evidence is recorded.
- Moderate Expo toolchain advisories may remain until an Expo-compatible
  upstream fix exists.
- Financial charts should stay labeled as Financial Preview unless promoted.

## Draft Changelog Entry

```md
## v7.0.0

- release Chart Kit v2 as the new production-focused chart generation
- add modern `@chart-kit/react-native`, `@chart-kit/core`, and
  `@chart-kit/svg-renderer` packages
- keep `react-native-chart-kit` as the compatibility package path
- add renderer-agnostic core packages for data normalization, scales, layout,
  geometry, interaction, themes, accessibility, and benchmarks
- add modern line, area, bar, stacked bar, pie, donut, progress, contribution,
  calendar heatmap, combined, and financial preview chart foundations
- add smart labels, safer default layout, themes, tooltips, crosshair,
  scroll/range workflows, and accessibility helpers
- add Expo showcase, visual regression coverage, docs, migration guide, codemod,
  recipes, troubleshooting, issue templates, and release evidence
- document the compatibility and deprecation policy for v1 users
```
