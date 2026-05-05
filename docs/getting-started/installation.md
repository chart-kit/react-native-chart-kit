# Installation

Chart Kit v2 is developed in this repo as a workspace package before public beta packaging is finalized.

For local development in this repository:

```sh
git clone git@github.com:indiespirit/react-native-chart-kit.git
cd react-native-chart-kit
npm install
```

For the planned beta package:

```sh
npm install @chart-kit/react-native react-native-svg react-native-gesture-handler
```

During internal development, modern examples import from `@chart-kit/react-native-v2`, which is a private workspace package. Before beta, the approved package strategy is to keep the existing `react-native-chart-kit` package as the upgrade bridge and expose the modern API from the scoped package path.

## Expo

For Expo apps, install the native peer dependencies with Expo so versions match the SDK:

```sh
npx expo install react-native-svg react-native-gesture-handler
```

Then wrap your app with `GestureHandlerRootView` if you use pan, scrub, pinch zoom, or range selector interactions.

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Root />
    </GestureHandlerRootView>
  );
}
```

## First Modern Chart

New apps should start with object-row data and explicit keys. This avoids the old `labels` plus `datasets` shape unless you are migrating existing code.

```tsx
import { LineChart } from "@chart-kit/react-native-v2";

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

## App Theme

Set the product theme once at the app boundary. Every chart can still override `theme` or `preset` locally.

```tsx
import { ChartKitProvider } from "@chart-kit/react-native-v2";

<ChartKitProvider mode="system" preset="analytics">
  <Dashboard />
</ChartKitProvider>;
```

See [themes](../charts/themes.md) for custom preset creation.

## Local Review App

The Expo showcase is the fastest way to review the current implementation on web or a phone:

```sh
npm run example:expo
```

If Expo Go cannot discover the LAN server, use tunnel mode:

```sh
npm run example:expo -- --tunnel
```
