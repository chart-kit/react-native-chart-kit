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
