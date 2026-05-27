---
title: Quickstart
description: Install React Native Chart Kit and render a first chart.
---

# Quickstart

Chart Kit v2 is developed in private repo-internal `@chart-kit/*` workspaces,
but `react-native-chart-kit` is the only public npm install path.

For local development in this repository:

```sh
git clone git@github.com:indiespirit/react-native-chart-kit.git
cd react-native-chart-kit
npm install
```

For apps:

```sh
npm install react-native-chart-kit react-native-svg
```

The root import remains the legacy-compatible API. The modern free v2 API is
available from the `react-native-chart-kit/v2` subpath.

## Expo

For Expo apps, install the native peer dependencies with Expo so versions match the SDK:

```sh
npx expo install react-native-svg
```

Baseline tap, scrub, pan, pinch zoom, and range-selector interactions use React Native responder APIs, so new apps do not need a gesture-handler wrapper just to render or inspect charts.

## First Modern Chart

New v2 screens can import the modern API from the public package subpath.

```tsx
import { LineChart } from "react-native-chart-kit/v2";

const data = [
  { month: "Jan", revenue: 18 },
  { month: "Feb", revenue: 34 },
  { month: "Mar", revenue: 29 },
  { month: "Apr", revenue: 52 }
];

export function RevenueChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      width={360}
      height={240}
      preset="analytics"
    />
  );
}
```

The root import remains the legacy-compatible surface for existing screens.

## Local Review App

The Expo showcase is the fastest way to review the current implementation on web or a phone:

```sh
npm run example:expo
```

If Expo Go cannot discover the LAN server, use tunnel mode:

```sh
npm run example:expo -- --tunnel
```

The repo also includes a React Native CLI smoke surface for non-Expo import and peer-dependency checks:

```sh
npm run example:rn-cli:typecheck
```

See `examples/rn-cli-basic` for the app source and Metro aliases.
