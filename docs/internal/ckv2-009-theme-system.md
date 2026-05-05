# CKV2-009 Theme System Notes

Date: May 4, 2026

## Current Slice

Added the missing built-in theme presets from the v2 theme roadmap and made spec-style aliases resolve at runtime.

Added:

- `ios` preset
- `material` preset
- `darkFintech` preset
- `dark-fintech` alias for `darkFintech`
- `high-contrast` alias for `highContrast`
- showcase menu exposure for the new presets
- theme docs covering provider-level presets, custom presets, and built-in names
- unit tests for new presets and aliases

## Existing Theme Foundation

Already present before this slice:

- `ChartKitProvider` with `light`, `dark`, and `system` mode support
- built-in `default`, `analytics`, `fintech`, `health`, `minimal`, and `highContrast` presets
- custom preset registration through `createChartPreset()`
- per-chart `preset` and `theme` overrides
- tooltip, typography, grid, axis, background, plot background, text, muted text, and series tokens

## Remaining Work

- Add visual theme gallery screenshots for owner approval if H2 design review needs a dedicated palette pass.
- Consider documenting token mapping for design-system integrations once Pro scope starts.
