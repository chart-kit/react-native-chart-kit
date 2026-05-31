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

| Prop                   | Type          | Description                                                |
| ---------------------- | ------------- | ---------------------------------------------------------- |
| `data`                 | `TData[]`     | Object-row OHLC source data.                               |
| `dateKey`              | `keyof TData` | Row key used for x-axis labels and selected candle labels. |
| `openKey`              | `keyof TData` | Row key used for opening values.                           |
| `highKey`              | `keyof TData` | Row key used for high wick values.                         |
| `lowKey`               | `keyof TData` | Row key used for low wick values.                          |
| `closeKey`             | `keyof TData` | Row key used for closing values.                           |
| `volumeKey`            | `keyof TData` | Optional row key used for volume bars.                     |
| `defaultSelectedIndex` | `number`      | Initial selected candle index.                             |
| `width`                | `number`      | Outer chart width in pixels.                               |
| `height`               | `number`      | Outer chart height in pixels.                              |
