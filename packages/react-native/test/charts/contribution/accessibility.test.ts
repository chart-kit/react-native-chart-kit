import { describe, expect, it } from "vitest";

import {
  getContributionGraphAccessibilitySummary,
  getContributionGraphDataTable
} from "../../../src/charts/contribution/accessibility";

describe("ContributionGraph accessibility helpers", () => {
  it("builds rows with formatted dates, values, and raw data", () => {
    const values = [
      { count: 3, date: "2026-04-01" },
      { count: 8, date: "2026-04-03" }
    ];
    const table = getContributionGraphDataTable({
      endDate: "2026-04-03",
      formatDate: (date, index) =>
        `${index}:${date.toISOString().slice(5, 10)}`,
      formatValue: (value) => `${value} commits`,
      numDays: 3,
      values
    });

    expect(table.rows).toHaveLength(3);
    expect(table.rows[0]).toMatchObject({
      dateLabel: "0:04-01",
      formattedValue: "3 commits",
      raw: values[0],
      value: 3
    });
    expect(table.rows[1]).toMatchObject({
      formattedValue: "0 commits",
      value: 0
    });
  });

  it("summarizes active days and extrema", () => {
    expect(
      getContributionGraphAccessibilitySummary({
        endDate: "2026-04-03",
        formatValue: (value) => `${value} commits`,
        numDays: 3,
        values: [
          { count: 0, date: "2026-04-01" },
          { count: 8, date: "2026-04-03" }
        ]
      })
    ).toBe(
      "Contribution graph with 3 days. 1 day with activity. Highest value is 8 commits on 2026-04-03. Lowest value is 0 commits on 2026-04-01."
    );
  });

  it("handles empty ranges", () => {
    expect(
      getContributionGraphAccessibilitySummary({
        endDate: "2026-04-03",
        numDays: 0,
        values: []
      })
    ).toBe("Contribution graph with no days.");
  });
});
