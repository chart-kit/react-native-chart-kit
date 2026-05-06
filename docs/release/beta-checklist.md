# Beta Release Checklist

This checklist tracks CKV2-017 readiness. It is not approval to publish; H5 still requires owner review.

## Package And Version

- Current version: `7.0.0-next.0`
- Current root package name: `react-native-chart-kit`
- Current modern workspace package: `@chart-kit/react-native`
- Package strategy: `react-native-chart-kit` remains the compatibility path; `@chart-kit/react-native` is the modern v2 API for new adopters
- Dist-tag target for first public test: `beta`
- Publish manifest: [package-manifest.json](evidence/package-manifest.json) is the source of truth for beta-publishable packages. It currently publishes the root compatibility package, `@chart-kit/core`, `@chart-kit/svg-renderer`, and `@chart-kit/react-native`; it pack-checks but does not beta-publish `@chart-kit/skia-renderer` or `@chart-kit/pro`.

## Required Checks

Run these before requesting H5 review:

```sh
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:visual
npm run benchmark
npm run boundaries:check
npm run surface:check
npm run skia:parity
npm run release:gate:report
npm run docs:build
npm run example:rn-cli:typecheck
npm run native:release:dry-run
npm run build
npm run pack:check
```

Manual example commands:

- `npm run example:expo` starts the Expo showcase for phone/device review.
- `npm run example:ios` starts the Expo showcase with the iOS dev target. It requires local iOS tooling.
- `npm run example:android` starts the Expo showcase with the Android dev target. It requires local Android tooling.
- `npm run example:rn-cli:typecheck` verifies the non-Expo RN CLI app source and Metro import aliases.
- `npm run native:release:dry-run` prints the generated native release-build commands without requiring local native projects.
- `npm run native:release:android` and `npm run native:release:ios` run the release-build checks documented in [Native release checks](native-release-checks.md).
- `npm run release:gate:report` prints the current H4/H5/H6 blockers without failing; `npm run release:gate` is the strict publish gate and should fail until the blockers are resolved.

The `test:e2e` command covers web showcase interaction flows. The example commands are not native release-build checks and must not be counted as passing automated native coverage.

The `docs:build` command validates local links, balanced code fences, JS/TS markdown fence syntax, and public TS/TSX docs examples. Integrated docs example coverage still runs through `npm run rn:typecheck`.

The `pack:check` command runs `npm pack --dry-run --json --ignore-scripts` for every package in the release package manifest, using a repo-local temp npm cache. It verifies package names, package metadata, README files, built `dist` entrypoints, and the modern `pro-preview` subpath artifacts. The publish workflow reads the same manifest for the beta publish list so preview-only packages cannot be published by an unrelated hardcoded loop.

Use `npm run release:qa:record -- --matrix runtime --list` to inspect native QA matrix rows, and use the same command with `--row`, `--status`, and `--evidence` after a manual device pass. The recorder rejects `pass` rows without evidence links and regenerates [native QA checklist](native-qa-checklists.md).

## Manual Review

- Expo showcase opens on a phone with `npm run example:expo`.
- Line Charts page covers free baseline examples plus Pro-candidate animation, range selector, viewport pan/zoom, scrub tooltip, markers, references, and multi-series examples.
- Bar Charts page covers free baseline examples plus Pro-candidate grouped, selectable, animated, scrollable, horizontal, negative, and stacked percentage examples.
- Combined Preview page covers Pro-candidate dual-axis revenue/margin, shared tooltip, legend toggles, and negative values.
- Pie & Donut, Progress, Heatmaps, and Financial Preview pages render with app-level theme switching.
- Compatibility page still shows line, bar, and stacked-bar fixtures.

## Release Artifacts

- [Accessibility QA protocol](accessibility-qa.md)
- [Native QA checklist](native-qa-checklists.md)
- [Native performance benchmark protocol](native-performance-benchmark.md)
- [Native runtime QA protocol](native-runtime-qa.md)
- [Migration guide](../migration/from-v1.md)
- `chartkit-codemod v1-to-v2`
- [Prop mapping](../migration/prop-mapping.md)
- [Installation guide](../getting-started/installation.md)
- [Production recipes](../recipes/README.md)
- [Troubleshooting guide](../troubleshooting.md)
- [Known issues](known-issues.md)
- [H4 Pro scope decision packet](h4-pro-scope.md)
- [H5 beta gate evidence](h5-beta-gate-evidence.md)
- [H5 owner decision memo](h5-owner-decision-memo.md)
- [Native release workflow evidence manifest](evidence/native-release-workflow.json)
- [Skia renderer evidence manifest](evidence/skia-renderer-evidence.json)
- [Changelog](../../CHANGELOG.md)

## H5 Owner Decision

Before publishing beta, the owner should decide:

- publish beta or keep iterating
- whether known native e2e gaps are acceptable for beta
- which Pro preview features remain visible in the free preview app
- whether candlestick stays in public beta or remains behind a preview/financial label
