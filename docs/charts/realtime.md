---
title: Realtime Bar Chart
description: Stream rolling bar windows with Chart Kit Pro realtime chart APIs.
---

# Realtime Bar Chart

`Realtime.BarChart` renders a rolling bar window for live analytics, monitoring,
and operational dashboards. It keeps visual slots stable while appended rows
slide into view, so selection and tooltip state follow the selected datum instead
of a moving array index.

This chart is available in Chart Kit Pro. Install it once from
[Installation](pro-installation.md).

## Active Users Stream

Use `liveKey` for stable row identity and `windowSize` for the visible rolling
window. The chart can use the same SVG or Skia renderer selected by
`ChartKitProvider`.

```tsx
import { useEffect, useMemo, useState } from "react";
import { Realtime } from "@chart-kit/pro";

const updateMs = 2000;

const getUsersAt = (pointIndex: number) =>
  Math.round(
    44 +
      Math.sin(pointIndex * 0.7) * 16 +
      Math.cos(pointIndex * 0.25) * 10 +
      (pointIndex % 5) * 3
  );

const createRows = (tick: number) =>
  Array.from({ length: 30 }, (_, index) => {
    const pointIndex = tick + index;

    return {
      pointIndex,
      users: Math.max(8, Math.min(92, getUsersAt(pointIndex)))
    };
  });

const formatAgeLabel = (minutesAgo: number) =>
  minutesAgo === 0 ? "Now" : `${minutesAgo} min ago`;

export function ActiveUsersStream() {
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => createRows(tick), [tick]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTick((currentTick) => currentTick + 1);
    }, updateMs);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Realtime.BarChart
      data={rows}
      xKey="pointIndex"
      yKey="users"
      liveKey="pointIndex"
      windowSize={30}
      animation={{ duration: updateMs, mode: "slide" }}
      interaction="tap"
      series={[{ yKey: "users", label: "Users", color: "#2563eb" }]}
      formatXLabel={(value) => {
        const pointIndex =
          typeof value === "number"
            ? value
            : value instanceof Date
              ? Number.NaN
              : Number.parseInt(value, 10);
        const minutesAgo = Number.isFinite(pointIndex)
          ? Math.max(0, tick + 29 - pointIndex)
          : 0;

        return formatAgeLabel(minutesAgo);
      }}
      showXAxisLabels={false}
      showYAxisLabels={false}
      tooltip={{ anchor: "bar", placement: "top", width: 108 }}
      yDomain={[0, 100]}
      width={410}
      height={150}
    />
  );
}
```

::chart-preview{id="pro-realtime-bar"}

## Selection and tooltips

Use `liveKey` whenever the incoming array is a rolling window. Selection keys are
based on that identity, so a selected bar can move left while its tooltip value
stays attached to the same row.

Omit `defaultSelectedBar` when the stream should open idle. Add it only when the
chart should seed an initial visible tooltip. `interaction="tap"` lets the user
move selection without adding controlled state.

`tooltip={{ placement: "top" }}` pins the tooltip to the top of the chart while
the x-position follows the selected bar.

## Props

| Prop         | Type                                         | Description                                             |
| ------------ | -------------------------------------------- | ------------------------------------------------------- |
| `data`       | `TData[]`                                    | Source rows for the current rolling feed.               |
| `xKey`       | `keyof TData`                                | Row key used for x values.                              |
| `yKey`       | `keyof TData`                                | Numeric row key for the bar values.                     |
| `series`     | `BarChartSeries[]`                           | Optional series config.                                 |
| `liveKey`    | `keyof TData \| (row, index) => key`         | Stable row identity used for appends and selection.     |
| `windowSize` | `number`                                     | Number of rows visible in the realtime window.          |
| `animation`  | `boolean \| RealtimeBarChartAnimationConfig` | Realtime slide animation config.                        |
| `paused`     | `boolean`                                    | Stops realtime transitions when true.                   |
| `tooltip`    | `boolean \| BarChartTooltipConfig`           | Supports normal bar tooltip options plus top placement. |
