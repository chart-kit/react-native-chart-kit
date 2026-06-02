---
title: Production Recipes
description: Practical patterns for measuring, theming, interacting with, and testing charts in apps.
---

# Production Recipes

Recipes are scenario-first examples for product teams. They should use the modern API and avoid old `chartConfig` patterns.

Status: public recipes use only `react-native-chart-kit/v2`.

## Portfolio Price History

Use this for investing, crypto, bank wealth, or subscription analytics history screens.

```tsx
<LineChart
  data={portfolioHistory}
  xKey="date"
  yKeys={["portfolio", "benchmark"]}
  curve="monotone"
  interaction={{ mode: "scrub", selectionPersistence: "whileActive" }}
  tooltip={{
    shared: true,
    anchor: "pointer",
    placement: "above",
    offset: 18,
    positionAnimationDuration: 360
  }}
  crosshair
  viewport={viewport}
  onViewportChange={(event) => setViewport(event.viewport)}
  viewportInteraction={{ pan: true, pinchZoom: true, lockParentScroll: true }}
  rangeSelector={{
    visible: true,
    interactive: true,
    height: 72,
    handleWidth: 18
  }}
  yAxisLabelWidth="stable"
  formatYLabel={(value) => `$${Math.round(value / 1000)}k`}
  width={410}
  height={360}
/>
```

Features used: multi-series, scrub selection, shared tooltip, crosshair, controlled viewport, one-finger pan, pinch zoom, mini-chart range selector, stable y-axis label width.

## Scrollable Acquisition Bars

Use this for paid acquisition, product analytics, revenue cohorts, or marketplace supply dashboards.

```tsx
<BarChart
  data={weeklyAcquisition}
  xKey="week"
  series={[
    { yKey: "organic", label: "Organic" },
    { yKey: "paid", label: "Paid" }
  ]}
  scrollable
  visiblePoints={8}
  initialIndex="end"
  interaction={{ mode: "tap", deselectOnOutsidePress: true }}
  tooltip={{ anchor: "pointer", placement: "above", width: 132 }}
  selectionAnimation={{ duration: 220 }}
  width={410}
  height={280}
/>
```

Features used: grouped bars, horizontal scrolling, selected bar tooltip, outside-press dismissal inside the chart, animated selection state, pinned y-axis.

## Donut Plan Mix

Use this for subscription plan mix, revenue split, usage allocation, or spend category breakdowns.

```tsx
<DonutChart
  data={plans}
  valueKey="revenue"
  labelKey="plan"
  legend={{ maxItemWidth: "100%" }}
  centerLabel={({ total }) => `$${Math.round(total / 1000)}k`}
  activeSlice={{ inactiveOpacity: 0.36, strokeWidth: 4 }}
  interaction={{ mode: "tap" }}
  width={410}
  height={260}
/>
```

Features used: donut arcs, wrapped bottom legend, center label, active slice styling, tap selection.

## Product Usage Heatmap

Use this for habit tracking, GitHub-style activity, product usage streaks, or health completion calendars.

```tsx
<ContributionGraph
  values={usageDays}
  endDate="2026-05-03"
  numDays={154}
  weekStartsOn={1}
  onDayPress={(event) => setSelectedDay(event)}
  width={410}
  height={190}
/>
```

Features used: stable date-to-cell mapping, month labels, weekday labels, color thresholds, empty-day rendering, day press events.
