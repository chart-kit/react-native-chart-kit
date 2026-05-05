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
} from "@chart-kit/react-native-v2";
```

These helpers return normalized rows and formatted values that can back a hidden native table, a visible details panel, export flow, or enterprise accessibility report.

Summary helpers are also exported:

- `getLineChartAccessibilitySummary()`
- `getBarChartAccessibilitySummary()`
- `getPieChartAccessibilitySummary()`
- `getProgressChartAccessibilitySummary()`
- `getContributionGraphAccessibilitySummary()`

Use chart-level `formatXLabel`, `formatYLabel`, `formatValue`, or `formatPercentage` with these helpers so the accessibility output matches the visible chart labels.
