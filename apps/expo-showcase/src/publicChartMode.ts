import type { ShowcaseMode } from "./stories/storyPrimitives";

export const publicChartMode: ShowcaseMode = {
  id: "preview",
  title: "Charts",
  pages: [
    {
      id: "line-charts",
      title: "Line Charts",
      description:
        "Public v2 line and area chart previews with interaction, viewport, marker, tooltip, and theme examples.",
      storyGroups: [
        {
          id: "line-showpieces",
          title: "Showpieces",
          description:
            "The demos that should immediately sell motion, viewport control, and production polish.",
          storyIds: [
            "v2-pro-animation",
            "v2-range-selector",
            "v2-revenue-card",
            "v2-viewport-zoom-pan"
          ]
        },
        {
          id: "line-interaction",
          title: "Interaction",
          description:
            "Selection, tooltip, crosshair, scrolling, and multi-series inspection behavior.",
          storyIds: [
            "v2-selected-tooltip",
            "v2-selection-scope",
            "v2-custom-crosshair",
            "v2-scrollable-stock-comparison",
            "v2-scrollable-price"
          ]
        },
        {
          id: "line-composition",
          title: "Composition",
          description:
            "Area fills, thresholds, dashed lines, marker styles, references, and baseline multi-series charts.",
          storyIds: [
            "v2-area",
            "v2-threshold-colors",
            "v2-dashed-forecast",
            "v2-dot-styles",
            "v2-multi-series",
            "v2-reference-targets",
            "v2-basic"
          ]
        }
      ]
    },
    {
      id: "bar-charts",
      title: "Bar Charts",
      description:
        "Public v2 bar chart previews for grouped, selectable, scrollable, horizontal, negative, and stacked percentage bars.",
      storyGroups: [
        {
          id: "bar-showpieces",
          title: "Showpieces",
          description:
            "The primary bar-chart demos for acquisition, selection, and ranked horizontal comparisons.",
          storyIds: [
            "v2-bar-grouped",
            "v2-bar-selection",
            "v2-bar-animation",
            "v2-bar-grouped-animation",
            "v2-bar-custom-renderer",
            "v2-bar-horizontal"
          ]
        },
        {
          id: "bar-production-cases",
          title: "Production Cases",
          description:
            "Long datasets, negative values, and percentage composition examples.",
          storyIds: [
            "v2-bar-scrollable",
            "v2-bar-scrollable-selection",
            "v2-bar-negative",
            "v2-bar-stacked-percent"
          ]
        }
      ]
    },
    {
      id: "combined-charts",
      title: "Combined Charts",
      description:
        "Public v2 combined chart previews for revenue, margin, and dual-axis business reporting.",
      storyGroups: [
        {
          id: "combined-showpieces",
          title: "Showpieces",
          description:
            "Bar plus line charts with independent axis domains and synchronized labels.",
          storyIds: [
            "v2-combined-revenue-margin",
            "v2-combined-shared-tooltip",
            "v2-combined-legend-toggles",
            "v2-combined-negative-values"
          ]
        }
      ]
    },
    {
      id: "pie-donut",
      title: "Pie & Donut",
      description:
        "Public v2 slice charts for acquisition share, revenue mix, legends, and center labels.",
      storyGroups: [
        {
          id: "pie-showpieces",
          title: "Showpieces",
          description:
            "Modern pie and donut previews built on renderer-agnostic arc geometry.",
          storyIds: [
            "v2-pie-acquisition",
            "v2-pie-external-labels",
            "v2-donut-revenue",
            "v2-donut-selection",
            "v2-donut-custom-legend"
          ]
        }
      ]
    },
    {
      id: "financial-charts",
      title: "Financial Charts",
      description:
        "Public v2 financial chart previews for OHLC price action, scrolling, and range-selector workflows.",
      storyGroups: [
        {
          id: "financial-showpieces",
          title: "Showpieces",
          description:
            "Candlestick chart foundation for stock and trading interfaces.",
          storyIds: ["v2-candlestick-price-action", "v2-candlestick-scrollable"]
        }
      ]
    },
    {
      id: "progress",
      title: "Progress",
      description:
        "Public v2 progress rings for health, onboarding, completion, and goal tracking surfaces.",
      storyGroups: [
        {
          id: "progress-showpieces",
          title: "Showpieces",
          description:
            "Modern concentric progress rings built on renderer-agnostic progress geometry.",
          storyIds: [
            "v2-progress-activity",
            "v2-progress-single",
            "v2-progress-zero-missing"
          ]
        }
      ]
    },
    {
      id: "heatmaps",
      title: "Heatmaps",
      description:
        "Public v2 contribution heatmap previews for product usage and activity calendars.",
      storyGroups: [
        {
          id: "heatmap-showpieces",
          title: "Showpieces",
          description:
            "Calendar-style heatmaps with stable date mapping and theme-aware density.",
          storyIds: ["v2-contribution-usage", "v2-contribution-empty"]
        }
      ]
    }
  ]
};
