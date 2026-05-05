# CKV2-016 Docs, Recipes, And Migration Guide

This slice starts the public adoption documentation layer on top of the existing chart reference docs.

## Changed

- added docs navigation in `docs/README.md`
- added installation and first-chart guidance
- added v1 migration guide and public prop mapping
- added scenario-based production recipes
- added troubleshooting guide for sizing, Expo Go, gestures, labels, tooltips, themes, visuals, and compatibility

## Verification

- `npm run docs:build`
- `npm run typecheck`
- markdown file line-count review

## Limitations

- Code snippets are markdown examples validated for fenced-code structure and local links, but they are not yet compiled as standalone docs examples.
- Final package names remain a beta gate. The docs call out the current private v2 workspace package and avoid presenting the public import path as finalized.
