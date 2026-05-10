import { describe, expect, it } from "vitest";

import { buildCandlestickChartModel } from "../src/charts/candlestick/model";
import { chartKitTheme } from "./candlestick.fixtures";

describe("CandlestickChart session labels", () => {
  it("lets special closure labels replace generic gap labels", () => {
    const model = buildCandlestickChartModel({
      chartKitTheme,
      closeKey: "close",
      data: [
        {
          day: "2026-09-10",
          open: 100,
          high: 112,
          low: 96,
          close: 108
        },
        {
          day: "2026-09-14",
          open: 108,
          high: 114,
          low: 104,
          close: 111
        }
      ],
      height: 260,
      highKey: "high",
      lowKey: "low",
      openKey: "open",
      sessionGaps: {
        label: true,
        specialSessions: [
          {
            date: "2026-09-11",
            kind: "closure",
            label: "Exchange halt"
          }
        ]
      },
      width: 360,
      xKey: "day"
    });

    expect(model.sessionEvents[0]).toMatchObject({
      kind: "closure",
      label: "Exchange halt"
    });
    expect(model.sessionGaps[0]?.label).toBeUndefined();
  });
});
