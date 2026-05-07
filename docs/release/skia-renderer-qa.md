# Skia Renderer QA Protocol

Status on May 7, 2026: protocol ready, local baseline recorded, iOS/Android optional-Skia install/build evidence captured, iOS/Android renderer-injected Release build evidence captured, and all native renderer-parity and Skia performance rows passed. Structured gate evidence lives in [skia-renderer-evidence.json](evidence/skia-renderer-evidence.json), with install, renderer-parity, and performance rows in [skia-renderer-matrix.json](evidence/skia-renderer-matrix.json). Use the generated [native QA checklist](native-qa-checklists.md) for row-by-row execution.

This protocol covers the native evidence required before `@chart-kit/skia-renderer` can move beyond preview. Local renderer-contract tests prove that the injected primitive adapter can satisfy chart renderer contracts, but they do not prove native installation, native text rendering, native gradients, native clipping, or release-build performance.

## Local Baseline

Run these before native Skia QA:

```sh
npm run skia:typecheck
npm run skia:parity
npm run boundaries:check
npm run pack:check
```

Current automated coverage:

- optional package boundary with no static `@shopify/react-native-skia` imports in free runtime packages
- injected Skia primitives for canvas, groups, paths, rects, circles, lines, text, gradients, and clipped groups
- local renderer-contract coverage for LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, CombinedChart, and CandlestickChart
- package pack dry-run for `@chart-kit/skia-renderer` while keeping it unpublished for Developer Preview
- local baseline artifact: [skia-local-baseline-2026-05-06.md](artifacts/skia-local-baseline-2026-05-06.md)

This baseline is required but not enough for a pass row in the Skia evidence matrix.

## Native Install Check

Use a temporary QA branch or throwaway working tree for native Skia install verification until the final Pro package is ready. Do not publish `@chart-kit/skia-renderer` or add permanent Skia runtime dependencies to the free package before owner approval.

Use the Skia native release helper to exercise that temporary path without committing `@shopify/react-native-skia` to the free showcase package:

```sh
npm run skia:native:dry-run
npm run skia:native:release -- --platform ios --artifact docs/release/artifacts/ios-skia-native-install.md
npm run skia:native:release -- --platform android --artifact docs/release/artifacts/android-skia-native-install.md
npm run skia:native:release -- --platform ios --renderer skia --artifact docs/release/artifacts/ios-skia-renderer-build.md
npm run skia:native:release -- --platform android --renderer skia --artifact docs/release/artifacts/android-skia-renderer-build.md
npm run skia:native:release -- --platform ios --renderer skia --ios-simulator <simulator-uuid> --keep-temp
```

The helper creates a temporary workspace from the current committed repo state, runs `npm ci`, installs the Skia peer into only that temporary showcase workspace, and delegates to the normal Expo native release check. It removes the temporary workspace unless `--keep-temp` is provided.
When `--renderer skia` is passed, the helper also injects a temporary `ChartKitProvider` renderer into the showcase app, typechecks the patched app, and then runs the native release build. This keeps the free showcase package dependency-free while making native Skia parity builds repeatable.
The helper also installs Skia's required `react-native-reanimated` peer in the temporary showcase workspace using Expo SDK 54's bundled `~4.1.1` range. This remains temporary QA state and does not add Reanimated to the published free packages.
When `--ios-simulator` is passed, the helper also installs and launches the temporary renderer-injected showcase on that simulator so the native QA capture helper can take screenshots from the rebuilt app.

Required checks:

- install `@shopify/react-native-skia` into the Expo showcase QA app
- keep `@chart-kit/skia-renderer` optional and peer-dependent
- verify SVG-default charts still build and run without static Skia imports
- run iOS and Android release builds with the optional native Skia dependency present
- capture build logs or workflow artifact links for both platforms

Record install evidence only after both the optional-Skia path and the SVG-default path are verified:

```sh
npm run release:qa:record -- \
  --matrix skia \
  --row ios-skia-native-install \
  --status pass \
  --evidence docs/release/artifacts/ios-skia-native-install.md \
  --reviewed-by "<name>" \
  --device "<device/os>" \
  --build-surface "<build>" \
  --notes "Optional Skia install checks passed"
```

## Renderer Parity Check

Free chart parity must verify:

- Line and Area surfaces
- Bar and StackedBar surfaces
- Pie and Donut surfaces
- Progress and ProgressRing surfaces
- ContributionGraph and CalendarHeatmap surfaces
- text labels, tooltips, legends, gradients, clipping, and selected-state overlays

Pro-preview parity must verify:

- CombinedChart surfaces
- CandlestickChart surfaces
- range selector surfaces
- sticky axes
- crosshair and tooltip overlays
- debug-layout surfaces

Use native screenshots or short recordings for each parity row. If the Skia preview fixture is opened manually, attach the captured artifact with:

```sh
npm run release:qa:record -- \
  --matrix skia \
  --row android-skia-free-chart-parity \
  --status pass \
  --evidence docs/release/artifacts/android-skia-free-chart-parity.png \
  --reviewed-by "<name>" \
  --device "<device/os>" \
  --build-surface "<build>" \
  --notes "Native renderer parity checks passed"
```

Do not mark a parity row as `pass` when only local Vitest contract tests have run. Use `partial` for local-only evidence.

## Performance Comparison

Compare SVG and Skia on the same native release-build scenarios:

- dense line overview
- multi-line shared-tooltip scrub
- range selector drag and thumb resize
- scrollable bar selection
- combined chart shared tooltip
- candlestick pan, pinch, and tap inspection

Capture the same metrics required by [native-performance-benchmark.md](native-performance-benchmark.md): platform, device, build type, renderer, data size, initial render time, frame timing, dropped frames where available, memory before/after, and visible correctness notes.

The Skia performance row should include both SVG and Skia measurements, not just a Skia-only screenshot.

## Evidence Rules

- Use `pending` for rows without evidence.
- Use `partial` for local-only evidence, one-platform evidence, or screenshots without the required manual checks.
- Use `pass` only after the row-specific native install, parity, or performance checks are complete on that platform.
- Record failures with `fail` and link the issue, screenshot, log, or recording.

Skia remains a preview renderer for product/package-boundary reasons until H6 owner approval, even though all rows in [skia-renderer-matrix.json](evidence/skia-renderer-matrix.json) are now complete.
