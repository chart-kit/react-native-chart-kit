# CKV2-016 Docs, Recipes, And Migration Guide

This slice starts the public adoption documentation layer on top of the existing chart reference docs.

## Changed

- added docs navigation in `docs/README.md`
- added installation and first-chart guidance
- added v1 migration guide and public prop mapping
- added scenario-based production recipes
- added troubleshooting guide for sizing, Expo Go, gestures, labels, tooltips, themes, visuals, and compatibility
- added representative type-checked docs examples in `packages/react-native/test/docs-examples.typecheck.tsx`

## Verification

- `npm run docs:build`
- `npm run typecheck`
- `npm run rn:typecheck`
- markdown file line-count review

## Limitations

- Representative docs examples are type-checked, but markdown fences are not yet automatically extracted and compiled as standalone docs examples.
- Final package names remain a beta gate. The docs call out the current private v2 workspace package and avoid presenting the public import path as finalized.
