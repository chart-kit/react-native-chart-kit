# Installation

Chart Kit v2 is developed in this repo as the `@chart-kit/react-native` workspace package. The existing `react-native-chart-kit` package remains the compatibility path for current users.

For local development in this repository:

```sh
git clone git@github.com:indiespirit/react-native-chart-kit.git
cd react-native-chart-kit
npm install
```

For new apps using the modern v2 API:

```sh
npm install @chart-kit/react-native react-native-svg
```

For existing apps, keep using `react-native-chart-kit` during migration and move new screens to `@chart-kit/react-native` when you want the modern object-row API.

## Expo

For Expo apps, install the native peer dependencies with Expo so versions match the SDK:

```sh
npx expo install react-native-svg
```

Baseline tap, scrub, pan, pinch zoom, and range-selector interactions use React Native responder APIs, so new apps do not need a gesture-handler wrapper just to render or inspect charts.

## First Modern Chart

New apps should start with object-row data and explicit keys. This avoids the old `labels` plus `datasets` shape unless you are migrating existing code.

```tsx
import { LineChart } from "@chart-kit/react-native";

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
import { ChartKitProvider } from "@chart-kit/react-native";

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

The repo also includes a React Native CLI smoke surface for non-Expo import and peer-dependency checks:

```sh
npm run example:rn-cli:typecheck
```

See `examples/rn-cli-basic` for the app source and Metro aliases. Native iOS and Android release-build projects are still tracked as release-gate work rather than covered by this typecheck.
