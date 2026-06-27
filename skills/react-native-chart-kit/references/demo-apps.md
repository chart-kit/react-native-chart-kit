# Demo Apps And Previews

The strongest Chart Kit demos are native app screens, not isolated chart blocks.

Lessons from the Pro preview work:

- Lead with workflows: trading, health, website analytics, market pulse.
- Show charts inside believable mobile screens with real labels, controls, and data.
- Use free charts where they fit; use Pro charts where the screen naturally needs them.
- Pro should feel like advanced capability, not an artificial paywall.

## Current Demo Sources

When the Pro checkout exists, inspect:

- `../chart-kit-pro/apps/pro-preview/src/storyRegistry.tsx`
- `../chart-kit-pro/apps/pro-preview/src/stories/landingDemoStories.tsx`
- `../chart-kit-pro/apps/pro-preview/src/stories/financialOverviewStories.tsx`
- `../chart-kit-pro/apps/pro-preview/src/stories/combinedOverviewStories.tsx`
- `../chart-kit-pro/apps/pro-preview/src/stories/performanceStories.tsx`
- `../chart-kit-pro/apps/pro-preview/src/fixtures/*`

## Story Shape

Use small typed story components:

```tsx
const RevenueStory = ({ width }: NativeStoryProps) => (
  <ChartSection title="Revenue and margin" kicker="Dual-axis combined">
    <CombinedChart
      data={revenueMargin}
      height={280}
      width={width}
      xKey="month"
      bars={[{ yKey: "revenue", label: "Revenue" }]}
      lines={[{ yKey: "margin", label: "Margin" }]}
      testID="combined-revenue-margin-chart"
    />
  </ChartSection>
);
```

Rules:

- Keep fixtures typed and named by use case.
- Add `testID` to every chart story.
- Include light and dark mode support.
- Put interactions in the story, not hidden inside fixture data.
- Add `ChartDataDetails` or similar when data inspection helps sell trust.

## Demo Screens That Sell

Use these patterns:

- Trading app: Pro `CandlestickChart`, timeframe pills, crosshair, OHLC/volume details.
- Health app: free `ProgressChart`, free stacked `BarChart`, Pro `CombinedChart` for energy/heart-rate inspection.
- Website analytics: free `LineChart`, Pro `RealtimeBarChart` for last-30-minute users.
- Market pulse: free line/area for indexes, donut for lead mix, Pro export/share when needed.

Avoid:

- Blank demo data like `A`, `B`, `C`.
- Charts floating on empty pages.
- Labels that clip in the first viewport.
- Huge feature text explaining the chart.

## Pro Preview IDs

Public docs Pro IDs:

- `pro-candlebar`
- `pro-candlebar-crosshair`
- `pro-candlebar-realtime`
- `pro-radar`
- `pro-realtime-bar`
- `pro-combo`
- `pro-combo-tooltip`
- `pro-combo-toggles`
- `pro-combo-negative`

Use these IDs consistently when wiring docs previews.

## Performance Stories

Use performance stories for proof, not decoration:

- 100 point line: baseline
- 1,000 point scrub: interaction
- 10,000 point overview: decimation
- 10,000 point pan: viewport
- 2 x 10,000 range: range selector
- 500 bar selection: hit testing

Defaults:

```tsx
<LineChart
  data={line10000}
  height={244}
  width={width}
  xKey="index"
  yKey="value"
  curve="monotone"
  decimation="auto"
  showDots={false}
  labelStrategy="hide"
  yAxisLabelWidth="stable"
/>
```

## Visual QA

Before calling a demo done:

- Check compact mobile width.
- Check desktop/web preview width.
- Check dark mode.
- Check selected/tooltip state.
- Check empty or zero-value data state when relevant.
- Run visual tests when touching preview rendering:

```sh
npm run preview:build
npm run test:visual
```
