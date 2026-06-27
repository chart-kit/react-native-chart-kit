import { describe, expect, it } from "vitest";

import {
  getScopedChartSelectionClearReason,
  shouldClearScopedChartSelection
} from "../../src/selection/scope";

describe("ChartSelectionProvider scope helpers", () => {
  it("keeps an empty chart untouched", () => {
    expect(
      shouldClearScopedChartSelection({
        activeChartId: "other",
        chartId: "portfolio",
        dismissRevision: 0,
        hasSelection: false,
        lastDismissRevision: 0
      })
    ).toBe(false);
  });

  it("clears a chart when a different chart becomes active", () => {
    expect(
      shouldClearScopedChartSelection({
        activeChartId: "benchmark",
        chartId: "portfolio",
        dismissRevision: 0,
        hasSelection: true,
        lastDismissRevision: 0
      })
    ).toBe(true);
  });

  it("keeps the active chart selected", () => {
    expect(
      shouldClearScopedChartSelection({
        activeChartId: "portfolio",
        chartId: "portfolio",
        dismissRevision: 0,
        hasSelection: true,
        lastDismissRevision: 0
      })
    ).toBe(false);
  });

  it("clears selected charts when the provider dismisses selection", () => {
    expect(
      shouldClearScopedChartSelection({
        activeChartId: undefined,
        chartId: "portfolio",
        dismissRevision: 2,
        hasSelection: true,
        lastDismissRevision: 1
      })
    ).toBe(true);
  });

  it("explains why a scoped selection should clear", () => {
    expect(
      getScopedChartSelectionClearReason({
        activeChartId: "portfolio",
        chartId: "portfolio",
        dismissRevision: 2,
        lastDismissRevision: 1
      })
    ).toBe("programmatic");
    expect(
      getScopedChartSelectionClearReason({
        activeChartId: "benchmark",
        chartId: "portfolio",
        dismissRevision: 1,
        lastDismissRevision: 1
      })
    ).toBe("scopeChange");
    expect(
      getScopedChartSelectionClearReason({
        activeChartId: "portfolio",
        chartId: "portfolio",
        dismissRevision: 1,
        lastDismissRevision: 1
      })
    ).toBeUndefined();
  });
});
