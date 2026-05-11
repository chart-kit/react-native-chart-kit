# CKV2-014 Combined Chart Notes

Date: May 5, 2026

## Current Slice

Added the first CombinedChart foundation:

- modern `CombinedChart` public export
- shared x-axis with bar plus line rendering
- independent left and right y-axis domains
- grouped, stacked, and 100% stacked bar modes
- line curve, stroke width, and dashed stroke support
- theme-aware plot, grid, axes, bars, lines, and legends
- Expo showcase story for revenue plus margin
- visual regression entry for the combined chart story
- unit coverage for independent domains, explicit domains, right-axis labels, and stacked bars

## Developer Preview Status

Closed for Developer Preview.

Additional work completed after the foundation slice:

- shared tooltip and selection interaction
- external legend toggling for visible series
- negative-value model and visual coverage
- interaction tests for shared tooltip behavior

CombinedChart remains a Pro-candidate preview surface for H6 release claims
until the owner approves the final Pro/free package plan.
