---
title: Candlebar Chart
description: Inspect OHLC price movement, wicks, and volume with Chart Kit Pro.
---

# Candlebar Chart

`CandlebarChart` shows open, high, low, close, and volume data for each interval.
Use it for market, trading, and asset-monitoring screens where users need to
inspect price movement candle by candle.

This chart is available in Chart Kit Pro. Install it once from
[Installation](pro-installation.md).

## Crosshair Inspector

Use crosshair inspection when the selected candle drives UI outside the chart.
Keep the selected index controlled, update it from `interaction.onSelect`, and
render the OHLCV readout wherever it fits your screen. The crosshair stays under
the user's finger while a separate candle marker shows which candle is selected.
Use a controlled viewport with `onViewportChange` when the mini range selector
needs to move or resize the visible interval.

```tsx
import { useState } from "react";
import { Text, View } from "react-native";
import { useChartKitTheme } from "react-native-chart-kit/v2";
import { CandlebarChart } from "@chart-kit/pro";

const candles = Array.from({ length: 40 }, (_, index) => {
  const open = 184 + Math.sin(index * 0.55) * 6 + index * 1.4;
  const move = Math.cos(index * 0.75) * 7;
  const close = open + move;
  const wick = 3 + Math.abs(move) * 0.35;

  return {
    time: `T${index + 1}`,
    open,
    high: Math.max(open, close) + wick,
    low: Math.min(open, close) - wick,
    close,
    volume: Math.round(48 + Math.abs(move) * 9 + index * 3)
  };
});

const formatValue = (value: number) => value.toFixed(1);

export function CrosshairInspector() {
  const chartTheme = useChartKitTheme();
  const [selectedIndex, setSelectedIndex] = useState(24);
  const [viewport, setViewport] = useState({
    startIndex: 6,
    endIndex: 35
  });
  const selected = candles[selectedIndex] ?? candles[candles.length - 1]!;
  const isDark = chartTheme.mode === "dark";
  const borderColor = isDark
    ? "rgba(216, 230, 255, 0.16)"
    : "rgba(15, 58, 120, 0.14)";
  const metrics = [
    ["O", formatValue(selected.open)],
    ["H", formatValue(selected.high)],
    ["L", formatValue(selected.low)],
    ["C", formatValue(selected.close)],
    ["VOL", String(selected.volume)]
  ] as const;

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          width: 410,
          maxWidth: "100%",
          borderWidth: 1,
          borderColor,
          borderStyle: "solid",
          borderRadius: 8,
          backgroundColor: isDark ? "#111827" : "#f8fbff",
          paddingBottom: 10,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "stretch"
          }}
        >
          {metrics.map(([label, value], index) => (
            <View
              key={label}
              style={{
                flex: 1,
                minWidth: 0,
                alignItems: "center",
                borderLeftColor: borderColor,
                borderLeftWidth: index === 0 ? 0 : 1,
                paddingLeft: index === 0 ? 0 : 6
              }}
            >
              <Text
                style={{
                  color: isDark ? "rgba(248, 250, 252, 0.48)" : "#64748b",
                  fontSize: 8,
                  fontWeight: "800",
                  marginBottom: 2,
                  textTransform: "uppercase"
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  color: isDark ? "rgba(248, 250, 252, 0.82)" : "#334155",
                  fontSize: 12,
                  fontWeight: "800"
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <CandlebarChart
        data={candles}
        dateKey="time"
        openKey="open"
        highKey="high"
        lowKey="low"
        closeKey="close"
        volumeKey="volume"
        formatYLabel={formatValue}
        height={340}
        interaction={{
          activation: "longPress",
          mode: "crosshair",
          onSelect: (event) => setSelectedIndex(event.dataIndex)
        }}
        rangeSelector={{
          visible: true,
          height: 84
        }}
        viewport={viewport}
        onViewportChange={(event) => setViewport(event.viewport)}
        selectedIndex={selectedIndex}
        selectionPriceLabel
        showHorizontalGridLines
        showYAxisLabels
        tooltip={false}
        width={410}
        yTickCount={4}
      />
    </View>
  );
}
```

