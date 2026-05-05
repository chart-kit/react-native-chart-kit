export type ChartKitProFeatureStatus = "planned" | "preview" | "available";

export type ChartKitProFeatureCategory =
  | "accessibility"
  | "export"
  | "finance"
  | "interaction"
  | "performance"
  | "renderer"
  | "theming";

export type ChartKitProFeature = {
  category: ChartKitProFeatureCategory;
  description: string;
  id: string;
  status: ChartKitProFeatureStatus;
};

export type ChartKitProFeatureRegistry = {
  features: readonly ChartKitProFeature[];
  packageName: "@chart-kit/pro";
  status: "preview";
};
