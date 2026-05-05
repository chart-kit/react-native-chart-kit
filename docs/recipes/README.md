# Production Recipes

Recipes are scenario-first examples for product teams. They should use the modern API and avoid old `chartConfig` patterns.

## Portfolio Price History

Use this for investing, crypto, bank wealth, or subscription analytics history screens.

```tsx
<LineChart
  data={portfolioHistory}
  xKey="date"
  yKeys={["portfolio", "benchmark"]}
  curve="monotone"
  interaction={{ mode: "scrub", selectionPersistence: "whileActive" }}
  tooltip={{ shared: true, positionAnimationDuration: 360 }}
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
  width={360}
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
  tooltip={{ width: 132 }}
  selectionAnimation={{ duration: 220 }}
  width={360}
  height={280}
/>
```

Features used: grouped bars, horizontal scrolling, selected bar tooltip, outside-press dismissal inside the chart, animated selection state, pinned y-axis.

## Revenue And Margin

Use this for SaaS dashboards, finance dashboards, or marketplace business reporting.

```tsx
<CombinedChart
  data={monthlyRevenue}
  xKey="month"
  bars={[{ yKey: "revenue", label: "Revenue", yAxisId: "left" }]}
  lines={[
    { yKey: "margin", label: "Margin", yAxisId: "right", curve: "monotone" }
  ]}
  formatLeftYLabel={(value) => `$${value}k`}
  formatRightYLabel={(value) => `${value}%`}
  interaction={{ mode: "tap" }}
  tooltip={{ shared: true }}
  width={360}
  height={280}
/>
```

Features used: combined bar plus line, dual y-axis domains, shared tooltip, synchronized series labels, negative value support where needed.

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
  width={360}
  height={260}
/>
```

Features used: donut arcs, wrapped bottom legend, center label, active slice styling, tap selection.

## Product Usage Heatmap

Use this for habit tracking, GitHub-style activity, product usage streaks, or health completion calendars.

```tsx
<ContributionGraph
  values={usageDays}
  endDate="2026-05-05"
  numDays={105}
  weekStartsOn={1}
  onDayPress={(event) => setSelectedDay(event)}
  width={360}
  height={190}
/>
```

Features used: stable date-to-cell mapping, month labels, weekday labels, color thresholds, empty-day rendering, day press events.

## OHLC Price Action

Use this for the first financial-chart review surface. The current candlestick foundation includes tap inspection and a volume overlay, but does not yet include range controls.

```tsx
<CandlestickChart
  data={candles}
  xKey="day"
  openKey="open"
  highKey="high"
  lowKey="low"
  closeKey="close"
  volumeKey="volume"
  interaction="tap"
  rangeSelector={{ interactive: true, minVisiblePoints: 8 }}
  tooltip={{ width: 154 }}
  viewport={{ visiblePoints: 20, initialIndex: "end" }}
  viewportInteraction={{ pan: true, pinchZoom: true, minVisiblePoints: 8 }}
  yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
  formatYLabel={(value) => `$${Math.round(value)}`}
  width={360}
  height={280}
/>
```

Features used: OHLC normalization, candle body geometry, wick geometry, volume overlay, viewport windowing, range selector overview, pan/pinch viewport gestures, up/down/flat theming, skipped invalid rows, tap selection, OHLC tooltip, close-price badge.
