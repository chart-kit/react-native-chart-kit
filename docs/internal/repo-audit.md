# CKV2-000 Repository Audit

Date: April 30, 2026

## Scope

This audit covers the current repository state before starting deeper Chart Kit v2 work. It inventories package structure, tooling, examples, renderer architecture, dependencies, native risk, and test gaps.

## Executive Summary

- The package is already renamed to `@chart-kit/react-native` at `7.0.0-next.0`.
- The repository is not currently a monorepo. The library source lives in `src/`, compiled output lives in `dist/`, and the only app-like workspace is `apps/showcase-web`.
- The public entrypoint exports the legacy component set: `AbstractChart`, `BarChart`, `LineChart`, `PieChart`, `ProgressChart`, `ContributionGraph`, and `StackedBarChart`.
- Rendering is directly coupled to `react-native-svg` inside each chart component. There is no renderer abstraction or shared v2 core package yet.
- Shared chart math and label/grid helpers live in `src/shared/AbstractChart.tsx`; data normalization, scale calculation, layout, geometry, and interaction are mixed into components.
- The current visual harness is useful but narrow: Storybook plus Playwright screenshots exist for `LineChart` and `BarChart` only.
- There is no unit test runner, compatibility test suite, benchmark suite, Expo example, React Native CLI example, or docs build command.
- The safest next milestone is H0/H1 decision work plus CKV2-001 scaffolding only after package strategy is approved.

## Repository Layout

```text
src/
  index.ts
  shared/
    AbstractChart.tsx
    types.ts
    utils.ts
  charts/
    bar/
    contribution-graph/
    line/
    pie/
    progress/
    stacked-bar/
apps/
  showcase-web/
    .storybook/
    src/charts/bar/
    src/charts/line/
    visual/
docs/
  assets/
dist/
  compiled package output
```

## Package And Tooling

Current package metadata:

- Name: `@chart-kit/react-native`
- Version: `7.0.0-next.0`
- Main: `./dist/index.js`
- Types: `./dist/index.d.ts`
- Published files: `dist`
- Node engine: `>=20.19.4`
- Package manager artifacts: `package-lock.json` is present; no Yarn workspace setup is present.

Current scripts:

```text
npm run lint
npm run format
npm run format:check
npm run test
npm run typecheck
npm run showcase
npm run showcase:build
npm run showcase:typecheck
npm run visual:test
npm run visual:update
npm run clean
npm run build
npm run dev
```

Important script behavior:

- `npm run test` currently aliases to `npm run typecheck`.
- `npm run typecheck` runs root TypeScript and showcase TypeScript.
- `npm run visual:test` builds Storybook and runs Playwright screenshots.
- There are no `yarn` scripts wired for the final CKV2 command list yet.

Commands required by the v2 specification that are currently missing:

```text
yarn test:unit
yarn test:visual
yarn test:compat
yarn test:e2e
yarn benchmark
yarn example:ios
yarn example:android
yarn example:expo
yarn docs:build
```

The intent of `test:visual` is partially covered by `npm run visual:test`.

## CI And Release Automation

Current CI workflow:

- Runs on pull requests and pushes to `master` and `next`.
- Uses Node 22.
- Runs `npm install --ignore-scripts`.
- Runs lint, build, and typecheck.
- Does not run visual tests.

Current publish workflow:

- Manual `workflow_dispatch` only.
- Publishes from `next`.
- Supports `next`, `beta`, and `latest` npm dist-tags.
- Uses Node 24.
- Builds and typechecks before publish.
- Verifies package version and git tag are unpublished before publishing.

## Current Implementation Architecture

The current architecture is a legacy-compatible SVG implementation:

- `AbstractChart` owns shared scaling helpers, gradient definitions, grid rendering, horizontal labels, vertical labels, and baseline math.
- `LineChart`, `BarChart`, `StackedBarChart`, `PieChart`, `ProgressChart`, and `ContributionGraph` render SVG directly.
- `LineChart` contains its own polyline/path geometry, bezier path generation, dots, dot press handling, scrollable dot overlay, legend rendering, and shadow area rendering.
- `BarChart` contains its own bar geometry, optional custom per-bar gradients, bar tops, and value labels.
- `StackedBarChart` contains stack layout, legend rendering, and percentile mode.
- `PieChart` and `ProgressChart` use `paths-js/pie` for arc geometry.
- `ContributionGraph` contains date indexing, calendar layout, color mapping, month labels, and press events.

There is no separate module yet for:

