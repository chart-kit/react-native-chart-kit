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

const data = [
  { date: "Jan", revenue: 52 },
  { date: "Feb", revenue: 86 },
  { date: "Mar", revenue: 58 },
  { date: "Apr", revenue: 134 },
  { date: "May", revenue: 95 },
  { date: "Jun", revenue: 176 }
];

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

## Props

### ChartKitProvider

| Prop       | Type                           | Description                                                        |
| ---------- | ------------------------------ | ------------------------------------------------------------------ |
| `children` | `ReactNode`                    | Chart subtree that should inherit provider defaults.               |
| `mode`     | `ChartKitThemeMode`            | Theme mode to apply, including `"light"`, `"dark"`, or `"system"`. |
| `preset`   | `CartesianChartPresetValue`    | Default preset name or preset object used by descendant charts.    |
| `presets`  | `CartesianChartPresetRegistry` | Custom preset registry available to descendant charts.             |
| `renderer` | `LineChartRenderer`            | Default SVG-compatible renderer used by descendant chart surfaces. |
| `theme`    | `CartesianChartTheme`          | Inline theme overrides merged into descendant chart themes.        |
