# Compatibility Matrix Draft

Date: April 30, 2026

This is the initial H1 compatibility matrix for the current public API. It is a draft for owner review, not a final compatibility promise.

Compatibility levels:

- Level A: support with same or improved behavior.
- Level B: support with warnings, explicit legacy flags, or changed defaults.
- Level C: not guaranteed.

## Package And Imports

| Surface                                               | Draft Level | Notes                                                                                                        |
| ----------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `LineChart` root export                               | A           | Required continuity surface.                                                                                 |
| `BarChart` root export                                | A           | Required continuity surface.                                                                                 |
| `StackedBarChart` root export                         | A           | Required continuity surface.                                                                                 |
| `PieChart` root export                                | A           | Required continuity surface.                                                                                 |
| `ProgressChart` root export                           | A           | Required continuity surface.                                                                                 |
| `ContributionGraph` root export                       | A           | Required continuity surface.                                                                                 |
| `AbstractChart` root export                           | C           | Exposes implementation internals and conflicts with renderer-agnostic v2 architecture. Consider deprecation. |
| Deep imports into `src/`, `dist/`, or chart internals | C           | Not documented as stable API.                                                                                |
| Exact SVG node order or generated gradient IDs        | C           | Internal implementation detail.                                                                              |

## Shared Data Shapes

