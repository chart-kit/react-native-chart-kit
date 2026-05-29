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

- [Line](charts/line.md)
- [Area](charts/area.md)
- [Bar](charts/bar.md)
- [Pie](charts/pie.md)
- [Donut](charts/donut.md)
- [Progress](charts/progress.md)
- [Contribution heatmap](charts/contribution-heatmap.md)

## Guides

- [Themes](charts/themes.md)
- [Accessibility](charts/accessibility.md)
- [Troubleshooting](troubleshooting.md)

## Recipes

- [Production recipes](recipes/README.md)

## Local Review

Type-check the React Native CLI example surface when changing package imports or peer setup:

```sh
npm run example:rn-cli:typecheck
```

The Expo preview app lives in the private `chart-kit-pro` repository because it
combines free and Pro chart examples.
