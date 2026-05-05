# Chart Kit v2 Docs

These docs describe the current v2 preview implementation in this repository. The modern chart API is built in the private workspace package `@chart-kit/react-native-v2` while the final public package path is still a beta-release decision. The legacy root package remains the migration bridge.

## Getting Started

- [Installation](getting-started/installation.md)

## Migration

- [From v1](migration/from-v1.md)
- [Prop mapping](migration/prop-mapping.md)

## Charts

- [Line and area](charts/line-and-area.md)
- [Bar](charts/bar.md)
- [Combined](charts/combined.md)
- [Pie and donut](charts/pie-and-donut.md)
- [Progress](charts/progress.md)
- [Contribution heatmap](charts/contribution-heatmap.md)
- [Candlestick](charts/candlestick.md)

## Guides

- [Themes](charts/themes.md)
- [Accessibility](charts/accessibility.md)
- [Troubleshooting](troubleshooting.md)

## Recipes

- [Production recipes](recipes/README.md)

## Release

- [Beta checklist](release/beta-checklist.md)
- [H5 beta gate evidence](release/h5-beta-gate-evidence.md)
- [Known issues](release/known-issues.md)

## Local Preview

Run the Expo showcase when you need to review the same chart stories used by visual regression:

```sh
npm run example:expo
```

Run the web visual suite before changing default layout, theme, or renderer behavior:

```sh
npm run test:visual
```
