---
title: Installation
description: Install Chart Kit Pro alongside the public React Native Chart Kit package.
---

# Installation

Pro charts ship as a licensed package that is installed next to the public
`react-native-chart-kit` package. Keep the public package installed because Pro
charts share the same theme provider, renderer defaults, and React Native SVG
peer dependency.

Access to `@chart-kit/pro` requires a Pro license.

## React Native CLI

```sh
npm install react-native-chart-kit @chart-kit/pro react-native-svg
```

For iOS apps, install native pods after installing dependencies:

```sh
cd ios
pod install
```

## Expo

Install the packages and let Expo choose the compatible `react-native-svg`
version:

```sh
npm install react-native-chart-kit @chart-kit/pro
npx expo install react-native-svg
```

## Imports

Modern public charts import from `react-native-chart-kit/v2`. Pro chart
examples import from `@chart-kit/pro`.

```tsx
import { LineChart } from "react-native-chart-kit/v2";
import { ComboChart } from "@chart-kit/pro";
```
