# Chart Kit v2 Docs

These docs describe the current v2 preview implementation in this repository. The modern chart API is built in `@chart-kit/react-native`, while the legacy root package `react-native-chart-kit` remains the migration bridge for existing apps.

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

- [Accessibility QA protocol](release/accessibility-qa.md)
- [Beta checklist](release/beta-checklist.md)
- [H4 Pro scope decision packet](release/h4-pro-scope.md)
- [H5 beta gate evidence](release/h5-beta-gate-evidence.md)
- [H5 owner decision memo](release/h5-owner-decision-memo.md)
- [Native release checks](release/native-release-checks.md)
- [Native release results](release/native-release-results.md)
- [Known issues](release/known-issues.md)
- [Completion audit](internal/completion-audit.md)

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
