# Workflow

## Repos

- Public repo: `react-native-chart-kit`
- Pro repo when present: `../chart-kit-pro`
- Internal docs when present: `../chart-kit-docs`

Read `AGENTS.md` first. If it points to `../chart-kit-docs`, read the relevant docs before changing public/private boundaries, releases, docs, licensing, or Pro code.

## Public Package Map

- v1 compatibility components: `src/charts/*`
- v2 React Native components: `packages/react-native/src/charts/*`
- v2 public exports: `packages/react-native/src/index.ts`
- renderer-agnostic logic: `packages/core/src/*`
- SVG renderer: `packages/svg-renderer/src/*`
- docs markdown: `docs/charts/*`, `docs/getting-started/*`, `docs/migration/*`
- docs preview shell: `apps/site/src/previews/*`

## Pro Package Map

- Pro exports: `../chart-kit-pro/src/react-native/index.ts`
- Pro charts: `../chart-kit-pro/src/react-native/charts/*`
- Skia renderer: `../chart-kit-pro/packages/skia-renderer/src/*`
- Pro preview app: `../chart-kit-pro/apps/pro-preview/src/*`

## Boundaries

- `@chart-kit/core` must not import React, React Native, SVG, Pro, or Skia.
- `@chart-kit/svg-renderer` owns SVG primitives, text measurement, layers, defs, hit regions, and renderer capabilities.
- `react-native-chart-kit/v2` owns public free React Native chart components.
- The public package must not depend on `@chart-kit/pro` or `@chart-kit/skia-renderer`.
- Pro can depend on public packages.
- Skia stays optional and commercial in the Pro repo.

## Edit Flow

1. Identify the chart and package surface.
2. Inspect existing component types and nearby tests.
3. Put chart math in `packages/core` when it is renderer-agnostic.
4. Put platform rendering and interaction wiring in `packages/react-native`.
5. Add or update docs/examples only after the API is typed.
6. Add tests near the behavior:
   - core math: `packages/core/test`
   - React Native chart helpers: `packages/react-native/test`
   - renderer primitives: `packages/svg-renderer/test`
   - Pro package: `../chart-kit-pro/test`
   - Pro preview stories: `../chart-kit-pro/apps/pro-preview/src/stories`

## Commands

Public focused checks:

```sh
npm run typecheck
npm run test
npm run surface:check
npm run docs:build
```

Public package checks:

```sh
npm run core:typecheck
npm run svg:typecheck
npm run rn:typecheck
npm run pack:check
```

Pro focused checks:

```sh
npm run typecheck:package
npm run preview:typecheck
npm run build
```

Pro preview checks:

```sh
npm run preview
npm run test:visual
```

## Do Not

- Do not preserve v1 layout bugs as new v2 defaults.
- Do not add license checks to free components.
- Do not add network calls during render.
- Do not put Pro stubs back into public docs previews.
- Do not silently change public exports without a surface check.
