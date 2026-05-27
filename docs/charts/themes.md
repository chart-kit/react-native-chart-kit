---
title: Themes
description: Share color, typography, and chart styling decisions across chart surfaces.
---

# Themes

Charts inherit app-level theme settings from `ChartKitProvider`, while each chart can still override `theme` or `preset` locally.

```tsx
import { ChartKitProvider, createChartPreset } from "react-native-chart-kit/v2";

const acme = createChartPreset({
  light: {
    background: "#ffffff",
    grid: "#e5edf7",
    series: ["#155eef", "#12b76a"]
  },
  dark: {
    background: "#07111f",
    plotBackground: "#0b1627",
    grid: "#1d3554",
    series: ["#60a5fa", "#34d399"]
  }
});

<ChartKitProvider mode="system" preset="acme" presets={{ acme }}>
  <LineChart data={data} xKey="date" yKey="revenue" width={360} height={240} />
</ChartKitProvider>;
```

## Built-In Presets

Built-in presets include:

- `default`
- `analytics`
- `fintech`
- `health`
- `ios`
- `material`
- `minimal`
- `highContrast` or `high-contrast`
- `darkFintech` or `dark-fintech`

Use `theme` for one-off chart overrides and `createChartPreset()` for design-system presets that should be shared across a product.
