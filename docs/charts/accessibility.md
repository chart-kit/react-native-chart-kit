# Accessibility

Every v2 chart accepts `accessibilityLabel`. If no label is provided, the chart generates a concise screen-reader summary from its data.

For richer app-level fallbacks, export table models with the helper matching the chart type:

```tsx
import {
  getBarChartDataTable,
  getLineChartDataTable,
  getPieChartDataTable,
  getProgressChartDataTable,
  getContributionGraphDataTable
} from "@chart-kit/react-native";
import {
  getCandlestickChartDataTable,
  getCombinedChartDataTable
} from "@chart-kit/react-native/pro-preview";
```

These helpers return normalized rows and formatted values that can back a hidden native table, a visible details panel, export flow, or enterprise accessibility report.

Summary helpers are also exported:

- `getLineChartAccessibilitySummary()`
- `getBarChartAccessibilitySummary()`
- `getCandlestickChartAccessibilitySummary()`
- `getCandlestickChartFinancialNarrative()`
- `getCombinedChartAccessibilitySummary()`
- `getPieChartAccessibilitySummary()`
- `getProgressChartAccessibilitySummary()`
- `getContributionGraphAccessibilitySummary()`

Use chart-level `formatXLabel`, `formatYLabel`, `formatValue`, or `formatPercentage` with these helpers so the accessibility output matches the visible chart labels.

## Table Fallback Recipe

Use table fallbacks when a chart appears in a production screen where users may need exact values outside the visual chart. The helper output is intentionally data-only, so apps can render it as a visible details panel, a screen-reader-only region, an export source, or an enterprise accessibility report.

```tsx
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LineChart, getLineChartDataTable } from "@chart-kit/react-native";

const RevenueChartDetails = ({ data, width }) => {
  const [expanded, setExpanded] = useState(false);
  const table = useMemo(
    () =>
      getLineChartDataTable({
        data,
        xKey: "month",
        series: [{ yKey: "revenue", label: "Revenue" }],
        formatYLabel: (value) => `$${Math.round(value / 1000)}k`
      }),
    [data]
  );

  return (
    <View>
      <LineChart
        data={data}
        xKey="month"
        yKey="revenue"
        width={width}
        height={220}
      />
      <Pressable onPress={() => setExpanded((current) => !current)}>
        <Text>{expanded ? "Hide data table" : "Show data table"}</Text>
      </Pressable>
      {expanded ? (
        <View accessibilityLabel="Revenue data table">
          {table.rows.map((row) => (
            <Text key={row.index}>
              {row.xLabel}: {row.formattedValues.revenue}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};
```

For dual-axis charts, prefer `getCombinedChartDataTable()` and display values by series instead of ranking values across axes. A revenue bar and a margin line often use different units, so the default combined summary reports the latest category rather than comparing every value globally.

## Financial Narrative Recipe

Use `getCandlestickChartFinancialNarrative()` when a financial screen needs richer copy than the default chart label. The helper returns a plain object with the generated summary, first/latest/highest/lowest OHLC rows, close change, percentage change, range, and up/down/flat candle counts.

```tsx
import { getCandlestickChartFinancialNarrative } from "@chart-kit/react-native/pro-preview";

const narrative = getCandlestickChartFinancialNarrative({
  data: candles,
  xKey: "day",
  openKey: "open",
  highKey: "high",
  lowKey: "low",
  closeKey: "close",
  title: "Portfolio price action",
  formatYLabel: (value) => `$${Math.round(value)}`,
  formatPercent: (value) => `${value.toFixed(1)}%`
});

const summary = narrative?.summary;
```
