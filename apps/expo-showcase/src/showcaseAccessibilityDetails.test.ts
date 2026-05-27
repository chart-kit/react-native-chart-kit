import { describe, expect, it, vi } from "vitest";

const { makeDataTable } = vi.hoisted(() => ({
  makeDataTable: () => ({
    columns: [{ key: "value", label: "Value" }],
    rows: [
      {
        dateLabel: "Jan 1",
        formattedClose: "$104",
        formattedHigh: "$108",
        formattedLow: "$98",
        formattedOpen: "$101",
        formattedValue: "Value",
        formattedValues: { value: "Value" },
        index: 0,
        label: "Sample",
        percentageLabel: "50%",
        xLabel: "Sample"
      }
    ]
  })
}));

vi.mock("react-native", () => ({
  Pressable: () => null,
  StyleSheet: { create: (styles: unknown) => styles },
  Text: () => null,
  View: () => null
}));

vi.mock("@chart-kit/svg-renderer", () => {
  const MockPrimitive = () => null;

  return {
    SvgCircle: MockPrimitive,
    SvgLine: MockPrimitive,
    SvgRect: MockPrimitive,
    SvgText: MockPrimitive
  };
});

vi.mock("react-native-chart-kit/v2", () => ({
  BarChart: () => null,
  ContributionGraph: () => null,
  DonutChart: () => null,
  LineChart: () => null,
  PieChart: () => null,
  ProgressChart: () => null,
  ProgressRing: () => null,
  getBarChartDataTable: makeDataTable,
  getContributionGraphDataTable: makeDataTable,
  getLineChartDataTable: makeDataTable,
  getPieChartDataTable: makeDataTable,
  getProgressChartDataTable: makeDataTable,
  useChartKitTheme: () => ({ mode: "light" })
}));

import { publicChartMode } from "./publicChartMode";
import { barOverviewStories } from "./stories/barOverviewStories";
import { contributionOverviewStories } from "./stories/contributionOverviewStories";
import { lineOverviewStories } from "./stories/lineOverviewStories";
import { pieOverviewStories } from "./stories/pieOverviewStories";
import { progressOverviewStories } from "./stories/progressOverviewStories";
import type { ShowcasePage, ShowcaseStory } from "./stories/storyPrimitives";

const pagesRequiringTableFallback = [
  "line-charts",
  "bar-charts",
  "pie-donut",
  "progress",
  "heatmaps"
];

const storiesWithAccessibilityDetails: ShowcaseStory[] = [
  ...lineOverviewStories,
  ...barOverviewStories,
  ...pieOverviewStories,
  ...progressOverviewStories,
  ...contributionOverviewStories
];

const getPageStoryIds = (page: ShowcasePage) =>
  page.storyGroups?.flatMap((group) => group.storyIds) ?? page.storyIds ?? [];

describe("showcase accessibility data details", () => {
  it("keeps a table fallback story on every accessibility QA page", () => {
    for (const pageId of pagesRequiringTableFallback) {
      const page = publicChartMode.pages.find((item) => item.id === pageId);
      expect(
        page,
        `${pageId} should be part of the public chart mode`
      ).toBeDefined();

      if (!page) {
        continue;
      }

      const pageStories = getPageStoryIds(page).map((storyId) =>
        storiesWithAccessibilityDetails.find((story) => story.id === storyId)
      );

      expect(
        pageStories.some((story) => story?.Details !== undefined),
        `${pageId} should expose at least one collapsed data details panel`
      ).toBe(true);
    }
  });
});
