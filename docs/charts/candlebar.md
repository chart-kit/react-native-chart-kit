---
title: Candlebar Chart
description: Build OHLC and volume charts for trading, crypto, and market data screens with Chart Kit Pro.
---

# Candlebar Chart

`CandlebarChart` is a Pro chart for OHLC market data. It pairs candlestick
bodies, high/low wicks, volume context, and selection-ready hit targets in one
mobile chart surface.

This chart is available in Chart Kit Pro.

## Basic Candlebar

```tsx
import { CandlebarChart } from "@chart-kit/pro";

const candles = [
  { date: "09:30", open: 184, high: 196, low: 179, close: 191, volume: 42 },
  { date: "10:00", open: 191, high: 208, low: 188, close: 202, volume: 68 },
  { date: "10:30", open: 202, high: 206, low: 185, close: 189, volume: 74 },
  { date: "11:00", open: 189, high: 215, low: 186, close: 211, volume: 95 },
  { date: "11:30", open: 211, high: 226, low: 204, close: 219, volume: 88 },
  { date: "12:00", open: 219, high: 221, low: 198, close: 204, volume: 81 },
  { date: "12:30", open: 204, high: 232, low: 201, close: 228, volume: 118 },
  { date: "13:00", open: 228, high: 236, low: 214, close: 217, volume: 101 }
];

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
      defaultSelectedIndex={5}
      width={360}
      height={300}
    />
  );
}
```

::chart-preview{id="pro-candlebar"}

## Realtime Crypto Inspection

The crypto trading preview uses the candlestick chart as a controlled inspection
surface: live ticks update the latest candle, long-press crosshair selection
drives an OHLCV readout, and chart gestures pause the live loop while the user
is inspecting historical candles.

