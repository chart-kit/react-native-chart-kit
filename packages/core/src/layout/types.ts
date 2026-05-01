export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Size = {
  width: number;
  height: number;
};

export type ChartBoxes = {
  outer: Rect;
  plot: Rect;
  padding: Padding;
};

export type LabelBox = Rect & {
  id: string;
  text?: string;
};

export type LabelStrategy = "show" | "skip" | "rotate" | "stagger" | "hide";

export type LabelCollisionResult = {
  strategy: LabelStrategy;
  visibleIndexes: number[];
  interval: number;
  rotation: number;
  rows: number;
};

export type LabelCollisionOptions = {
  labels: LabelBox[];
  availableWidth: number;
  allowRotate?: boolean;
  allowStagger?: boolean;
  minGap?: number;
  maxRotation?: number;
};

export type LegendItem = {
  id: string;
  label: string;
  markerSize?: number;
  labelWidth: number;
  labelHeight: number;
};

export type LegendPosition = "top" | "bottom" | "left" | "right";

export type LegendLayoutOptions = {
  items: LegendItem[];
  position?: LegendPosition;
  maxWidth: number;
  itemGap?: number;
  rowGap?: number;
  padding?: number;
};

export type LegendLayoutItem = LegendItem & Rect;

export type LegendLayout = {
  position: LegendPosition;
  width: number;
  height: number;
  items: LegendLayoutItem[];
};

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipPlacementOptions = {
  anchor: { x: number; y: number };
  tooltip: Size;
  bounds: Rect;
  preferredPlacement?: TooltipPlacement;
  gap?: number;
  fingerRadius?: number;
};

export type TooltipPlacementResult = {
  placement: TooltipPlacement;
  rect: Rect;
};

export type LayoutDebugRect = Rect & {
  id: string;
  kind: "outer" | "plot" | "axis" | "label" | "legend" | "tooltip";
  text?: string;
};

export type LayoutDebugModel = {
  rects: LayoutDebugRect[];
};

export type BuildLayoutDebugModelOptions = {
  boxes: ChartBoxes;
  labels?: LabelBox[];
  legend?: LegendLayout;
  tooltip?: TooltipPlacementResult;
};

export type AutoPaddingOptions = {
  base?: Partial<Padding>;
  leftLabels?: Size[];
  rightLabels?: Size[];
  topLabels?: Size[];
  bottomLabels?: Size[];
  legend?: Size & { position: LegendPosition };
  gap?: number;
};
