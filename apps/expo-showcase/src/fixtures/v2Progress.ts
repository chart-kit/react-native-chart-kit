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
  { metric: "Build signed", progress: 0.76 },
  { metric: "QA pass", progress: 0 },
  { metric: "Rollout cap", progress: 0.42 }
];

export const onboardingProgress = 0.64;