```tsx
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { CandlestickChart } from "@chart-kit/pro/react-native";

type CryptoCandle = {
  slot: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const liveUpdateMs = 1000;
const visiblePoints = 42;
const ticksPerCandle = 12;

const baseCandles: CryptoCandle[] = Array.from(
  { length: visiblePoints },
  (_, index) => {
    const open = 68000 + Math.sin(index * 0.7) * 520 + index * 14;
    const move = Math.cos(index * 0.55) * 280;
    const close = open + move;
    const wick = 180 + Math.abs(move) * 0.35;

    return {
      slot: index,
      time: `${String((7 + Math.floor(index / 4)) % 24).padStart(2, "0")}:${
        index % 4 === 0 ? "00" : String((index % 4) * 15).padStart(2, "0")
      }`,
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick * 0.8,
      close,
      volume: Math.round(70 + Math.abs(move) / 16)
    };
  }
);

const formatPrice = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const formatVolume = (value: number) => `${value.toFixed(0)} BTC`;

const addSyntheticCandle = (
  candles: CryptoCandle[],
  sequence: number
): CryptoCandle[] => {
  const previous = candles[candles.length - 1]!;
  const open = previous.close;
  const move = Math.sin(sequence * 0.8) * 260 + Math.cos(sequence * 0.34) * 180;
  const close = open + move;
  const wick = 150 + Math.abs(move) * 0.28;

  return [
    ...candles,
    {
      slot: sequence,
      time: `${String((7 + Math.floor(sequence / 4)) % 24).padStart(2, "0")}:${
        sequence % 4 === 0 ? "00" : String((sequence % 4) * 15).padStart(2, "0")
      }`,
      open,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick * 0.75,
      close,
      volume: Math.round(76 + Math.abs(move) / 18)
    }
  ];
};

const applyLiveTicks = (
  candle: CryptoCandle,
  liveTickCount: number,
  sequence: number
): CryptoCandle => {
  const live = { ...candle };

  for (let tick = 0; tick < liveTickCount; tick += 1) {
    const move =
      Math.sin((sequence + tick) * 0.9) * 42 +
      Math.cos((sequence + tick) * 0.35) * 28;
    const close = live.close + move;

    live.close = close;
    live.high = Math.max(live.high, close + Math.abs(move) * 0.5);
    live.low = Math.min(live.low, close - Math.abs(move) * 0.4);
    live.volume += 2 + Math.abs(move) / 18;
  }

  return live;
};

const createLiveCandles = (liveStep: number): CryptoCandle[] => {
  const closedCandleCount = Math.floor(liveStep / ticksPerCandle);
  const liveTickCount = liveStep % ticksPerCandle;
  let candles = baseCandles.map((candle) => ({ ...candle }));

  for (let index = 0; index < closedCandleCount; index += 1) {
    candles = addSyntheticCandle(candles, visiblePoints + index);
  }

  const last = candles[candles.length - 1];

  if (last && liveTickCount > 0) {
    candles[candles.length - 1] = applyLiveTicks(last, liveTickCount, liveStep);
  }

  return candles.slice(-visiblePoints).map((candle, slot) => ({
    ...candle,
    slot
  }));
};

export function LiveCryptoCandles() {
  const [liveStep, setLiveStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(visiblePoints - 1);
  const [isInspecting, setIsInspecting] = useState(false);

  useEffect(() => {
    if (isInspecting) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setLiveStep((current) => current + 1);
    }, liveUpdateMs);

    return () => clearInterval(intervalId);
  }, [isInspecting]);

  const candles = useMemo(() => createLiveCandles(liveStep), [liveStep]);
  const selected = candles[selectedIndex] ?? candles[candles.length - 1]!;
  const lows = candles.map((candle) => candle.low);
  const highs = candles.map((candle) => candle.high);
  const priceLow = Math.min(...lows);
  const priceHigh = Math.max(...highs);
  const pricePadding = (priceHigh - priceLow) * 0.08;

  useEffect(() => {
    if (!isInspecting) {
      setSelectedIndex(candles.length - 1);
    }
  }, [candles.length, isInspecting]);

  return (
    <View>
      <Text>BTC/USDT</Text>
      <Text>{formatPrice(candles[candles.length - 1]!.close)}</Text>

      <View>
        <Text>T {selected.time}</Text>
        <Text>O {formatPrice(selected.open)}</Text>
        <Text>H {formatPrice(selected.high)}</Text>
        <Text>L {formatPrice(selected.low)}</Text>
        <Text>C {formatPrice(selected.close)}</Text>
        <Text>V {formatVolume(selected.volume)}</Text>
      </View>

      <CandlestickChart
        accessibilityLabel="BTC USDT live candlestick chart"
        candleWidthRatio={0.5}
        closeKey="close"
        data={candles}
        downColor="#ff5f57"
        formatXLabel={(_value, index) => candles[index]?.time ?? ""}
        formatYLabel={formatPrice}
        height={280}
        highKey="high"
        interaction={{
          activation: "longPress",
          deselectOnOutsidePress: true,
          longPressDelayMs: 160,
          longPressMoveTolerance: 18,
          mode: "crosshair",
          onGestureEnd: () => setIsInspecting(false),
          onGestureStart: () => setIsInspecting(true),
          onSelect: (event) => setSelectedIndex(event.dataIndex)
        }}
        lowKey="low"
        openKey="open"
        rangeSelector={{
          height: 44,
          interactive: true,
          minVisiblePoints: 8
        }}
        selectedIndex={selectedIndex}
        selectionPriceLabel
        showHorizontalGridLines
        showYAxisLabels
        tooltip={false}
        upColor="#16c784"
        volumeHeightRatio={0.18}
        volumeKey="volume"
        width={360}
        xKey="slot"
        yDomain={[priceLow - pricePadding, priceHigh + pricePadding]}
        yTickCount={4}
        viewportInteraction={{
          lockParentScroll: true,
          maxVisiblePoints: candles.length,
          minVisiblePoints: 8
        }}
      />
    </View>
  );
}
```

In production, replace `createLiveCandles()` with your exchange feed, websocket,
or polling adapter. Keep the selected index controlled when the OHLCV inspector
lives outside the chart.

## Product Use Cases

Use Candlebar charts for stocks, crypto, commodities, FX, embedded broker
flows, portfolio analytics, and any screen where users need to inspect price
movement without leaving the mobile app.

## Install

Pro charts are distributed separately from the free package:

```sh
npm install react-native-chart-kit @chart-kit/pro react-native-svg
```

Access to `@chart-kit/pro` requires a Pro license.

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
| `rangeSelector`        | `boolean` or `object` | Shows and configures the mini range selector.              |
| `viewportInteraction`  | `boolean` or `object` | Enables pan/zoom viewport gestures.                        |
| `width`                | `number`              | Outer chart width in pixels.                               |
| `height`               | `number`              | Outer chart height in pixels.                              |
