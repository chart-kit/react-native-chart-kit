---
title: Contributing
description: Set up the React Native Chart Kit repository and run local development checks.
---

# Contributing

This page is for developing React Native Chart Kit itself. If you are installing
the library in an app, start with the [Quickstart](installation.md).

## Repository Setup

```sh
git clone git@github.com:chart-kit/react-native-chart-kit.git
cd react-native-chart-kit
npm install
```

The repository uses npm workspaces and `package-lock.json`.

App developers install this package:

- `react-native-chart-kit`: the public npm package.

This repository also has internal workspaces:

- `@chart-kit/core`: shared chart logic, types, scales, and data helpers.
- `@chart-kit/svg-renderer`: SVG primitives and renderer helpers used by the React Native charts.
- `@chart-kit/react-native`: the React Native implementation of the modern charts. It is assembled into `react-native-chart-kit/v2`.
- `@chart-kit/site`: the docs site and live chart previews.

## Local Checks

Run the focused check for the area you changed, then run the broader checks
before opening a pull request.

```sh
npm run lint
npm run typecheck
npm run test
npm run docs:build
npm run build
```

Useful focused commands:

| Command                            | Purpose                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `npm run core:typecheck`           | Type-check the core workspace.                                                   |
| `npm run svg:typecheck`            | Type-check the SVG renderer workspace.                                           |
| `npm run rn:typecheck`             | Type-check the chart library's React Native implementation and its tests.        |
| `npm run test:unit`                | Run unit tests.                                                                  |
| `npm run test:compat`              | Check that old v6-style chart data still normalizes correctly.                   |
| `npm run example:rn-cli:typecheck` | Type-check the small non-Expo example app against `react-native-chart-kit/v2`.   |
| `npm run docs:build`               | Verify docs links and type-check documentation examples.                         |
| `npm run pack:check`               | Dry-run the npm packages and confirm required files are included.                |
| `npm run surface:check`            | Check public exports and make sure free packages do not import Pro or Skia code. |

## Example App

The public repo includes a small React Native CLI example app:

```sh
npm run example:rn-cli:typecheck
```

Use it to check that a plain non-Expo app can import
`react-native-chart-kit/v2` and pass valid props to the chart components.

The example app lives in `examples/rn-cli-basic`:

- `App.tsx`: the example screen with a few charts.
- `metro.config.js`: Metro aliases that point package imports back to this repo's local source files.

## Branch Names

Use lowercase kebab-case branch names in this format:

```sh
<type>/<short-summary>
```

Use these branch types:

- `fix/` for user-visible bug fixes
- `feat/` for new public functionality
- `docs/` for documentation-only changes
- `ci/` for automation and CI changes
- `chore/` for maintenance, release hygiene, and dependency upkeep
- `refactor/` for internal changes that do not intentionally change behavior
- `release/` for version bump and publishing prep

Include an issue number when the branch maps to a specific issue, for example
`fix/733-svg-gradient-ids`. Keep each branch scoped to one pull request.
