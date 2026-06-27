---
title: Combo Chart
description: Compare bars and lines together in one Chart Kit Pro chart.
---

# Combo Chart

`ComboChart` combines bars and lines in one chart. Use it for dashboards where a
current value, target, forecast, margin, or rate should be inspected together on
the same timeline.

This chart is available in Chart Kit Pro. Install it once from
[Installation](pro-installation.md).

## Revenue Operating View

Use a basic combo when the bar series explain the current month and the line
series gives the surrounding target or forecast.

```tsx
import { ComboChart } from "@chart-kit/pro";

const money = (value: number) => `$${Math.round(value)}k`;

const data = [
  { month: "Jan", revenue: 420, forecast: 480, margin: 128 },
  { month: "Feb", revenue: 560, forecast: 530, margin: 168 },
  { month: "Mar", revenue: 490, forecast: 610, margin: 151 },
  { month: "Apr", revenue: 720, forecast: 690, margin: 214 },
  { month: "May", revenue: 640, forecast: 760, margin: 193 },
  { month: "Jun", revenue: 880, forecast: 840, margin: 276 },
  { month: "Jul", revenue: 790, forecast: 920, margin: 244 },
  { month: "Aug", revenue: 1040, forecast: 980, margin: 331 }
];

export function RevenueOperations() {
  return (
    <ComboChart
      data={data}
      xKey="month"
      series={[
        { key: "bar-revenue", yKey: "revenue", label: "Revenue", type: "bar" },
        { key: "bar-margin", yKey: "margin", label: "Margin", type: "bar" },
        {
          key: "line-forecast",
          yKey: "forecast",
          label: "Forecast",
          type: "line"
        }
      ]}
      defaultSelectedIndex={5}
      formatYLabel={money}
      width={410}
      height={300}
    />
  );
}
```

::chart-preview{id="pro-combo"}

## Shared Tooltip

Use a persistent selected index when the chart should open with a meaningful
month already inspected. `interaction="tap"` keeps the shared tooltip aligned
with the selected x value.

```tsx
import { ComboChart } from "@chart-kit/pro";

const money = (value: number) => `$${Math.round(value)}k`;

const bookings = [
  { month: "Jan", booked: 118, target: 132 },
  { month: "Feb", booked: 146, target: 140 },
  { month: "Mar", booked: 182, target: 168 },
  { month: "Apr", booked: 208, target: 196 },
  { month: "May", booked: 236, target: 224 },
  { month: "Jun", booked: 274, target: 252 }
];

export function PipelineInspection() {
  return (
    <ComboChart
      data={bookings}
      xKey="month"
      series={[
        { key: "bar-booked", yKey: "booked", label: "Booked", type: "bar" },
        { key: "line-target", yKey: "target", label: "Target", type: "line" }
      ]}
      defaultSelectedIndex={3}
      formatYLabel={money}
      interaction="tap"
      tooltip={{ width: 148 }}
      width={410}
      height={292}
    />
  );
}
```

::chart-preview{id="pro-combo-tooltip"}

## Series Toggles

Keep series visibility in product state when the chart is part of broader
dashboard controls. The chart keeps the remaining bars and lines aligned to the
same x-axis.

