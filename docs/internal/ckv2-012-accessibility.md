# CKV2-012 Accessibility Baseline Notes

Date: May 4, 2026

## Current Slice

Added reusable accessibility summary and table fallback helpers beyond LineChart:

- BarChart summary and data table helpers
- PieChart and DonutChart summary and data table helpers
- ProgressChart and ProgressRing summary and data table helpers
- ContributionGraph and CalendarHeatmap summary and data table helpers
- component fallback labels wired to the same public summary helpers
- root package exports for all helper types and functions
- unit coverage for grouped bars, pie slices, progress clamping, and contribution empty days

## Remaining Work

- Add screen-reader QA on real iOS and Android devices.
- Add docs recipes for presenting table fallbacks in product screens.
- Add Pro-level configurable narrative summaries once Pro accessibility scope is approved.
