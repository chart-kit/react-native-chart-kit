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
