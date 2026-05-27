import type { ShowcaseMode } from "./stories/storyPrimitives";

export const publicChartMode: ShowcaseMode = {
  id: "preview",
  title: "Charts",
  pages: [
    {
      id: "line-charts",
      title: "Line Charts",
      description:
        "Free baseline line and area charts with interaction, viewport, marker, tooltip, and theme workflows.",
      storyGroups: [
        {
          id: "line-showpieces",
          title: "Showpieces",
          description:
            "Polished motion, range selection, revenue, and zoom/pan examples for the public v2 surface.",
          storyIds: [
            "v2-line-animation",
            "v2-range-selector",
            "v2-revenue-card",
            "v2-viewport-zoom-pan"
          ]
        },
        {
          id: "line-interaction",
          title: "Interaction Preview",
          description:
            "Selection, tooltip, crosshair, scrolling, and multi-series inspection behavior.",
          storyIds: [
            "v2-selected-tooltip",
            "v2-scrub",
            "v2-while-active",
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
            "v2-null-gaps",
            "v2-basic"
          ]
        }
      ]
    },
    {
      id: "bar-charts",
      title: "Bar Charts",
      description:
        "Modern bar workflows across grouped, selectable, scrollable, horizontal, negative, and stacked percentage examples.",
      storyGroups: [
        {
          id: "bar-showpieces",
          title: "Showpieces",
          description:
            "Primary bar-chart demos for acquisition, selection, grouped animation, and ranked horizontal comparisons.",
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
            "Long datasets, selection, negative values, and percentage composition examples.",
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
      id: "pie-donut",
      title: "Pie & Donut",
      description:
        "Free baseline slice charts plus advanced donut, legend, and active-slice previews.",
      storyGroups: [
        {
          id: "pie-showpieces",
          title: "Showpieces",
          description:
            "Modern pie and donut previews built on renderer-agnostic arc geometry.",
          storyIds: [
            "v2-pie-acquisition",
            "v2-pie-external-labels",
            "v2-pie-selection",
            "v2-donut-revenue",
            "v2-donut-selection",
            "v2-donut-custom-legend"
          ]
        }
      ]
    },
    {
      id: "progress",
      title: "Progress",
      description:
        "Free baseline progress rings for health, onboarding, completion, and goal tracking surfaces.",
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
        "Free baseline contribution heatmaps plus future advanced calendar workflow candidates.",
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
