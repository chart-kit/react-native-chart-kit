---
title: Export APIs
description: Export Chart Kit Pro charts as PNG or SVG for reports, sharing, and background generation.
---

# Export APIs

Chart Kit Pro exports chart images for report screens, share sheets, generated
PDFs, email attachments, support evidence, and background jobs. Use PNG when the
chart should match the rendered app view. Use SVG when the output should stay
small, editable, or server-generated.

This workflow is available in Chart Kit Pro. Install it once from
[Installation](pro-installation.md).

## Use cases

| Use case                   | Recommended path                                           |
| -------------------------- | ---------------------------------------------------------- |
| Share from a mobile screen | Capture the mounted chart as PNG, then share it.           |
| Save a report card         | Capture the exact rendered view as PNG.                    |
| Generate PDF content       | Produce SVG or convert SVG to PNG in your PDF job.         |
| Background jobs            | Use headless SVG generation from data and options.         |
| Support evidence           | Export a deterministic chart image with the data snapshot. |

## Mounted PNG snapshot

Use a capture adapter for the rendered React Native view. The example below uses
`react-native-view-shot`, but the export controller accepts any adapter with the
same shape.

```jsx
import { useMemo, useRef } from "react";
import ViewShot, { captureRef } from "react-native-view-shot";
import { CombinedChart, createChartExportController } from "@chart-kit/pro";

const data = [
  { month: "Jan", revenue: 118, margin: 18 },
  { month: "Feb", revenue: 146, margin: 21 },
  { month: "Mar", revenue: 182, margin: 23 },
  { month: "Apr", revenue: 208, margin: 26 },
  { month: "May", revenue: 236, margin: 28 },
  { month: "Jun", revenue: 274, margin: 31 }
];

const money = (value) => `$${Math.round(value)}k`;
const percent = (value) => `${Math.round(value)}%`;

export function ExportableRevenueChart() {
  const chartRef = useRef(null);
  const exportController = useMemo(
    () =>
      createChartExportController({
        captureRef: (target, options) =>
          captureRef(target, {
            format: "png",
            quality: options.quality ?? 1,
            result: options.result,
            width: options.width,
            height: options.height
          })
      }),
    []
  );

  const savePng = async () => {
    const result = await exportController.snapshot({
      fileName: "revenue-margin.png",
      format: "png",
      target: chartRef,
      width: 410,
      height: 300,
      result: "tmpfile"
    });

    console.log(result.uri);
  };

  return (
    <>
      <ViewShot ref={chartRef}>
        <CombinedChart
          data={data}
          xKey="month"
          bars={[{ yKey: "revenue", label: "Revenue" }]}
          lines={[{ yKey: "margin", label: "Margin", curve: "monotone" }]}
          formatLeftYLabel={money}
          formatRightYLabel={percent}
          leftYDomain={[0, "dataMax"]}
          rightYDomain={[0, 40]}
          width={410}
          height={300}
        />
      </ViewShot>

      <Button title="Save PNG" onPress={savePng} />
    </>
  );
}
```

## Share sheet

Capture the chart first, then pass the normalized export result to
`shareChartExport` or a reusable controller.

```jsx
import { shareChartExport } from "@chart-kit/pro";

async function shareReportChart(exportController, chartRef) {
  const result = await exportController.snapshot({
    fileName: "report-chart.png",
    format: "png",
    target: chartRef,
    width: 410,
    height: 300,
    result: "tmpfile"
  });

  await shareChartExport({
    result,
    title: "Revenue and margin",
    message: "Revenue and margin chart"
  });
}
```

## SVG snapshot

Use SVG when the image should stay text-based and portable. Generate the SVG
from the same data and options you pass to `CombinedChart`, then pass that
markup to the snapshot API.

```jsx
import { exportChartSnapshot, renderCombinedChartSvg } from "@chart-kit/pro";

async function exportSvg() {
  const svg = renderCombinedChartSvg({
    data,
    xKey: "month",
    bars: [{ yKey: "revenue", label: "Revenue" }],
    lines: [{ yKey: "margin", label: "Margin", curve: "monotone" }],
    formatLeftYLabel: money,
    formatRightYLabel: percent,
    leftYDomain: [0, "dataMax"],
    rightYDomain: [0, 40],
    width: 410,
    height: 300,
    title: "Revenue and margin"
  });

  const result = await exportChartSnapshot({
    fileName: "revenue-trend.svg",
    format: "svg",
    target: svg,
    width: 410,
    height: 240
  });

  console.log(result.svg);
  console.log(result.dataUri);
}
```

## Headless generation

Headless export does not capture a mounted React Native view. Use it when a
report worker, server route, or background task needs chart output from data and
options.

```jsx
import { exportHeadlessChart, renderCombinedChartSvg } from "@chart-kit/pro";

export async function generateReportSvg() {
  return exportHeadlessChart({
    fileName: "report-chart.svg",
    format: "svg",
    renderSvg: ({ width, height }) =>
      renderCombinedChartSvg({
        data,
        xKey: "month",
        bars: [{ yKey: "revenue", label: "Revenue" }],
        lines: [{ yKey: "margin", label: "Margin", curve: "monotone" }],
        formatLeftYLabel: money,
        formatRightYLabel: percent,
        leftYDomain: [0, "dataMax"],
        rightYDomain: [0, 40],
        width,
        height,
        title: "Revenue and margin"
      }),
    width: 410,
    height: 300
  });
}
```

For headless PNG, pass `format: "png"` plus a `renderPng` adapter that converts
SVG markup to PNG in your environment.
