# Contributing to React Native Chart Kit

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

Suggestions and pull requests are highly encouraged! Have a look at the [open issues](https://github.com/indiespirit/react-native-chart-kit/issues).

## Branch names

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

Include an issue number when the branch maps to a specific issue, for example `fix/733-svg-gradient-ids`. Keep each branch scoped to one pull request.

## Workflow

First clone:

```sh
git clone git@github.com:indiespirit/react-native-chart-kit.git
cd react-native-chart-kit
npm install
```

The package root is focused on the library build and checks. The old Expo SDK 37 demo has been removed from the root tooling; a modern example app should live separately from the package entrypoint.

```sh
npm run lint
npm run typecheck
npm run build
```

## CKV2 command matrix

The v2 specification defines the final command set in Yarn terms, but this repository currently uses npm and `package-lock.json`. The package scripts are named so either npm or Yarn can invoke them once the chosen package manager is finalized.

Current working commands:

```sh
npm run lint
npm run typecheck
npm run core:typecheck
npm run svg:typecheck
npm run rn:typecheck
npm run showcase:typecheck
npm run test
npm run test:unit
npm run test:compat
npm run test:e2e
npm run test:visual
npm run benchmark
npm run boundaries:check
npm run surface:check
npm run skia:parity
npm run native:release:dry-run
npm run build
```

Command status:

| Command                          | Current status                                                        |
| -------------------------------- | --------------------------------------------------------------------- |
| `npm run lint`                   | Working ESLint check.                                                 |
| `npm run typecheck`              | Working TypeScript check for library and showcase.                    |
| `npm run core:typecheck`         | Working TypeScript check for the v2 core scaffold.                    |
| `npm run svg:typecheck`          | Working TypeScript check for the v2 SVG renderer package.             |
| `npm run rn:typecheck`           | Working TypeScript check for the v2 React Native package.             |
| `npm run showcase:typecheck`     | Working TypeScript check for the showcase stories.                    |
| `npm run test`                   | Working typecheck, unit, and compatibility test command.              |
| `npm run test:unit`              | Working Vitest unit test command.                                     |
| `npm run test:visual`            | Working alias for Expo showcase plus Playwright visual screenshots.   |
| `npm run test:compat`            | Working Vitest command for legacy compatibility fixtures.             |
| `npm run test:e2e`               | Working Playwright command for showcase interaction flows.            |
| `npm run benchmark`              | Working core geometry benchmark with line and bar scenarios.          |
| `npm run boundaries:check`       | Working package-boundary audit for free, Pro, and Skia separation.    |
| `npm run surface:check`          | Working public export and package-boundary audit.                     |
| `npm run skia:parity`            | Working local Skia primitive and LineChart renderer contract tests.   |
| `npm run example:ios`            | Working Expo showcase iOS dev command. Requires local iOS tooling.    |
| `npm run example:android`        | Working Expo showcase Android dev command. Requires Android tooling.  |
| `npm run example:expo`           | Working Expo showcase app command for phone/device review.            |
| `npm run native:release:dry-run` | Working native release-build command preview.                         |
| `npm run native:release:ios`     | Native iOS release-build check. Requires macOS, Xcode, and CocoaPods. |
| `npm run native:release:android` | Native Android release-build check. Requires Android tooling.         |
| `npm run docs:build`             | Working markdown docs verifier for local links and code fences.       |

The iOS and Android example commands launch the Expo showcase for manual device or simulator review. They are not native release-build checks and should not be counted as automated native e2e coverage.

Use [Native release checks](docs/release/native-release-checks.md) before production beta or release-candidate review.
