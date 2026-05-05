# CKV2-017 Beta Release Preparation

This slice adds concrete release-prep artifacts without publishing a beta.

## Changed

- added beta release checklist
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

## Remaining H5 Inputs

- final beta package/import path
- whether native e2e beyond the web showcase and native release-build gaps are acceptable for beta
- whether candlestick remains public preview or waits for deeper financial-chart scope
- final free-vs-Pro visibility for animation, range selector, and zoom workflows
