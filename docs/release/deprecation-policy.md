# Deprecation Policy

Status on May 10, 2026: proposed for H6 approval.

This policy applies to the Chart Kit v2 product generation published through
`react-native-chart-kit` and `@chart-kit/react-native`.

## Compatibility Promise

Chart Kit v2 supports the common v1 API surface and data shapes, but not
undocumented internals or old layout bugs.

Supported continuity path:

- existing package name: `react-native-chart-kit`
- common legacy component names:
  - `LineChart`
  - `BarChart`
  - `StackedBarChart`
  - `PieChart`
  - `ProgressChart`
  - `ContributionGraph`
- common legacy data shapes documented in the migration guide
- common chart config colors, labels, and display props where they map cleanly

Modern path for new adopters:

- `@chart-kit/react-native`
- modern typed props, themes, composition, interactions, and renderer options

## Deprecation Levels

Level A: supported.

- Common legacy data shapes and component names remain supported.
- Behavior may be improved when the old behavior was visibly broken.
- No warning is required when the mapping is direct and stable.

Level B: supported with changed behavior or migration guidance.

- Legacy props that map imperfectly may emit development warnings.
- Layout differences should prefer correct mobile behavior by default.
- Legacy-like behavior should be explicit through documented compatibility props
  where those props exist.

Level C: not guaranteed.

- undocumented internals
- deep imports into implementation files
- exact SVG node order
- pixel-perfect preservation of old clipping, spacing, or label bugs
- app code depending on private layout calculations

## Warning Policy

Development warnings are appropriate when:

- invalid data is normalized or dropped
- a legacy prop maps to a materially different v2 behavior
- an old prop name has a documented modern replacement
- a compatibility escape hatch is being used and should not be treated as the
  long-term API

Warnings should be:

- dev-only where practical
- actionable
- stable enough to document
- covered by tests when tied to public behavior

Warnings should not be noisy for direct Level A compatibility paths.

## Removal Policy

Do not remove a documented compatibility behavior during the Developer Preview
line unless the behavior is clearly unsafe or broken.

After stable release:

- removals require a major version unless the API was explicitly labeled
  preview, experimental, or Pro-candidate
- warnings should ship before removal when possible
- migration docs should be updated in the same change as any removal

Preview-only APIs may change faster, but must stay labeled as preview in docs,
showcase copy, and release notes.

## Documentation Requirements

Before H6 can be approved, docs must clearly identify:

- the compatibility package path
- the modern package path
- v1 migration guide
- prop mapping
- known behavior changes
- preview/Pro-candidate APIs
- known unsupported internals

Current supporting docs:

- [From v1 migration guide](../migration/from-v1.md)
- [Prop mapping](../migration/prop-mapping.md)
- [Compatibility matrix draft](../internal/compatibility-matrix-draft.md)
- [Known issues](known-issues.md)
