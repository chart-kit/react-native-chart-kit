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
npm run test
npm run test:unit
npm run test:visual
npm run build
```

Command status:

| Command                   | Current status                                                  |
| ------------------------- | --------------------------------------------------------------- |
| `npm run lint`            | Working ESLint check.                                           |
| `npm run typecheck`       | Working TypeScript check for library and showcase.              |
| `npm run core:typecheck`  | Working TypeScript check for the v2 core scaffold.              |
| `npm run test`            | Working typecheck plus unit test command.                       |
| `npm run test:unit`       | Working Vitest unit test command.                               |
| `npm run test:visual`     | Working alias for Storybook plus Playwright visual screenshots. |
| `npm run test:compat`     | Placeholder; compatibility fixtures not configured yet.         |
| `npm run test:e2e`        | Placeholder; native e2e tests not configured yet.               |
| `npm run benchmark`       | Placeholder; benchmark suite not configured yet.                |
| `npm run example:ios`     | Placeholder; native iOS example not configured yet.             |
| `npm run example:android` | Placeholder; native Android example not configured yet.         |
| `npm run example:expo`    | Placeholder; Expo example not configured yet.                   |
| `npm run docs:build`      | Placeholder; docs site build not configured yet.                |

Placeholder commands intentionally exit with a non-zero status so CI cannot mistake missing coverage for a passing check.
