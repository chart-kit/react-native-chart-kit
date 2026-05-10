# CKV2-016 Docs, Recipes, And Migration Guide

This slice starts the public adoption documentation layer on top of the existing chart reference docs.

## Changed

- added docs navigation in `docs/README.md`
- added installation and first-chart guidance
- added v1 migration guide and public prop mapping
- added conservative `chartkit-codemod v1-to-v2` migration helper
- added scenario-based production recipes
- added troubleshooting guide for sizing, Expo Go, gestures, labels, tooltips, themes, visuals, and compatibility
- added representative type-checked docs examples in `packages/react-native/test/docs-examples.typecheck.tsx`
- added markdown fence extraction and typechecking for public TS/TSX docs examples in `npm run docs:build`

## Verification

- `npm run docs:build`
- `npm run typecheck`
- `npm run rn:typecheck`
- markdown file line-count review

## Limitations

- Internal audit snippets are syntax-checked as markdown fences, but only public docs examples are extracted and type-checked as standalone examples.
- Final package names remain a release gate. The docs call out the current private v2 workspace package and avoid presenting the public import path as finalized.
