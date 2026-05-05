# Combined Charts

CombinedChart overlays bar and line series on a shared x-axis. The first v2 slice supports vertical grouped or stacked bars plus line series with independent left and right y-axis domains.

```tsx
import { CombinedChart } from "@chart-kit/react-native-v2";

<CombinedChart
  data={rows}
  xKey="month"
  bars={[{ yKey: "revenue", label: "Revenue" }]}
  lines={[{ yKey: "margin", label: "Margin", curve: "monotone" }]}
  leftYDomain={[0, "dataMax"]}
  rightYDomain={[0, 40]}
  formatLeftYLabel={(value) => `$${value}k`}
  formatRightYLabel={(value) => `${value}%`}
  width={360}
  height={280}
/>;
```

Defaults:

- bar series use the left y-axis
- line series use the right y-axis
- the left domain includes zero
- the right domain is independent and does not force zero unless configured
- legends show automatically when more than one series is present

Use `barMode="stacked"` or `barMode="stacked100"` for composition-style bars under a line. Per-series `yAxisId` can move either kind of series onto the opposite axis.

Tap selection can show a shared tooltip across visible bar and line series:

```tsx
<CombinedChart
  data={rows}
  xKey="month"
  bars={[{ yKey: "revenue", label: "Revenue" }]}
  lines={[{ yKey: "margin", label: "Margin", curve: "monotone" }]}
  interaction="tap"
  tooltip
  defaultSelectedIndex={3}
  width={360}
  height={280}
/>
```

The default tooltip is theme-aware and uses the same tooltip styling contract as line charts. Pass `renderTooltip` for a custom SVG tooltip renderer.

Legend toggling is still intentionally left for the next combined-chart slice.
