export type AcquisitionPoint = {
  month: string;
  organic: number;
  paid: number;
};

export type ProfitPoint = {
  month: string;
  profit: number;
};

export type PlatformSharePoint = {
  month: string;
  ios: number;
  android: number;
};

export type CampaignSpendPoint = {
  week: string;
  spend: number;
};

export type SupportVolumePoint = {
  channel: string;
  tickets: number;
};

export const acquisitionByChannel: AcquisitionPoint[] = [
  { month: "Jan", organic: 42, paid: 28 },
  { month: "Feb", organic: 48, paid: 33 },
  { month: "Mar", organic: 54, paid: 39 },
  { month: "Apr", organic: 61, paid: 43 },
  { month: "May", organic: 68, paid: 52 },
  { month: "Jun", organic: 74, paid: 59 }
];

export const monthlyProfit: ProfitPoint[] = [
  { month: "Jan", profit: 18 },
  { month: "Feb", profit: -8 },
  { month: "Mar", profit: 24 },
  { month: "Apr", profit: 31 },
  { month: "May", profit: -12 },
  { month: "Jun", profit: 37 }
];

export const platformShare: PlatformSharePoint[] = [
  { month: "Jan", ios: 62, android: 38 },
  { month: "Feb", ios: 58, android: 42 },
  { month: "Mar", ios: 55, android: 45 },
  { month: "Apr", ios: 59, android: 41 },
  { month: "May", ios: 64, android: 36 },
  { month: "Jun", ios: 67, android: 33 }
];

export const campaignSpend: CampaignSpendPoint[] = [
  { week: "W1", spend: 18 },
  { week: "W2", spend: 22 },
  { week: "W3", spend: 19 },
  { week: "W4", spend: 28 },
  { week: "W5", spend: 31 },
  { week: "W6", spend: 27 },
  { week: "W7", spend: 34 },
  { week: "W8", spend: 39 },
  { week: "W9", spend: 36 },
  { week: "W10", spend: 42 },
  { week: "W11", spend: 45 },
  { week: "W12", spend: 48 },
  { week: "W13", spend: 44 },
  { week: "W14", spend: 52 },
  { week: "W15", spend: 57 },
  { week: "W16", spend: 54 },
  { week: "W17", spend: 61 },
  { week: "W18", spend: 65 }
];

export const supportVolume: SupportVolumePoint[] = [
  { channel: "Chat", tickets: 62 },
  { channel: "Email", tickets: 48 },
  { channel: "Phone", tickets: 37 },
  { channel: "Social", tickets: 28 },
  { channel: "Community", tickets: 18 }
];