::chart-preview{id="pro-candlebar-crosshair"}

## OHLC and Volume

```tsx
import { CandlebarChart } from "@chart-kit/pro";

const candles = Array.from({ length: 20 }, (_, index) => {
  const open = 184 + Math.sin(index * 0.55) * 6 + index * 2.4;
  const move = Math.cos(index * 0.75) * 7;
  const close = open + move;
  const wick = 3 + Math.abs(move) * 0.35;

  return {
    date: `T${index + 1}`,
    open,
    high: Math.max(open, close) + wick,
    low: Math.min(open, close) - wick,
    close,
    volume: Math.round(48 + Math.abs(move) * 9 + index * 3)
  };
});

export function TradingSession() {
  return (
    <CandlebarChart
      data={candles}
      dateKey="date"
      openKey="open"
      highKey="high"
      lowKey="low"
      closeKey="close"
      volumeKey="volume"
      defaultSelectedIndex={12}
      interaction="tap"
      tooltip
      width={410}
      height={300}
    />
  );
}
```

::chart-preview{id="pro-candlebar"}

## Realtime Updates

Use realtime updates when the latest interval is still open. Keep the candle
array in state, replace the active candle as ticks arrive, and append a new
candle when the interval closes.

```tsx
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useChartKitTheme } from "react-native-chart-kit/v2";
import { CandlebarChart } from "@chart-kit/pro";

type Candle = {
  slot: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const intervalMs = 1000;
const visiblePoints = 24;
const ticksPerCandle = 6;

const seedCandles: Candle[] = Array.from(
  { length: visiblePoints },
  (_, index) => {
    const open = 180 + Math.sin(index * 0.7) * 5 + index * 0.8;
    const move = Math.cos(index * 0.55) * 4;
    const close = open + move;
    const wick = 2 + Math.abs(move) * 0.4;

    return {
      slot: index,
      time: `T${index + 1}`,
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick,
      close,
      volume: Math.round(50 + Math.abs(move) * 9)
    };
  }
);

const formatValue = (value: number) => value.toFixed(1);

const appendCandle = (candles: Candle[], sequence: number): Candle[] => {
  const previous = candles[candles.length - 1]!;
  const open = previous.close;
  const move = Math.sin(sequence * 0.8) * 4 + Math.cos(sequence * 0.34) * 2;
  const close = open + move;
  const wick = 2 + Math.abs(move) * 0.35;

  return [
    ...candles,
    {
      slot: sequence,
      time: `T${sequence + 1}`,
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick,
      close,
      volume: Math.round(55 + Math.abs(move) * 10)
    }
  ];
};

const updateOpenCandle = (candle: Candle, liveStep: number): Candle => {
  const move = Math.sin(liveStep * 0.9) * 1.4 + Math.cos(liveStep * 0.35);
  const close = candle.close + move;

  return {
    ...candle,
    close,
    high: Math.max(candle.high, close + Math.abs(move) * 0.5),
    low: Math.min(candle.low, close - Math.abs(move) * 0.5),
    volume: candle.volume + Math.round(2 + Math.abs(move) * 3)
  };
};

const createLiveCandles = (liveStep: number): Candle[] => {
  const closedCandleCount = Math.floor(liveStep / ticksPerCandle);
  let candles = seedCandles.map((candle) => ({ ...candle }));

  for (let index = 0; index < closedCandleCount; index += 1) {
    candles = appendCandle(candles, visiblePoints + index);
  }

  const last = candles[candles.length - 1]!;
  candles[candles.length - 1] = updateOpenCandle(last, liveStep);

  return candles.slice(-visiblePoints);
};

export function RealtimeCandleUpdates() {
  const chartTheme = useChartKitTheme();
  const [liveStep, setLiveStep] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLiveStep((current) => current + 1);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, []);

  const candles = useMemo(() => createLiveCandles(liveStep), [liveStep]);
  const latest = candles[candles.length - 1]!;
  const isDark = chartTheme.mode === "dark";
  const isUp = latest.close >= latest.open;

  return (
    <View style={{ gap: 10, width: 410, maxWidth: "100%" }}>
      <View
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(216, 230, 255, 0.16)"
            : "rgba(15, 58, 120, 0.14)",
          borderStyle: "solid",
          borderRadius: 8,
          backgroundColor: isDark ? "#111827" : "#f8fbff",
          paddingBottom: 10,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: "row",
            alignItems: "baseline",
            gap: 5
          }}
        >
          <Text
            style={{
              color: isDark ? "rgba(248, 250, 252, 0.52)" : "#64748b",
              fontSize: 8,
              fontWeight: "800",
              textTransform: "uppercase"
            }}
          >
            Latest close
          </Text>
          <Text
            style={{
              color: isDark ? "#f8fafc" : "#0f172a",
              fontSize: 13,
              fontWeight: "800"
            }}
          >
            {formatValue(latest.close)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            borderRadius: 999,
            backgroundColor: isUp
              ? "rgba(20, 184, 166, 0.14)"
              : "rgba(244, 63, 94, 0.14)",
            paddingBottom: 2,
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 2
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: isUp ? "#14b8a6" : "#f43f5e"
            }}
          />
          <Text
            style={{
              color: isUp ? "#0f766e" : "#be123c",
              fontSize: 10,
              fontWeight: "800",
              textTransform: "uppercase"
            }}
          >
            Live
          </Text>
        </View>
      </View>
      <CandlebarChart
        accessibilityLabel="Realtime OHLC chart"
        data={candles}
        dateKey="time"
        openKey="open"
        highKey="high"
        lowKey="low"
        closeKey="close"
        volumeKey="volume"
        formatYLabel={formatValue}
        height={280}
        showHorizontalGridLines
        showYAxisLabels
        width={410}
      />
    </View>
  );
}
```

