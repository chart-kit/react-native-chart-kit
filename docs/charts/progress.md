---
title: Progress Charts
description: Show circular progress values with configurable labels and accessible output.
---

# Progress Charts

The v2 progress surface supports concentric rings and single-ring completion states. It accepts object rows for the modern API and the legacy Chart Kit progress data shape.

```tsx
import { ProgressChart, ProgressRing } from "react-native-chart-kit/v2";

const data = [
  { metric: "Move", progress: 0.72, color: "#f43f5e" },
  { metric: "Exercise", progress: 0.48, color: "#22c55e" },
  { metric: "Stand", progress: 0.9, color: "#2563eb" }
];

<ProgressChart
  data={data}
  valueKey="progress"
  labelKey="metric"
  colorKey="color"
  width={320}
  height={260}
  preset="health"
  centerLabel={({ average }) => `${Math.round(average * 100)}%`}
/>;

<ProgressRing
  value={0.64}
  label="Workspace setup"
  width={320}
  height={240}
  centerLabel="64%"
/>;
```

::chart-preview{id="progress-rings"}

## Compatibility Shape

The legacy data object still works:

```tsx
<ProgressChart
  data={{
    labels: ["Swim", "Bike", "Run"],
    data: [0.4, 0.6, 0.8],
    colors: ["#2563eb", "#16a34a", "#dc2626"]
  }}
  width={320}
  height={240}
/>
```

::chart-preview{id="progress-single"}

Values outside `0..1` produce normalization warnings in core and are clamped by geometry so the ring never draws broken arcs.

## Zero And Missing Values

Zero and missing rings keep their background tracks and legend rows. Values above `1` are clamped visually while their source value remains available in the model.

```tsx
<ProgressChart
  data={[
    { metric: "Brief approved", progress: 0 },
    { metric: "QA pass", progress: null },
    { metric: "Rollout cap", progress: 1.18 }
  ]}
  valueKey="progress"
  labelKey="metric"
  width={320}
  height={260}
/>
```
