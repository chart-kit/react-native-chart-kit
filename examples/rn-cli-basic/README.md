# React Native CLI Basic Example

This example is the non-Expo smoke surface for the modern Chart Kit v2 package. It keeps a small app source tree that can be used inside a React Native CLI project to validate Metro resolution, TypeScript types, peer dependencies, and native runtime behavior.

## What It Covers

- `react-native-chart-kit/v2` import path
- dependency-light chart rendering without Expo or Gesture Handler
- `LineChart`, `BarChart`, and `ProgressRing`
- Metro aliases back to local workspace source
- TypeScript verification through the root repo

## Local Checks

From the repository root:

```sh
npm run example:rn-cli:typecheck
```

## Native Review

This folder intentionally does not check in generated `ios/` and `android/` projects. To run native runtime checks, generate or maintain native projects for this app, then use this app source and Metro config as the chart screen.
