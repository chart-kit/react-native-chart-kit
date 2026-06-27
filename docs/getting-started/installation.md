---
title: Quickstart
description: Install React Native Chart Kit and render a first chart.
---

# Quickstart

Start using `react-native-chart-kit` with a basic setup.

## React Native CLI

```sh
npm install react-native-chart-kit react-native-svg
```

For iOS apps, install native pods after installing dependencies:

```sh
cd ios
pod install
```

## Expo

Install the package and the Expo-compatible `react-native-svg` version:

```sh
npm install react-native-chart-kit
npx expo install react-native-svg
```

## First Modern Chart

New screens can import the modern v2 API from the public package subpath.

```tsx
import { LineChart } from "react-native-chart-kit/v2";

const data = [
  { month: "Jan", revenue: 52 },
  { month: "Feb", revenue: 86 },
  { month: "Mar", revenue: 58 },
  { month: "Apr", revenue: 134 },
  { month: "May", revenue: 95 },
  { month: "Jun", revenue: 176 }
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

The root import remains the legacy-compatible surface for existing screens.

For Pro charts, see [Pro chart installation](../charts/pro-installation.md).
