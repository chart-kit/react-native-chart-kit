# H0/H1 Approved Decisions

Date: May 1, 2026

These decisions were approved after the CKV2-000 audit and should guide CKV2-001 through CKV2-006 unless the owner revisits them.

## H0 Repository And Package Strategy

Use a dual-package strategy:

- `react-native-chart-kit` remains the continuity package for existing users.
- `@chart-kit/react-native` is the canonical v2 package for new adopters and the modern API.

Use an incremental monorepo strategy:

- Move toward `packages/core`, `packages/react-native`, `packages/compat-chart-kit`, and app workspaces.
- Do not move the current `src/` implementation in the first scaffolding slice.
- Keep the current package build stable while adding package boundaries in reviewable steps.

Recommended package roles:

- `react-native-chart-kit`: legacy-compatible root component names and migration bridge.
- `@chart-kit/react-native`: clean v2 API, modern docs, and renderer-agnostic public surface.
- `@chart-kit/react-native/compat`: optional explicit compatibility facade for users who need old data shapes inside the scoped package.
- Future Pro package: separate package or clearly isolated exports, with no license checks inside free core rendering.

## H1 Compatibility Strategy

Existing users should have an easy bridge:

- Common legacy imports, data shapes, `chartConfig`, dimensions, labels, and display booleans should keep working.
- Compatibility behavior can warn when a prop maps poorly to v2.
- Old layout bugs should not be preserved as default modern behavior.

New adopters should not need the old API:

- Modern docs should teach object-row data with `xKey`, `yKey`, `series`, `theme`, `preset`, `tooltip`, and interaction props.
- The old `chartConfig` API should live in migration and compatibility docs, not in the primary getting-started path.

Approved compatibility defaults:

- Root legacy component names in `react-native-chart-kit` should be compatibility-first.
- Modern components in `@chart-kit/react-native` should default to v2 behavior.
- Add `compatibility="v1"` where it gives users an explicit escape hatch for old behavior.
- Support SVG-specific escape hatches such as `propsForDots` only in compatibility components.
- Deprecate `AbstractChart`; keep it for one major compatibility cycle if needed, but do not build v2 architecture around inheritance.
- In modern v2, `null` data values mean visible gaps by default.
- Provide `connectNulls` for intentional gap connection.
- Preserve old null handling only behind an explicit legacy flag if compatibility tests prove users need it.

## Immediate Implementation Implications

- CKV2-001 should scaffold commands and docs without moving all source files at once.
- CKV2-002 should start renderer-agnostic data normalization in an isolated core location.
- Compatibility fixtures should be added before changing rendering behavior for existing component names.
- Public docs should separate "new app" usage from "migration from v1" usage.
