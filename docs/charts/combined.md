# Combined Charts

CombinedChart overlays bar and line series on a shared x-axis. The first v2 slice supports vertical grouped or stacked bars plus line series with independent left and right y-axis domains.

Status: CombinedChart is a Pro-candidate preview until H4 finalizes the free-vs-Pro boundary. The docs stay visible so the API can be reviewed, but dual-axis and shared-inspection workflows should not be treated as final free-beta scope yet.

```tsx
import { CombinedChart } from "@chart-kit/react-native/pro-preview";

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

For custom legends or external controls, pass `visibleSeriesKeys` with the resolved series keys. Domains, geometry, legends, and shared tooltip contents are recomputed from the visible series:

```tsx
<CombinedChart
  data={rows}
  xKey="month"
  bars={[
    { yKey: "direct", label: "Direct" },
    { yKey: "enterprise", label: "Enterprise" }
  ]}
  lines={[{ yKey: "margin", label: "Margin" }]}
  visibleSeriesKeys={["bar-direct", "line-margin"]}
  width={360}
  height={280}
/>
```

Default generated keys are `bar-${yKey}` for bars and `line-${yKey}` for lines unless a series `key` is supplied.
