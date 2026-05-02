export type RevenuePoint = {
  month: string;
  actual: number | null;
  forecast?: number | null;
};

export type PricePoint = {
  date: Date;
  price: number | null;
};

export type SubscriptionPoint = {
  month: string;
  revenue: number;
  netRetention: number;
};

export const basicRevenue: RevenuePoint[] = [
  { month: "Jan", actual: 18 },
  { month: "Feb", actual: 34 },
  { month: "Mar", actual: 29 },
  { month: "Apr", actual: 52 },
  { month: "May", actual: 46 },
  { month: "Jun", actual: 68 }
];

export const subscriptionMetrics: SubscriptionPoint[] = [
  { month: "Jan", revenue: 124, netRetention: 102 },
  { month: "Feb", revenue: 132, netRetention: 104 },
  { month: "Mar", revenue: 141, netRetention: 106 },
  { month: "Apr", revenue: 146, netRetention: 105 },
  { month: "May", revenue: 158, netRetention: 108 },
  { month: "Jun", revenue: 166, netRetention: 109 },
  { month: "Jul", revenue: 172, netRetention: 111 },
  { month: "Aug", revenue: 181, netRetention: 110 },
  { month: "Sep", revenue: 190, netRetention: 112 },
  { month: "Oct", revenue: 197, netRetention: 113 },
  { month: "Nov", revenue: 205, netRetention: 114 },
  { month: "Dec", revenue: 216, netRetention: 116 }
];

export const multiSeriesRevenue: RevenuePoint[] = [
  { month: "Jan", actual: 22, forecast: 18 },
  { month: "Feb", actual: 31, forecast: 28 },
  { month: "Mar", actual: 38, forecast: 36 },
  { month: "Apr", actual: 44, forecast: 42 },
  { month: "May", actual: 57, forecast: 51 },
  { month: "Jun", actual: 64, forecast: 59 }
];

export const revenueWithGaps: RevenuePoint[] = [
  { month: "Jan", actual: 18 },
  { month: "Feb", actual: null },
  { month: "Mar", actual: 33 },
  { month: "Apr", actual: 41 },
  { month: "May", actual: null },
  { month: "Jun", actual: 62 }
];

export const denseRevenue: RevenuePoint[] = [
  { month: "Week 1", actual: 12 },
  { month: "Week 2", actual: 18 },
  { month: "Week 3", actual: 17 },
  { month: "Week 4", actual: 24 },
  { month: "Week 5", actual: 31 },
  { month: "Week 6", actual: 29 },
  { month: "Week 7", actual: 35 },
  { month: "Week 8", actual: 43 },
  { month: "Week 9", actual: 39 },
  { month: "Week 10", actual: 47 },
  { month: "Week 11", actual: 52 },
  { month: "Week 12", actual: 58 }
];

export const hourlyTraffic: RevenuePoint[] = [
  { month: "00:00", actual: 12 },
  { month: "02:00", actual: 18 },
  { month: "04:00", actual: 17 },
  { month: "06:00", actual: 24 },
  { month: "08:00", actual: 31 },
  { month: "10:00", actual: 29 },
  { month: "12:00", actual: 35 },
  { month: "14:00", actual: 43 },
  { month: "16:00", actual: 39 },
  { month: "18:00", actual: 47 },
  { month: "20:00", actual: 52 },
  { month: "22:00", actual: 58 }
];

export const campaignAttribution: RevenuePoint[] = [
  { month: "Brand Search", actual: 18 },
  { month: "Paid Social", actual: 24 },
  { month: "Lifecycle Email", actual: 31 },
  { month: "Creator Ads", actual: 38 },
  { month: "Partner Webinar", actual: 45 },
  { month: "Retargeting", actual: 51 },
  { month: "Organic SEO", actual: 57 },
  { month: "Marketplace", actual: 64 }
];

export const payrollRunway: RevenuePoint[] = [
  { month: "May Payroll", actual: 18 },
  { month: "Jun Payroll", actual: 25 },
  { month: "Jul Payroll", actual: 33 },
  { month: "Aug Payroll", actual: 41 },
  { month: "Sep Payroll", actual: 52 },
  { month: "Oct Payroll", actual: 61 }
];

export const priceHistory: PricePoint[] = [
  { date: new Date(2026, 0, 1), price: 121 },
  { date: new Date(2026, 0, 3), price: 126 },
  { date: new Date(2026, 0, 8), price: 119 },
  { date: new Date(2026, 0, 15), price: 134 },
  { date: new Date(2026, 0, 24), price: 142 },
  { date: new Date(2026, 1, 1), price: 138 }
];
