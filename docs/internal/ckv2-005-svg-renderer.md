# CKV2-005 SVG Renderer Notes

Date: May 1, 2026

## Current Slice

This slice adds the first dedicated SVG renderer package.

Added:

- `@chart-kit/svg-renderer` workspace package
- React Native SVG primitive wrappers
- gradient and clip-path definition helpers
- deterministic text measurement fallback
- stable test ID helper
- renderer factory that exposes a primitive contract
- unit tests for renderer-independent helpers

## Design Choices

The renderer package depends on `react-native-svg`, but the unit tests avoid native runtime imports by testing pure helper modules. Component typechecking covers the wrapper primitives.

Text measurement is deliberately approximate. It gives the layout engine deterministic dimensions before platform-specific measurement exists.

## Follow-Up Work

- Add render smoke tests against the showcase web runtime.
- Integrate renderer primitives into modern chart components.
- Add SVG-specific visual fixtures once modern components consume the renderer.
