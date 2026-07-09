import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Animated: {
    Value: class {
      addListener() {}
      interpolate() {
        return 0;
      }
    },
    createAnimatedComponent: (component: unknown) => component,
    event: () => () => undefined
  },
  ScrollView: "ScrollView",
  StyleSheet: { absoluteFill: {} },
  TextInput: "TextInput",
  View: "View"
}));

vi.mock("react-native-svg", () => ({
  Circle: "Circle",
  Defs: "Defs",
  G: "G",
  Line: "Line",
  LinearGradient: "LinearGradient",
  Path: "Path",
  Polygon: "Polygon",
  Polyline: "Polyline",
  Rect: "Rect",
  Stop: "Stop",
  Svg: "Svg",
  Text: "Text"
}));

import LineChart, { LineChartProps } from "../../../src/charts/line/LineChart";

const data = {
  labels: [],
  datasets: [{ data: [10, 20, 15, 30, 25, 40] }]
};

const createProps = (decorator?: LineChartProps["decorator"]): LineChartProps =>
  ({
    data,
    width: 400,
    height: 125,
    style: { paddingRight: 10 },
    chartConfig: {
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      color: () => "#2563eb",
      propsForDots: { r: "6" }
    },
    bezier: true,
    transparent: true,
    decorator
  }) as LineChartProps;

describe("legacy LineChart compatibility geometry", () => {
  it("does not reduce the drawing width to reserve dot radius", () => {
    const decorator = vi.fn(() => null);
    const chart = new LineChart(createProps(decorator));

    chart.render();

    expect(decorator).toHaveBeenCalledWith(
      expect.objectContaining({ width: 400, paddingRight: 10 })
    );
  });

  it("passes v6 x positions to dots and custom dot content", () => {
    const renderDotContent = vi.fn<
      NonNullable<LineChartProps["renderDotContent"]>
    >(() => null);
    const chart = new LineChart({
      ...createProps(),
      renderDotContent
    });

    const nodes = chart.renderDots({
      data: data.datasets,
      width: 400,
      height: 125,
      paddingTop: 16,
      paddingRight: 10,
      onDataPointClick: undefined
    });
    const positions = data.datasets[0].data.map(
      (_, index) => (nodes[index * 3] as ReactElement<{ cx: number }>).props.cx
    );

    expect(positions).toEqual([10, 75, 140, 205, 270, 335]);
    expect(renderDotContent.mock.calls.map(([point]) => point.x)).toEqual(
      positions
    );
  });
});