- data normalization
- scale/domain/tick generation
- auto layout
- label collision
- legend layout
- tooltip placement
- renderer abstraction
- accessibility summaries
- hit testing
- viewport/windowing
- decimation

## Examples And Visual Artifacts

Current example coverage:

- README examples exist for all current chart types.
- `apps/showcase-web` has deterministic Storybook stories for `LineChart` and `BarChart`.
- Playwright visual snapshots exist for:
  - line basic
  - line long labels
  - line dense data
  - line negative values
  - line empty state
  - line dark mode
  - line tiny width
  - bar basic
  - bar long labels
  - bar dense data
  - bar negative values
  - bar empty state
  - bar dark mode
  - bar tiny width
- The showcase intentionally is not a public docs site.
- The old Expo SDK 37 root demo has been removed.

Missing example coverage relative to the v2 spec:

- Expo example app
- React Native CLI example app
- kitchen sink example
- visual-regression examples for pie, progress, stacked bar, and contribution graph
- scrollable chart examples
- tooltip/crosshair examples
- accessibility examples
- docs recipes

## Dependency And Native Risk List

Production/runtime dependencies:

- `react-native-svg`
- `paths-js`

Peer dependencies:

- `react`
- `react-native`
- `react-native-svg`

Development dependencies include Storybook, Playwright, React Native Web, TypeScript, ESLint, and Vite.

Risk notes:

- `react-native-svg` is the only native rendering dependency today. It is also the key install/runtime risk for Expo dev-client, Android release, and RN upgrade compatibility.
- `paths-js` is used for pie/progress geometry. It is small, but it is not typed locally and may be a constraint when moving geometry into `packages/core`.
- The package currently targets React 19 and React Native 0.83+. That is modern, but it narrows the install matrix compared with older Chart Kit users.
- Storybook and React Native Web are useful for visual coverage, but they do not prove native iOS/Android release-build behavior.
- A future Skia renderer should stay optional until package strategy and Pro boundaries are approved.

## Current Test Coverage

Current checks:

- ESLint over the repository.
- TypeScript over `src`.
- TypeScript over `apps/showcase-web`.
- Playwright visual screenshots for line and bar Storybook stories.

Known gaps:

- No unit tests for data normalization, scales, ticks, layout, geometry, null handling, or hit testing.
- No compatibility fixture tests for legacy v1 usage.
- No e2e native test coverage.
- No Android or iOS release-build verification.
- No benchmark command.
- Visual tests are not run in CI.
- Visual coverage excludes `StackedBarChart`, `PieChart`, `ProgressChart`, and `ContributionGraph`.

## Architectural Fit Against V2 Spec

Already aligned:

- Package version is in a v2-product-generation prerelease range.
- Existing exports match the required compatibility facade component names.
- README documents the common legacy data shapes and props.
- Visual regression infrastructure exists and can be expanded.
- CI exists and can be expanded incrementally.

Not yet aligned:

- No monorepo package layout.
- No `core`, `react-native`, `svg-renderer`, `compat-chart-kit`, `skia-renderer`, or `pro` packages.
- No modern composable API.
- No renderer contract.
- No smart layout engine.
- No explicit compatibility flags such as `compatibility="v1"`, `fit="legacy"`, `padding="legacy"`, or `legacySpacing`.
- No codemod or migration guide.
- No Pro package or license boundary.

## Recommended Next Steps

1. Complete H0 and H1 owner decisions before restructuring packages.
2. Treat CKV2-001 as a scaffolding milestone, not a full rewrite.
3. Preserve the current root exports as the compatibility surface while adding v2 internals behind them.
4. Add a unit test runner before core data/scales work.
5. Expand visual fixtures to all existing chart families before replacing rendering behavior.
6. Keep `react-native-svg` as the default renderer and isolate any future Skia work.

## Human Gate Inputs Needed

H0 package strategy:

- Should the repository keep the current `@chart-kit/react-native` package as canonical, restore or additionally publish `react-native-chart-kit`, or support both?
- Should this repository become a monorepo now, or should v2 core modules be introduced under `src/` first and moved later?
- Should `dist/` remain committed during development?
- Which package manager should be authoritative for v2 work: npm, Yarn, or both?

H1 compatibility strategy:

- Should current root exports stay legacy-compatible by default while modern APIs use new names?
- Should `compatibility="v1"` exist on current component names, or should compatibility be implicit for those names?
- Which existing layout quirks are acceptable to preserve behind explicit legacy flags?
