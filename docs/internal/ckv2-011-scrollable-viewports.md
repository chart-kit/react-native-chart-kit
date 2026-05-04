# CKV2-011 Scrollable Viewport Notes

Date: May 4, 2026

## Current State

LineChart now covers the first scroll/zoom slice for long mobile datasets.

Implemented:

- simple horizontal scroll through `scrollable`, `visiblePoints`, and `initialIndex`
- stable sticky Y-axis overlay for scrollable charts
- controlled viewport windows through `viewport` and `onViewportChange`
- direct one-finger main-plot pan for controlled viewports
- opt-in pinch zoom via `react-native-gesture-handler`
- range selector overview with move and resize interactions
- customizable range selector line, handle, and selected-window rendering
- parent scroll locking during main-plot and range-selector gestures
- stable Y-axis label width through `yAxisLabelWidth="stable"`
- animated Y-axis label crossfades through `axisLabelAnimation`
- scrub tooltip support inside the portfolio range selector demo
- visual and interaction coverage for scrollable, range selector, pan, and mini-chart dark mode cases

## API Shape

Simple scroll:

```tsx
<LineChart
  data={data}
  xKey="date"
  yKey="price"
  scrollable
  visiblePoints={30}
  initialIndex="end"
/>
```

Controlled viewport:

```tsx
const [viewport, setViewport] = useState({ startIndex: 40, endIndex: 90 });

<LineChart
  data={data}
  xKey="date"
  yKeys={["portfolio", "benchmark"]}
  viewport={viewport}
  onViewportChange={(event) => setViewport(event.viewport)}
  viewportInteraction={{ pan: true, pinchZoom: true }}
  rangeSelector={{ visible: true, interactive: true }}
/>;
```

## Verification

- `packages/core/test/viewport.test.ts` covers viewport windows, initial indexes, preset windows, range selector positions, handle resizing, zoom anchoring, min/max visible counts, and pan clamping.
- `packages/react-native/test/line-viewport-interaction.test.ts` covers interaction config, pan distance mapping, pinch sensitivity, and range selector custom render hooks.
- `apps/expo-showcase/visual/chart-interaction.spec.ts` covers public menu visibility, range selector move/resize, main-plot pan, mini-chart dark mode, scroll locking during range gestures, and passive scrollable comparison behavior.
- Visual stories include `v2-scrollable-price`, `v2-scrollable-dense`, `v2-scrollable-stock-comparison`, `v2-viewport-zoom-pan`, and `v2-range-selector`.

## Remaining Work

- Native iOS and Android QA for pinch zoom and nested scroll conflict behavior.
- Shared selection scope for screen-level outside-press dismissal and cross-chart selection coordination.
- Optional future gesture adapter for high-frequency scrub if responder-based scrub shows native jank.
- Performance benchmark coverage for very large viewport windows and range-selector overview paths.
