# React Native CLI Basic Example

This is a small non-Expo example app for the modern Chart Kit v2 package.

It is mainly used to check that a plain React Native CLI app can import
`react-native-chart-kit/v2` and type-check chart usage without Expo.

## What It Covers

- `react-native-chart-kit/v2` import path
- `LineChart`, `BarChart`, and `ProgressRing`
- TypeScript props for common chart usage
- Metro aliases back to local workspace source
- peer dependencies such as `react`, `react-native`, and `react-native-svg`

## Local Checks

From the repository root:

```sh
npm run example:rn-cli:typecheck
```

This command does not build iOS or Android. It only runs TypeScript against the
example app source.

## Native Review

This folder intentionally does not check in generated `ios/` and `android/` projects. To run native runtime checks, generate or maintain native projects for this app, then use this app source and Metro config as the chart screen.
