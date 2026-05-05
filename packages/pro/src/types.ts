export type ChartKitProFeatureStatus = "planned" | "preview" | "available";

export type ChartKitProFeatureCategory =
  | "accessibility"
  | "charts"
  | "export"
  | "finance"
  | "interaction"
  | "layout"
  | "performance"
  | "renderer"
  | "theming"
  | "templates";

export type ChartKitProFeature = {
  category: ChartKitProFeatureCategory;
  commercialRationale: string;
  description: string;
  freeGuardrail: string;
  id: string;
  includes: readonly string[];
  status: ChartKitProFeatureStatus;
};

export type ChartKitProFeatureRegistry = {
  features: readonly ChartKitProFeature[];
  packageName: "@chart-kit/pro";
  status: "preview";
};