| Surface                                                                 | Draft Level                | Notes                                                                                                                             |
| ----------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ChartData.labels`                                                      | A                          | Common line/bar x-label surface.                                                                                                  |
| `ChartData.datasets`                                                    | A                          | Common line/bar series surface.                                                                                                   |
| `Dataset.data: number[]`                                                | A                          | Core current usage.                                                                                                               |
| `Dataset.data` containing `null`                                        | B                          | The spec wants `null` gaps, but current behavior connects/repeats points in some paths. v2 should warn or provide `connectNulls`. |
| `Dataset.color`                                                         | A                          | Preserve for line and legend color mapping.                                                                                       |
| `Dataset.colors`                                                        | A for BarChart, B globally | Preserve for per-bar colors; clarify scope.                                                                                       |
| `Dataset.strokeWidth`                                                   | A                          | Preserve for line series.                                                                                                         |
| `Dataset.withDots`                                                      | A                          | Preserve for line datasets.                                                                                                       |
| `Dataset.withScrollableDot`                                             | B                          | Preserve during migration; likely superseded by v2 interaction/selection props.                                                   |
| `Dataset.key`                                                           | A                          | Preserve as stable render identity where possible.                                                                                |
| `Dataset.strokeDashArray`                                               | A                          | Preserve line dash behavior.                                                                                                      |
| `Dataset.strokeDashOffset`                                              | A                          | Preserve line dash behavior.                                                                                                      |
| Pie item `{ name, population, color, legendFontColor, legendFontSize }` | A                          | Preserve common README shape.                                                                                                     |
| Progress `{ labels, colors, data }`                                     | A                          | Preserve common object shape.                                                                                                     |
| Progress `number[]` shorthand                                           | A                          | Preserve simple usage.                                                                                                            |
| Contribution value `{ date, count }`                                    | A                          | Preserve README shape and `accessor` override.                                                                                    |

## ChartConfig

| Key                             | Draft Level | Notes                                                                                                |
| ------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `backgroundColor`               | A           | Used by examples; preserve or map to theme background.                                               |
| `backgroundGradientFrom`        | A           | Required by current renderer.                                                                        |
| `backgroundGradientFromOpacity` | A           | Preserve.                                                                                            |
| `backgroundGradientTo`          | A           | Required by current renderer.                                                                        |
| `backgroundGradientToOpacity`   | A           | Preserve.                                                                                            |
| `fillShadowGradient`            | B           | Legacy alias. Preserve with dev warning pointing to area fill theme/series style.                    |
| `fillShadowGradientOpacity`     | B           | Legacy alias. Preserve with dev warning.                                                             |
| `fillShadowGradientFrom`        | A           | Preserve for line/area fill migration.                                                               |
| `fillShadowGradientFromOpacity` | A           | Preserve.                                                                                            |
| `fillShadowGradientFromOffset`  | B           | Preserve if SVG renderer supports it; otherwise warn.                                                |
| `fillShadowGradientTo`          | A           | Preserve.                                                                                            |
| `fillShadowGradientToOpacity`   | A           | Preserve.                                                                                            |
| `fillShadowGradientToOffset`    | B           | Preserve if SVG renderer supports it; otherwise warn.                                                |
| `useShadowColorFromDataset`     | B           | Preserve for compat; modern API should prefer per-series fill config.                                |
| `color`                         | A           | Central legacy color callback.                                                                       |
| `labelColor`                    | A           | Preserve for axis/legend labels.                                                                     |
| `strokeWidth`                   | A           | Preserve as default series stroke width.                                                             |
| `barPercentage`                 | A           | Preserve for bars and stacked bars.                                                                  |
| `barRadius`                     | A           | Preserve for bars and stacked bars.                                                                  |
| `propsForTopLabels`             | B           | SVG-specific escape hatch; preserve in SVG compat but not renderer-agnostic API.                     |
| `propsForBackgroundLines`       | B           | SVG-specific escape hatch; preserve in SVG compat.                                                   |
| `propsForLabels`                | B           | SVG-specific escape hatch; preserve in SVG compat.                                                   |
| `propsForVerticalLabels`        | B           | SVG-specific escape hatch; preserve in SVG compat.                                                   |
| `propsForHorizontalLabels`      | B           | SVG-specific escape hatch; preserve in SVG compat.                                                   |
| `propsForDots`                  | B           | SVG-specific escape hatch; preserve in SVG compat.                                                   |
| `decimalPlaces`                 | A           | Preserve for legacy formatted labels.                                                                |
| `style`                         | B           | Legacy chartConfig style usage exists for ContributionGraph border radius. Prefer component `style`. |
| `linejoinType`                  | A           | Preserve for line SVG renderer.                                                                      |
| `scrollableDot*` keys           | B           | Preserve for migration; supersede with tooltip/crosshair/selection API.                              |
| `scrollableInfo*` keys          | B           | Preserve for migration; supersede with tooltip/crosshair/selection API.                              |

## AbstractChart Props

| Prop                | Draft Level | Notes                                                                                  |
| ------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `fromZero`          | A           | Preserve and map to `includeZero` domain behavior.                                     |
| `fromNumber`        | B           | Preserve initially; map to explicit domain min/max if possible.                        |
| `chartConfig`       | A           | Preserve in compatibility components.                                                  |
| `yAxisLabel`        | A           | Preserve.                                                                              |
| `yAxisSuffix`       | A           | Preserve.                                                                              |
| `yLabelsOffset`     | B           | Preserve behind legacy axis positioning behavior.                                      |
| `yAxisInterval`     | B           | Preserve current meaning for legacy grids; modern API should use tick/interval config. |
| `xAxisLabel`        | A           | Preserve.                                                                              |
| `xLabelsOffset`     | B           | Preserve behind legacy axis positioning behavior.                                      |
| `hidePointsAtIndex` | B           | Preserve for LineChart; modern API should prefer per-point styling/visibility.         |

## LineChart Props

| Prop                        | Draft Level | Notes                                                                                  |
| --------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `data`                      | A           | Preserve legacy shape.                                                                 |
| `width`                     | A           | Preserve.                                                                              |
| `height`                    | A           | Preserve.                                                                              |
| `withDots`                  | A           | Preserve.                                                                              |
| `withShadow`                | A           | Preserve, but rendering may improve.                                                   |
| `withScrollableDot`         | B           | Preserve for migration; modern API should use interaction props.                       |
| `withInnerLines`            | A           | Preserve.                                                                              |
| `withOuterLines`            | A           | Preserve.                                                                              |
| `withVerticalLines`         | A           | Preserve.                                                                              |
| `withHorizontalLines`       | A           | Preserve.                                                                              |
| `withVerticalLabels`        | A           | Preserve.                                                                              |
| `withHorizontalLabels`      | A           | Preserve.                                                                              |
| `transparent`               | A           | Preserve.                                                                              |
| `decorator`                 | B           | Preserve in SVG compat; renderer-agnostic API needs a different extension point.       |
| `onDataPointClick`          | A           | Preserve and map to v2 select events.                                                  |
| `style`                     | A           | Preserve.                                                                              |
| `bezier`                    | A           | Preserve; exact curve may differ and should be documented.                             |
| `getDotColor`               | A           | Preserve.                                                                              |
| `renderDotContent`          | B           | Preserve in SVG compat; renderer-agnostic API needs a different custom point renderer. |
| `horizontalLabelRotation`   | B           | Preserve but prefer smart label strategy.                                              |
| `verticalLabelRotation`     | B           | Preserve but prefer smart label strategy.                                              |
| `formatYLabel`              | A           | Preserve.                                                                              |
| `formatXLabel`              | A           | Preserve.                                                                              |
| `getDotProps`               | B           | SVG-specific; preserve in SVG compat.                                                  |
| `segments`                  | A           | Preserve as tick count equivalent.                                                     |
| Exact null-connect behavior | C           | v2 should default to gaps for `null` per spec, not preserve old point repetition bugs. |

## BarChart Props

| Prop                         | Draft Level | Notes                                                                                   |
| ---------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `data`                       | A           | Preserve.                                                                               |
| `width`                      | A           | Preserve.                                                                               |
| `height`                     | A           | Preserve.                                                                               |
| `fromZero`                   | A           | Preserve.                                                                               |
| `withInnerLines`             | A           | Preserve.                                                                               |
| `yAxisLabel`                 | A           | Preserve.                                                                               |
| `yAxisSuffix`                | A           | Preserve.                                                                               |
| `chartConfig`                | A           | Preserve.                                                                               |
| `style`                      | A           | Preserve.                                                                               |
| `horizontalLabelRotation`    | B           | Preserve but prefer smart label strategy.                                               |
| `verticalLabelRotation`      | B           | Preserve but prefer smart label strategy.                                               |
| `withVerticalLabels`         | A           | Preserve.                                                                               |
| `withHorizontalLabels`       | A           | Preserve.                                                                               |
| `segments`                   | A           | Preserve as tick count equivalent.                                                      |
| `showBarTops`                | A           | Preserve.                                                                               |
| `showValuesOnTopOfBars`      | A           | Preserve.                                                                               |
| `withCustomBarColorFromData` | A           | Preserve for per-bar colors.                                                            |
| `flatColor`                  | A           | Preserve for custom bar colors.                                                         |
| Only first dataset renders   | B           | Preserve under compatibility mode; modern API should support grouped/multi-series bars. |

## StackedBarChart Props

| Prop                             | Draft Level | Notes                                                                               |
| -------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `data`                           | A           | Preserve current stacked data shape.                                                |
| `width`                          | A           | Preserve.                                                                           |
| `height`                         | A           | Preserve.                                                                           |
| `chartConfig`                    | A           | Preserve.                                                                           |
| `hideLegend`                     | A           | Preserve.                                                                           |
| `style`                          | A           | Preserve.                                                                           |
| `barPercentage` component prop   | B           | Type exists, but implementation uses `chartConfig.barPercentage`; clarify behavior. |
| `decimalPlaces`                  | A           | Preserve.                                                                           |
| `withVerticalLabels`             | A           | Preserve.                                                                           |
| `withHorizontalLabels`           | A           | Preserve.                                                                           |
| `segments`                       | A           | Preserve.                                                                           |
| `percentile`                     | A           | Preserve.                                                                           |
| `verticalLabelsHeightPercentage` | B           | Preserve during migration; modern layout should auto-reserve label space.           |
| `formatYLabel`                   | A           | Preserve.                                                                           |
| Fixed legend geometry            | C           | Do not preserve as a bug; replace with explicit legacy layout if needed.            |

## PieChart Props

| Prop                         | Draft Level | Notes                                                              |
| ---------------------------- | ----------- | ------------------------------------------------------------------ |
| `data`                       | A           | Preserve common item shape.                                        |
| `width`                      | A           | Preserve.                                                          |
| `height`                     | A           | Preserve.                                                          |
| `accessor`                   | A           | Preserve.                                                          |
| `backgroundColor`            | A           | Preserve.                                                          |
| `bgColor` README alias       | B           | Consider supporting alias with warning because README mentions it. |
| `paddingLeft`                | B           | Preserve for compat; modern API should use layout/legend config.   |
| `center`                     | B           | Preserve for compat; modern API should use layout config.          |
| `absolute`                   | A           | Preserve.                                                          |
| `hasLegend`                  | A           | Preserve.                                                          |
| `style`                      | A           | Preserve.                                                          |
| `avoidFalseZero`             | A           | Preserve.                                                          |
| Fixed right legend placement | C           | Do not preserve as default v2 behavior.                            |

## ProgressChart Props

| Prop                         | Draft Level | Notes                                                                       |
| ---------------------------- | ----------- | --------------------------------------------------------------------------- |
| `data` object shape          | A           | Preserve.                                                                   |
| `data` array shorthand       | A           | Preserve.                                                                   |
| `width`                      | A           | Preserve.                                                                   |
| `height`                     | A           | Preserve.                                                                   |
| `center`                     | B           | Type exists but current implementation does not use it directly.            |
| `absolute`                   | C           | Type exists but behavior is not implemented for progress.                   |
| `hasLegend`                  | C           | Type exists but current prop is `hideLegend`.                               |
| `style`                      | A           | Preserve.                                                                   |
| `chartConfig`                | A           | Preserve.                                                                   |
| `hideLegend`                 | A           | Preserve.                                                                   |
| `strokeWidth`                | A           | Preserve.                                                                   |
| `radius`                     | A           | Preserve.                                                                   |
| `withCustomBarColorFromData` | A           | Preserve.                                                                   |
| Out-of-range progress values | B           | Support with clamp or dev warning; do not silently produce broken geometry. |

## ContributionGraph Props

| Prop                           | Draft Level | Notes                                                                                |
| ------------------------------ | ----------- | ------------------------------------------------------------------------------------ |
| `values`                       | A           | Preserve.                                                                            |
| `endDate`                      | A           | Preserve.                                                                            |
| `numDays`                      | A           | Preserve.                                                                            |
| `width`                        | A           | Preserve.                                                                            |
| `height`                       | A           | Preserve.                                                                            |
| `gutterSize`                   | A           | Preserve.                                                                            |
| `squareSize`                   | A           | Preserve.                                                                            |
| `horizontal`                   | A           | Preserve.                                                                            |
| `showMonthLabels`              | A           | Preserve.                                                                            |
| `showOutOfRangeDays`           | A           | Preserve.                                                                            |
| `accessor`                     | A           | Preserve.                                                                            |
| `getMonthLabel`                | A           | Preserve.                                                                            |
| `onDayPress`                   | A           | Preserve.                                                                            |
| `classForValue`                | C           | Current implementation does not use it meaningfully.                                 |
| `style`                        | A           | Preserve.                                                                            |
| `titleForValue`                | A           | Preserve.                                                                            |
| `tooltipDataAttrs`             | B           | SVG/web-specific; preserve for compat but design a native tooltip API separately.    |
| Existing date-to-cell behavior | B           | Preserve fixtures, but add timezone/leap-year tests before promising exact behavior. |

## Initial Compatibility Test Fixture Priorities

Add fixtures in this order:

1. README `LineChart` example with `bezier`, labels, suffix, dots, and style radius.
2. Multi-series `LineChart` with legend, per-dataset colors, and different stroke widths.
3. `LineChart` with `null` values to document the migration from old behavior to v2 gap behavior.
4. README `BarChart` example with rotated labels and `showValuesOnTopOfBars`.
5. `BarChart` with custom per-bar colors through `Dataset.colors`.
6. README `StackedBarChart` example.
7. README `PieChart` example with `absolute` and `avoidFalseZero`.
8. `ProgressChart` object data with labels and array shorthand.
9. README `ContributionGraph` example plus an `onDayPress` fixture.

## Owner Decisions Needed For H1

1. Should current root component names default to modern v2 behavior or legacy-compatible behavior?
2. Should `compatibility="v1"` exist on every legacy component?
3. Should `AbstractChart` remain exported in v2, move to a legacy namespace, or be deprecated?
4. Should SVG-specific escape hatches such as `propsForDots` and `propsForLabels` be supported only by compatibility components?
5. Should old `null` line behavior be classified as a compatibility bug with `connectNulls`, or preserved behind a legacy flag?
