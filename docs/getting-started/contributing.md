---
title: Contributing
description: Set up the React Native Chart Kit repository and run local development checks.
---

# Contributing

This page is for developing React Native Chart Kit itself. If you are installing
the library in an app, start with the [Quickstart](installation.md).

## Repository Setup

```sh
git clone git@github.com:indiespirit/react-native-chart-kit.git
cd react-native-chart-kit
npm install
```

The repository uses npm workspaces and `package-lock.json`.

The published npm package is:

- `react-native-chart-kit`: the package installed by app developers.

The internal workspace packages are used to develop and build the library:

- `@chart-kit/core`: shared chart logic, types, scales, and data helpers.
- `@chart-kit/react-native`: React Native chart components and native-facing implementation.
- `@chart-kit/docs` or examples package: docs, demos, or local development examples.

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

| Command                            | Purpose                                                  |
| ---------------------------------- | -------------------------------------------------------- |
| `npm run core:typecheck`           | Type-check the v2 core workspace.                        |
| `npm run svg:typecheck`            | Type-check the SVG renderer workspace.                   |
| `npm run rn:typecheck`             | Type-check the React Native workspace.                   |
| `npm run test:unit`                | Run unit tests.                                          |
| `npm run test:compat`              | Run legacy compatibility tests.                          |
| `npm run example:rn-cli:typecheck` | Type-check the React Native CLI smoke example.           |
| `npm run docs:build`               | Verify docs links and type-check documentation examples. |
| `npm run pack:check`               | Dry-run package artifacts for the public package.        |
| `npm run surface:check`            | Check public exports and package boundaries.             |

## Example App

The public repo includes a React Native CLI smoke surface for non-Expo import and
peer-dependency checks:

```sh
npm run example:rn-cli:typecheck
```

See `examples/rn-cli-basic` for the app source and Metro aliases.

The Expo preview app lives in the private `chart-kit-pro` repository because it
combines free and Pro chart examples.

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
