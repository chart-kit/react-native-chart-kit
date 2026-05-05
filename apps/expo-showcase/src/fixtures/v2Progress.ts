export type ActivityProgress = {
  metric: string;
  progress: number;
};

export const activityProgress: ActivityProgress[] = [
  { metric: "Move", progress: 0.72 },
  { metric: "Exercise", progress: 0.48 },
  { metric: "Stand", progress: 0.9 }
];

export const onboardingProgress = 0.64;
