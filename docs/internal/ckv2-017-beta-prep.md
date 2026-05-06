# CKV2-017 Developer Preview Release Preparation

This slice added concrete release-prep artifacts. H5 later approved a Developer Preview from free packages only.

## Changed

- added release checklist
- added known issues list
- added GitHub issue forms for layout, compatibility, and performance bugs
- updated CI so pull requests run tests and docs verification, not only build/typecheck
- made `npm run test:e2e` a real web-showcase Playwright interaction command
- expanded the v7 changelog entry with v2 preview milestones

## Verification

- `npm run docs:build`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run test:visual`
- `npm run benchmark`
- `npm run surface:check`
- `npm run build`

## H5 Decision

- publish free packages only under the `next` npm dist-tag
- disclose native e2e, release workflow, accessibility, performance, and Skia gaps
- keep `@chart-kit/pro` and `@chart-kit/skia-renderer` unpublished
- keep candlestick as Financial Preview
- keep advanced workflows labeled preview or Pro-candidate
