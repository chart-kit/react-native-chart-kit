export type RevenuePoint = {
  month: string;
  actual: number | null;
  forecast?: number | null;
};

export type PricePoint = {
  date: Date;
  price: number | null;
};

export const basicRevenue: RevenuePoint[] = [
  { month: "Jan", actual: 18 },
  { month: "Feb", actual: 34 },
  { month: "Mar", actual: 29 },
  { month: "Apr", actual: 52 },
  { month: "May", actual: 46 },
  { month: "Jun", actual: 68 }
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

export const priceHistory: PricePoint[] = [
  { date: new Date("2026-01-01T00:00:00Z"), price: 121 },
  { date: new Date("2026-01-03T00:00:00Z"), price: 126 },
  { date: new Date("2026-01-08T00:00:00Z"), price: 119 },
  { date: new Date("2026-01-15T00:00:00Z"), price: 134 },
  { date: new Date("2026-01-24T00:00:00Z"), price: 142 },
  { date: new Date("2026-02-01T00:00:00Z"), price: 138 }
];
