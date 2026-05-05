import { readFile } from "node:fs/promises";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

describe("@chart-kit/react-native/pro-preview surface", () => {
  it("barrels the current Pro-candidate preview components and helpers", async () => {
    const source = await readFile(
      path.join(import.meta.dirname, "../src/proPreview.ts"),
      "utf8"
    );

    for (const exportName of [
      "BarChart",
      "CandlestickChart",
      "ChartSelectionProvider",
      "CombinedChart",
      "DonutChart",
      "LineChart",
      "getCandlestickChartAccessibilitySummary",
      "getCandlestickChartDataTable",
      "getCandlestickChartFinancialNarrative",
      "getCandlestickEmergencyClosureSessions",
      "getCombinedChartAccessibilitySummary",
      "getCombinedChartDataTable",
      "useChartSelection",
      "useDismissChartSelection"
    ]) {
      expect(source).toContain(exportName);
    }
  });
});