::chart-preview{id="pro-candlebar-realtime"}

In production, replace `createLiveCandles()` with your websocket, stream, or
polling adapter.

## Product Use Cases

Use Candlebar charts for stocks, crypto, commodities, FX, embedded broker
flows, portfolio analytics, and any screen where users need to inspect price
movement without leaving the mobile app.

## Props

| Prop                   | Type                  | Description                                                |
| ---------------------- | --------------------- | ---------------------------------------------------------- |
| `data`                 | `TData[]`             | Object-row OHLC source data.                               |
| `dateKey`              | `keyof TData`         | Row key used for x-axis labels and selected candle labels. |
| `openKey`              | `keyof TData`         | Row key used for opening values.                           |
| `highKey`              | `keyof TData`         | Row key used for high wick values.                         |
| `lowKey`               | `keyof TData`         | Row key used for low wick values.                          |
| `closeKey`             | `keyof TData`         | Row key used for closing values.                           |
| `volumeKey`            | `keyof TData`         | Optional row key used for volume bars.                     |
| `defaultSelectedIndex` | `number`              | Initial selected candle index.                             |
| `selectedIndex`        | `number`              | Controlled selected candle index for external inspectors.  |
| `interaction`          | `object`              | Enables tap or crosshair selection and gesture callbacks.  |
| `viewport`             | `object`              | Controlled visible candle range.                           |
| `onViewportChange`     | `(event) => void`     | Called when the visible range changes.                     |
| `rangeSelector`        | `boolean` or `object` | Shows and configures the mini range selector.              |
| `viewportInteraction`  | `boolean` or `object` | Enables pan/zoom viewport gestures.                        |
| `width`                | `number`              | Outer chart width in pixels.                               |
| `height`               | `number`              | Outer chart height in pixels.                              |
