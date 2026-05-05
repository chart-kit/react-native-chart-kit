export type RevenueMarginPoint = {
  month: string;
  revenue: number;
  margin: number;
};

export const revenueMargin: RevenueMarginPoint[] = [
  { month: "Jan", revenue: 118, margin: 18 },
  { month: "Feb", revenue: 146, margin: 21 },
  { month: "Mar", revenue: 182, margin: 23 },
  { month: "Apr", revenue: 208, margin: 26 },
  { month: "May", revenue: 236, margin: 28 },
  { month: "Jun", revenue: 274, margin: 31 }
];
