export type ActivityProgress = {
  metric: string;
  progress: number;
  color: string;
};

export const activityProgress: ActivityProgress[] = [
  { metric: "Move", progress: 0.72, color: "#f43f5e" },
  { metric: "Exercise", progress: 0.48, color: "#22c55e" },
  { metric: "Stand", progress: 0.9, color: "#2563eb" }
];

export const onboardingProgress = 0.64;
