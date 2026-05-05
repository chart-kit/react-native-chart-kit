import { describe, expect, it } from "vitest";

import {
  importsReactNativeChartKit,
  transformV1ToV2Source
} from "./chartkit-codemod.mjs";

describe("chartkit v1-to-v2 codemod", () => {
  it("detects root react-native-chart-kit imports", () => {
    expect(
      importsReactNativeChartKit(
        'import { LineChart } from "react-native-chart-kit";'
      )
    ).toBe(true);
    expect(
      importsReactNativeChartKit(
        'import { LineChart } from "@chart-kit/react-native";'
      )
    ).toBe(false);
  });

  it("adds explicit v1 compatibility to imported legacy chart JSX", () => {
    const result = transformV1ToV2Source(`
import { BarChart, LineChart } from "react-native-chart-kit";

export const Charts = () => (
  <>
    <LineChart
      data={lineData}
      width={320}
      height={180}
      chartConfig={chartConfig}
    />
    <BarChart data={barData} width={320} height={180} chartConfig={chartConfig} />
  </>
);
`);

    expect(result.changed).toBe(true);
    expect(result.source).toContain('<LineChart compatibility="v1"');
    expect(result.source).toContain('<BarChart compatibility="v1"');
  });

  it("preserves existing compatibility props", () => {
    const result = transformV1ToV2Source(`
import { LineChart } from "react-native-chart-kit";

<LineChart compatibility="v1" data={data} width={320} height={180} />;
`);

    expect(result.changed).toBe(false);
    expect(result.source.match(/compatibility="v1"/g)).toHaveLength(1);
  });

  it("does not rewrite modern package examples", () => {
    const source = `
import { LineChart } from "@chart-kit/react-native";

<LineChart data={data} xKey="month" yKey="revenue" width={320} height={180} />;
`;
    const result = transformV1ToV2Source(source);

    expect(result.changed).toBe(false);
    expect(result.source).toBe(source);
  });
});
