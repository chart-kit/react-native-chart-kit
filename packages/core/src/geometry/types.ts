export type LineCurve = "linear" | "monotone" | "step";

export type GeometryPoint<TData = unknown> = {
  index: number;
  x: number;
  y: number;
  defined: boolean;
  value?: number | null;
  raw?: TData;
};

export type GeometrySegment<TPoint extends GeometryPoint = GeometryPoint> = {
  points: TPoint[];
  path: string;
};

export type LinePathModel<TPoint extends GeometryPoint = GeometryPoint> = {
  path: string;
  segments: Array<GeometrySegment<TPoint>>;
};

export type LinePathDecimationStrategy = "min-max";

export type LinePathDecimationConfig = {
  maxPoints: number;
  strategy?: LinePathDecimationStrategy;
};

export type BuildLinePathOptions<TPoint extends GeometryPoint = GeometryPoint> =
  {
    points: TPoint[];
    curve?: LineCurve;
    connectNulls?: boolean;
    decimation?: false | LinePathDecimationConfig | undefined;
  };

export type BuildAreaPathOptions<TPoint extends GeometryPoint = GeometryPoint> =
  BuildLinePathOptions<TPoint> & {
    baselineY: number | ((point: TPoint) => number);
  };
