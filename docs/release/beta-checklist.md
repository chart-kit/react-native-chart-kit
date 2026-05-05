# Beta Release Checklist

This checklist tracks CKV2-017 readiness. It is not approval to publish; H5 still requires owner review.

## Package And Version

- Current version: `7.0.0-next.0`
- Current root package name: `@chart-kit/react-native`
- Current modern workspace package: `@chart-kit/react-native-v2` and private
- Beta decision needed: final public import path and whether the existing `react-native-chart-kit` package is restored as the npm continuity path for this repo
- Dist-tag target for first public test: `beta`

## Required Checks

Run these before requesting H5 review:

```sh
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:visual
npm run benchmark
npm run docs:build
npm run build
```

Expected known exceptions:

- `npm run example:ios` is still a placeholder.
- `npm run example:android` is still a placeholder.

The `test:e2e` command covers web showcase interaction flows. It must not be counted as passing native release-build coverage.

## Manual Review

- Expo showcase opens on a phone with `npm run example:expo`.
- Line Charts page covers animation, range selector, viewport pan/zoom, scrub tooltip, markers, references, and multi-series examples.
- Bar Charts page covers grouped, selectable, animated, scrollable, horizontal, negative, and stacked percentage examples.
- Combined Charts page covers dual-axis revenue/margin, shared tooltip, legend toggles, and negative values.
- Pie & Donut, Progress, Heatmaps, and Financial Charts pages render with app-level theme switching.
- Compatibility page still shows line, bar, and stacked-bar fixtures.

## Release Artifacts

- [Migration guide](../migration/from-v1.md)
- [Prop mapping](../migration/prop-mapping.md)
- [Installation guide](../getting-started/installation.md)
- [Production recipes](../recipes/README.md)
- [Troubleshooting guide](../troubleshooting.md)
- [Known issues](known-issues.md)
- [H5 beta gate evidence](h5-beta-gate-evidence.md)
- [Changelog](../../CHANGELOG.md)

## H5 Owner Decision

Before publishing beta, the owner should decide:

- publish beta or keep iterating
- final beta package name and import path
- whether known native e2e gaps are acceptable for beta
- which Pro preview features remain visible in the free preview app
- whether candlestick stays in public beta or remains behind a preview/financial label