```tsx
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ComboChart } from "@chart-kit/pro";
import {
  resolveCartesianChartThemeConfig,
  useChartKitTheme
} from "react-native-chart-kit/v2";

const money = (value: number) => `$${Math.round(value)}k`;
const percent = (value: number) => `${Math.round(value)}%`;

const channelPlan = [
  { month: "Jan", direct: 44, enterprise: 128, margin: 17 },
  { month: "Feb", direct: 52, enterprise: 154, margin: 19 },
  { month: "Mar", direct: 58, enterprise: 178, margin: 21 },
  { month: "Apr", direct: 66, enterprise: 204, margin: 24 },
  { month: "May", direct: 72, enterprise: 224, margin: 27 },
  { month: "Jun", direct: 80, enterprise: 252, margin: 30 }
];

const toggleItems = [
  { key: "bar-direct", label: "Direct" },
  { key: "bar-enterprise", label: "Enterprise" },
  { key: "line-margin", label: "Margin" }
];

const colorWithAlpha = (color: string, alpha: string) =>
  color.startsWith("#") && color.length === 7 ? `${color}${alpha}` : color;

export function ChannelPlan() {
  const [visibleSeriesKeys, setVisibleSeriesKeys] = useState(
    toggleItems.map((item) => item.key)
  );
  const chartKitTheme = useChartKitTheme();
  const resolvedTheme = resolveCartesianChartThemeConfig({
    mode: chartKitTheme.mode,
    preset: chartKitTheme.preset,
    presets: chartKitTheme.presets,
    theme: chartKitTheme.theme
  });
  const isLight = chartKitTheme.mode === "light";

  const toggleSeries = (key: string) => {
    setVisibleSeriesKeys((currentKeys) => {
      const nextKeys = currentKeys.includes(key)
        ? currentKeys.filter((item) => item !== key)
        : [...currentKeys, key];

      return nextKeys.length > 0 ? nextKeys : currentKeys;
    });
  };

  const seriesToggles = toggleItems.map((item, index) => ({
    ...item,
    color: resolvedTheme.series[index] ?? "#2563eb"
  }));

  return (
    <View style={{ width: 410 }}>
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: isLight
            ? "rgba(7, 23, 51, 0.045)"
            : "rgba(255, 255, 255, 0.055)",
          borderColor: resolvedTheme.grid,
          borderRadius: 999,
          borderWidth: 1,
          display: "flex",
          flexDirection: "row",
          gap: 2,
          marginBottom: 10,
          padding: 2
        }}
      >
        {seriesToggles.map((item) => {
          const active = visibleSeriesKeys.includes(item.key);

          return (
            <Pressable
              key={item.key}
              aria-pressed={active}
              accessibilityRole="button"
              onPress={() => toggleSeries(item.key)}
              style={{
                alignItems: "center",
                display: "flex",
                backgroundColor: active
                  ? colorWithAlpha(item.color, isLight ? "10" : "18")
                  : "transparent",
                borderColor: active ? item.color : "transparent",
                borderRadius: 999,
                borderWidth: 1,
                flexDirection: "row",
                gap: 5,
                height: 28,
                justifyContent: "center",
                minWidth: 88,
                paddingHorizontal: 11
              }}
            >
              <View
                style={{
                  backgroundColor: item.color,
                  borderRadius: 999,
                  height: 6,
                  opacity: active ? 1 : 0.36,
                  width: 6
                }}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: active ? resolvedTheme.text : resolvedTheme.mutedText,
                  fontSize: 11,
                  fontWeight: "700",
                  lineHeight: 13
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ComboChart
        data={channelPlan}
        xKey="month"
        series={[
          { key: "bar-direct", yKey: "direct", label: "Direct", type: "bar" },
          {
            key: "bar-enterprise",
            yKey: "enterprise",
            label: "Enterprise",
            type: "bar"
          },
          { key: "line-margin", yKey: "margin", label: "Margin", type: "line" }
        ]}
        formatYLabel={(value) => (value > 40 ? money(value) : percent(value))}
        visibleSeriesKeys={visibleSeriesKeys}
        width={410}
        height={292}
      />
    </View>
  );
}
```

::chart-preview{id="pro-combo-toggles"}

## Negative Domain

Use an explicit y-domain when the bar series can cross zero. The line still
shares the same selected x value, so recovery screens can show whether a leading
indicator is improving before the bar metric turns positive.

```tsx
import { ComboChart } from "@chart-kit/pro";

const signedMoney = (value: number) =>
  value < 0 ? `-$${Math.abs(Math.round(value))}k` : `$${Math.round(value)}k`;

const recovery = [
  { month: "Jan", profit: -22, cashFlow: 8 },
  { month: "Feb", profit: -8, cashFlow: 12 },
  { month: "Mar", profit: 14, cashFlow: 16 },
  { month: "Apr", profit: 32, cashFlow: 20 },
  { month: "May", profit: 48, cashFlow: 24 },
  { month: "Jun", profit: 38, cashFlow: 22 }
];

export function ProfitRecovery() {
  return (
    <ComboChart
      data={recovery}
      xKey="month"
      series={[
        { key: "bar-profit", yKey: "profit", label: "Profit", type: "bar" },
        {
          key: "line-cash-flow",
          yKey: "cashFlow",
          label: "Cash flow",
          type: "line"
        }
      ]}
      defaultSelectedIndex={4}
      formatYLabel={signedMoney}
      yDomain={{ min: "dataMin", max: "dataMax", nice: true }}
      width={410}
      height={292}
    />
  );
}
```

::chart-preview{id="pro-combo-negative"}

## Product Use Cases

Use Combo charts for revenue vs forecast, spend vs acquisition, active users vs
conversion, inventory vs sell-through, channel plan controls, and operational
dashboards where one metric explains another.

## Props

| Prop                   | Type                         | Description                                       |
| ---------------------- | ---------------------------- | ------------------------------------------------- |
| `data`                 | `TData[]`                    | Object-row source data.                           |
| `xKey`                 | `keyof TData`                | Row key used for x-axis labels.                   |
| `series`               | `ComboChartSeries[]`         | Mixed `bar` and `line` series configuration.      |
| `series[].key`         | `string`                     | Stable id used by visibility and selection state. |
| `visibleSeriesKeys`    | `string[]`                   | Optional list of series keys to render.           |
| `selectedIndex`        | `number`                     | Controlled selected x value.                      |
| `defaultSelectedIndex` | `number`                     | Initial selected x value.                         |
| `interaction`          | `"tap"`, `"none"`, or object | Selection mode and callbacks.                     |
| `tooltip`              | `boolean` or object          | Shows and configures the shared tooltip.          |
| `yDomain`              | `object` or tuple            | Overrides or constrains the computed y-domain.    |
| `formatYLabel`         | `(value) => string`          | Formats y-axis and tooltip values.                |
| `width`                | `number`                     | Outer chart width in pixels.                      |
| `height`               | `number`                     | Outer chart height in pixels.                     |
