import { describe, expect, it } from "vitest";

import {
  getInterpolatedLineChartGeometries,
  resolveLineChartViewportAnimationConfig
} from "../src/charts/line/viewportAnimation";

type TestGeometryOptions = Parameters<
  typeof getInterpolatedLineChartGeometries<Record<string, unknown>>
>[0];
type TestGeometry = TestGeometryOptions["from"][number];

const makePoint = ({
  dataIndex,
  x,
  y
}: {
  dataIndex: number;
  x: number;
  y: number;
}) => ({
  dataIndex,
  defined: true,
  index: dataIndex,
  seriesKey: "portfolio",
  value: y,
  x,
  xValue: dataIndex,
  y
});

const makeGeometry = (
  points: Array<ReturnType<typeof makePoint>>
): TestGeometry =>
  ({
    geometry: {
      key: "portfolio",
      label: "Portfolio",
      points,
      line: { path: "", segments: [] }
    },
    style: {},
    viewportAnimation: {
      areaBaselineY: undefined,
      connectNulls: false,
      curve: "linear"
    }
  }) as unknown as TestGeometry;

describe("LineChart viewport animation helpers", () => {
  it("keeps viewport geometry animation opt-in", () => {
    expect(resolveLineChartViewportAnimationConfig()).toEqual({
      enabled: false,
      duration: 140
    });
    expect(resolveLineChartViewportAnimationConfig(true)).toEqual({
      enabled: true,
      duration: 140
    });
    expect(
      resolveLineChartViewportAnimationConfig({
        duration: 80,
        enabled: false
      })
    ).toEqual({
      enabled: false,
      duration: 80
    });
  });

  it("interpolates shared line points and rebuilds the path", () => {
    const [geometry] = getInterpolatedLineChartGeometries({
      from: [
        makeGeometry([
          makePoint({ dataIndex: 1, x: 10, y: 100 }),
          makePoint({ dataIndex: 2, x: 20, y: 80 })
        ])
      ],
      progress: 0.5,
      to: [
        makeGeometry([
          makePoint({ dataIndex: 1, x: 20, y: 60 }),
          makePoint({ dataIndex: 2, x: 40, y: 20 })
        ])
      ]
    });

    expect(geometry?.geometry.points.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 15, y: 80 },
      { x: 30, y: 50 }
    ]);
    expect(geometry?.geometry.line.path).toBe("M 15 80 L 30 50");
  });
});
