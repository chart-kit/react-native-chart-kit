export type ActivityProgress = {
  metric: string;
  progress: number | null;
};

export const activityProgress: ActivityProgress[] = [
  { metric: "Move", progress: 0.72 },
  { metric: "Exercise", progress: 0.48 },
  { metric: "Stand", progress: 0.9 }
];

export const goalReadinessProgress: ActivityProgress[] = [
  { metric: "Brief approved", progress: 0 },
  { metric: "QA pass", progress: null },
  { metric: "Rollout cap", progress: 1.18 }
];

export const onboardingProgress = 0.64;
