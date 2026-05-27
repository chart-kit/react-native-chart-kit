---
title: Chart Kit v2 Docs
description: Start here for the React Native Chart Kit v2 documentation.
---

# Chart Kit v2 Docs

These docs describe the public React Native Chart Kit package: the
legacy-compatible root API and the free modern v2 API. `react-native-chart-kit`
is the only public npm install path. The `@chart-kit/*` workspaces are private
repo-internal packages used to develop and build the modern implementation.
Modern v2 examples import from `react-native-chart-kit/v2`.

## Getting Started

- [Quickstart](getting-started/installation.md)

## Migration

- [From v1](migration/from-v1.md)
- [Prop mapping](migration/prop-mapping.md)

## Charts

- [Line and area](charts/line-and-area.md)
- [Bar](charts/bar.md)
- [Pie and donut](charts/pie-and-donut.md)
- [Progress](charts/progress.md)
- [Contribution heatmap](charts/contribution-heatmap.md)

## Guides

- [Themes](charts/themes.md)
- [Accessibility](charts/accessibility.md)
- [Troubleshooting](troubleshooting.md)
- <a href="/examples/">Live examples website</a>

## Recipes

- [Production recipes](recipes/README.md)

## Local Preview

Run the Expo showcase when you need to review the same chart stories used by visual regression:

```sh
npm run example:expo
```

Type-check the React Native CLI example surface when changing package imports or peer setup:

```sh
npm run example:rn-cli:typecheck
```

Run the web visual suite before changing default layout, theme, or renderer behavior:

```sh
npm run test:visual
```
