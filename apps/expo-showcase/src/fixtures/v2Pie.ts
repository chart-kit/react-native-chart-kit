export type AcquisitionShare = {
  channel: string;
  share: number;
};

export type SubscriptionMix = {
  plan: string;
  revenue: number;
};

export const acquisitionShare: AcquisitionShare[] = [
  { channel: "Organic search", share: 42 },
  { channel: "Paid social", share: 24 },
  { channel: "Referrals", share: 18 },
  { channel: "Partners", share: 10 },
  { channel: "Lifecycle", share: 6 }
];

export const subscriptionMix: SubscriptionMix[] = [
  { plan: "Enterprise", revenue: 680 },
  { plan: "Business", revenue: 420 },
  { plan: "Teams", revenue: 260 },
  { plan: "Starter", revenue: 140 }
];
