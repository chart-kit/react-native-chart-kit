<div align="center">
  <a href="https://chartkit.io/">
    <img src="https://chartkit.io/images/logo.svg" alt="React Native Chart Kit" width="72" />
  </a>

  <h1>React Native Chart Kit</h1>

  <p>
    Beautiful charts for React Native. Line, area, bar, pie, donut, progress,
    and contribution heatmaps for dashboards, reports, and data-rich mobile
    apps.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/react-native-chart-kit"><img alt="npm" src="https://img.shields.io/npm/v/react-native-chart-kit?style=flat-square" /></a>
    <a href="https://www.npmjs.com/package/react-native-chart-kit"><img alt="downloads" src="https://img.shields.io/npm/dm/react-native-chart-kit?style=flat-square" /></a>
    <a href="./LICENSE"><img alt="license" src="https://img.shields.io/npm/l/react-native-chart-kit?style=flat-square" /></a>
  </p>

  <p>
    <a href="https://chartkit.io/">Website</a>
    ·
    <a href="https://chartkit.io/docs/react-native/">Docs</a>
    ·
    <a href="https://chartkit.io/docs/react-native/getting-started/installation/">Quickstart</a>
    ·
    <a href="https://chartkit.io/docs/react-native/charts/pricing/">Pro</a>
  </p>
</div>

## Install

```sh
npm install react-native-chart-kit react-native-svg
```

Expo:

```sh
npm install react-native-chart-kit
npx expo install react-native-svg
```

## First Chart

```tsx
import { LineChart } from "react-native-chart-kit/v2";

const data = [
  { month: "Jan", revenue: 52 },
  { month: "Feb", revenue: 86 },
  { month: "Mar", revenue: 58 },
  { month: "Apr", revenue: 134 }
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      width={410}
      height={240}
    />
  );
}
```

The root import stays available for legacy screens. New screens should use
`react-native-chart-kit/v2`.

## What You Get

- Modern public charts:
  [line](https://chartkit.io/docs/react-native/charts/line/),
  [area](https://chartkit.io/docs/react-native/charts/area/),
  [bar](https://chartkit.io/docs/react-native/charts/bar/),
  [pie](https://chartkit.io/docs/react-native/charts/pie/),
  [donut](https://chartkit.io/docs/react-native/charts/donut/),
  [progress](https://chartkit.io/docs/react-native/charts/progress/), and
  [contribution heatmap](https://chartkit.io/docs/react-native/charts/contribution-heatmap/).
- Mobile interactions:
  [tap selection, shared tooltips, and crosshairs](https://chartkit.io/docs/react-native/charts/line/#tooltips-and-selection).
- Shared
  [themes](https://chartkit.io/docs/react-native/charts/themes/) and SVG
  renderer defaults.
- Migration help for existing apps:
  [from v1](https://chartkit.io/docs/react-native/migration/from-v1/) and
  [prop mapping](https://chartkit.io/docs/react-native/migration/prop-mapping/).

## Pro Charts

Chart Kit Pro adds licensed chart workflows for product dashboards:

- [Candlebar](https://chartkit.io/docs/react-native/charts/candlebar/),
  [radar](https://chartkit.io/docs/react-native/charts/radar/),
  [realtime bar](https://chartkit.io/docs/react-native/charts/realtime/), and
  [combo charts](https://chartkit.io/docs/react-native/charts/combo/).
- [PNG and SVG export APIs](https://chartkit.io/docs/react-native/charts/export/)
  for reports, sharing, and background rendering.
- [Install Pro](https://chartkit.io/docs/react-native/charts/pro-installation/) or
  compare [pricing](https://chartkit.io/docs/react-native/charts/pricing/).

## Links

- [Full documentation](https://chartkit.io/docs/react-native/)
- [Troubleshooting](https://chartkit.io/docs/react-native/troubleshooting/)
- [Contributing](https://chartkit.io/docs/react-native/getting-started/contributing/)
- [llms.txt](https://chartkit.io/llms.txt)
