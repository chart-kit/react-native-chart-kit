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
  <LineChart data={data} xKey="date" yKey="revenue" width={410} height={240} />
</ChartKitProvider>;
```

## Built-In Presets

The preset names describe palette character, not app use cases. That keeps the
theme API reusable across dashboards, fitness screens, finance screens,
education apps, and anything else that needs charts.

These names follow the same broad convention used by mature color systems:
abstract palette families from [Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette),
utility color families from [Tailwind CSS](https://tailwindcss.com/docs/colors),
and role-based color thinking from [Material Design](https://m3.material.io/styles/color/roles).

| Preset      | Character                                                                      | Light series                                                                                                                                                                                              | Dark series                                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | Balanced blue/cyan baseline for neutral product UI.                            | <span class="chartkit-swatch-row"><span style="background:#2563eb"></span><span style="background:#0891b2"></span><span style="background:#7c3aed"></span><span style="background:#16a34a"></span></span> | <span class="chartkit-swatch-row"><span style="background:#38bdf8"></span><span style="background:#a78bfa"></span><span style="background:#22c55e"></span><span style="background:#f59e0b"></span></span> |
| `spectrum`  | Clear blue, green, amber, and violet for high-readability multi-series charts. | <span class="chartkit-swatch-row"><span style="background:#2563eb"></span><span style="background:#10b981"></span><span style="background:#f59e0b"></span><span style="background:#7c3aed"></span></span> | <span class="chartkit-swatch-row"><span style="background:#60a5fa"></span><span style="background:#34d399"></span><span style="background:#fbbf24"></span><span style="background:#c084fc"></span></span> |
| `aurora`    | Cool sky, violet, teal, and orange with a polished app feel.                   | <span class="chartkit-swatch-row"><span style="background:#0284c7"></span><span style="background:#8b5cf6"></span><span style="background:#14b8a6"></span><span style="background:#f97316"></span></span> | <span class="chartkit-swatch-row"><span style="background:#38bdf8"></span><span style="background:#a78bfa"></span><span style="background:#2dd4bf"></span><span style="background:#fb923c"></span></span> |
| `verdant`   | Fresh green-led palette with rose, sky, and lime accents.                      | <span class="chartkit-swatch-row"><span style="background:#059669"></span><span style="background:#e11d48"></span><span style="background:#0ea5e9"></span><span style="background:#84cc16"></span></span> | <span class="chartkit-swatch-row"><span style="background:#34d399"></span><span style="background:#fb7185"></span><span style="background:#38bdf8"></span><span style="background:#bef264"></span></span> |
| `cupertino` | Crisp system-style blue, green, orange, and pink.                              | <span class="chartkit-swatch-row"><span style="background:#007aff"></span><span style="background:#34c759"></span><span style="background:#ff9500"></span><span style="background:#ff2d55"></span></span> | <span class="chartkit-swatch-row"><span style="background:#0a84ff"></span><span style="background:#30d158"></span><span style="background:#ff9f0a"></span><span style="background:#ff375f"></span></span> |
| `material`  | Material-inspired purple primary with teal, error red, and mauve.              | <span class="chartkit-swatch-row"><span style="background:#6750a4"></span><span style="background:#006a6a"></span><span style="background:#b3261e"></span><span style="background:#7d5260"></span></span> | <span class="chartkit-swatch-row"><span style="background:#d0bcff"></span><span style="background:#4fd8d8"></span><span style="background:#ffb4ab"></span><span style="background:#efb8c8"></span></span> |
| `graphite`  | Monochrome grayscale for quiet, editorial, or brand-led surfaces.              | <span class="chartkit-swatch-row"><span style="background:#111827"></span><span style="background:#64748b"></span><span style="background:#94a3b8"></span><span style="background:#cbd5e1"></span></span> | <span class="chartkit-swatch-row"><span style="background:#f8fafc"></span><span style="background:#cbd5e1"></span><span style="background:#94a3b8"></span><span style="background:#64748b"></span></span> |
| `contrast`  | Accessibility-forward high contrast with stronger axis and grid colors.        | <span class="chartkit-swatch-row"><span style="background:#005fcc"></span><span style="background:#d0006f"></span><span style="background:#008a00"></span><span style="background:#a15c00"></span></span> | <span class="chartkit-swatch-row"><span style="background:#7dd3fc"></span><span style="background:#f0abfc"></span><span style="background:#86efac"></span><span style="background:#fde68a"></span></span> |
| `midnight`  | Deep slate base with cyan, green, amber, and pink neon accents.                | <span class="chartkit-swatch-row"><span style="background:#0f766e"></span><span style="background:#2563eb"></span><span style="background:#9333ea"></span><span style="background:#ea580c"></span></span> | <span class="chartkit-swatch-row"><span style="background:#22d3ee"></span><span style="background:#34d399"></span><span style="background:#f59e0b"></span><span style="background:#f472b6"></span></span> |

<style>
  .chartkit-swatch-row {
    align-items: center;
    display: inline-flex;
    gap: 0.35rem;
    min-width: 5.25rem;
  }

  .chartkit-swatch-row span {
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: 999px;
    box-shadow: 0 0 0 1px color-mix(in srgb, currentColor 6%, transparent);
    display: inline-block;
    height: 0.9rem;
    width: 0.9rem;
  }
</style>

Alpha note: earlier use-case names were removed. Use the palette names above in
new code.

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
