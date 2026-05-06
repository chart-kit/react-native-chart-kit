# Skia Local Baseline Evidence

Date: 2026-05-06
Commit: `3272e3c`
Build surface: local repository checks only

This artifact records the local Skia renderer baseline required before native Skia QA. It is suitable only for `partial` Skia matrix evidence. It does not prove native Skia installation, native renderer parity, native text/gradient/clipping behavior, or native release-build performance.

## Commands

```sh
npm run skia:typecheck
npm run skia:parity
npm run boundaries:check
npm run pack:check
```

## Results

- `npm run skia:typecheck`: passed. TypeScript checked `packages/skia-renderer/tsconfig.json` and `packages/skia-renderer/tsconfig.test.json`.
- `npm run skia:parity`: passed. Vitest reported 8 test files and 29 tests passing for the Skia primitive tests plus LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, CombinedChart, and CandlestickChart renderer-contract tests.
- `npm run boundaries:check`: passed. The verifier reported the core package is renderer agnostic, free runtime packages do not import Pro or Skia runtime code, Skia remains an injected optional peer, and the Pro preview package has no activation code or runtime dependencies.
- `npm run pack:check`: passed. The package dry-run verifier checked 6 packages.

## Scope

Covered by this local baseline:

- Skia preview package type surface
- injected primitive adapter contract
- local renderer-contract parity for free chart families
- local renderer-contract parity for Pro-preview combined and candlestick surfaces
- package boundary and optional peer dependency checks
- package pack dry-run

Not covered by this local baseline:

- iOS or Android install of `@shopify/react-native-skia`
- native release-build rendering with Skia primitives
- native text, gradient, clipping, tooltip, legend, or selection visual parity
- native SVG-vs-Skia performance comparison
- physical-device or simulator/emulator screenshot review
